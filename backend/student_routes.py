import os
import io
import pandas as pd
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from typing import List

from models import StudentCreate, StudentResponse

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase_client: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_current_user_id(token: str):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    try:
        user_response = supabase_client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_user_client(token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    return create_client(SUPABASE_URL, SUPABASE_KEY, options=options)

def auto_enroll_student_in_courses(user_client: Client, class_id: str, student_id: str):
    try:
        # Fetch all courses for this class
        courses_resp = user_client.table("courses").select("id").eq("class_id", class_id).execute()
        if courses_resp.data:
            enrollments = [{"course_id": c["id"], "student_id": student_id} for c in courses_resp.data]
            user_client.table("course_enrollments").insert(enrollments).execute()
    except Exception as e:
        print(f"Failed to auto-enroll student {student_id} into courses for class {class_id}: {e}")


@router.post("", response_model=StudentResponse)
async def add_student(student: StudentCreate, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    # Verify the class belongs to the teacher
    class_db = user_client.table("classes").select("id").eq("id", student.class_id).eq("teacher_id", teacher_id).execute()
    if not class_db.data:
        raise HTTPException(status_code=403, detail="Class not found or access denied")

    try:
        new_student = {
            "name": student.name,
            "register_no": student.register_no,
            "email": student.email,
            "class_id": student.class_id
        }
        
        response = user_client.table("students").insert(new_student).execute()
        created_student = response.data[0]
        
        # Auto-enroll in existing courses for this class
        auto_enroll_student_in_courses(user_client, student.class_id, created_student["id"])
        
        return created_student
    except Exception as e:
        # Check for unique constraint violation on email or register_no
        if "duplicate key value" in str(e).lower():
            raise HTTPException(status_code=400, detail="Student with this Register No or Email already exists.")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload")
async def upload_students(class_id: str = Form(...), token: str = Form(...), file: UploadFile = File(...)):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    # Verify the class belongs to the teacher
    class_db = user_client.table("classes").select("id").eq("id", class_id).eq("teacher_id", teacher_id).execute()
    if not class_db.data:
        raise HTTPException(status_code=403, detail="Class not found or access denied")

    # Read the excel file
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Expected columns: Name, Register No, Email
        # We perform case-insensitive checking and stripping
        df.columns = df.columns.astype(str).str.strip().str.lower()
        
        name_col = next((col for col in df.columns if 'name' in col), None)
        reg_col = next((col for col in df.columns if 'register' in col or 'reg' in col), None)
        email_col = next((col for col in df.columns if 'email' in col), None)

        if not all([name_col, reg_col, email_col]):
            required_cols = "Name, Register No, Email"
            raise HTTPException(status_code=400, detail=f"Missing required columns. Found: {list(df.columns)}. Required: {required_cols}")

        students_inserted = 0
        errors = []

        for index, row in df.iterrows():
            name = str(row[name_col]).strip()
            register_no = str(row[reg_col]).strip()
            email = str(row[email_col]).strip()
            
            # Skip empty rows
            if pd.isna(row[name_col]) or not email:
                continue

            new_student = {
                "name": name,
                "register_no": register_no,
                "email": email,
                "class_id": class_id
            }
            
            try:
                response = user_client.table("students").insert(new_student).execute()
                created_student = response.data[0]
                auto_enroll_student_in_courses(user_client, class_id, created_student["id"])
                students_inserted += 1
            except Exception as e:
                # Log duplicates but continue insertion
                errors.append(f"Row {index + 2} ({name}): Failed. Might be duplicate register no/email. Error: {str(e)}")

        return {
            "message": f"Successfully imported {students_inserted} students.",
            "errors": errors if errors else None
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to process file: " + str(e))


@router.get("/class/{class_id}")
async def get_students_by_class(class_id: str, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    # Verify the class belongs to the teacher
    class_db = user_client.table("classes").select("id").eq("id", class_id).eq("teacher_id", teacher_id).execute()
    if not class_db.data:
        raise HTTPException(status_code=403, detail="Class not found or access denied")

    try:
        students_response = user_client.table("students").select("*").eq("class_id", class_id).execute()
        return students_response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
        
@router.get("/profile")
async def get_student_auth_profile(token: str):
    """
    Called by Student Dashboard to automatically fetch the mapped
    class information based on their authenticated email.
    """
    user_response = supabase_client.auth.get_user(token)
    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    student_email = user_response.user.email
    
    try:
        # Mapped student lookup using Supabase nested select (join)
        student_data = supabase_client.table("students") \
            .select("*, classes(class_name, year, department, section)") \
            .eq("email", student_email) \
            .execute()
            
        if not student_data.data:
            return None # Not mapped yet
            
        return student_data.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to lookup mapping: "+str(e))

@router.delete("/{student_id}")
async def remove_student(student_id: str, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        student_resp = user_client.table("students").select("class_id").eq("id", student_id).execute()
        if not student_resp.data:
            raise HTTPException(status_code=404, detail="Student not found")
            
        class_id = student_resp.data[0]["class_id"]
        class_db = user_client.table("classes").select("id").eq("id", class_id).eq("teacher_id", teacher_id).execute()
        if not class_db.data:
            raise HTTPException(status_code=403, detail="Access denied")
            
        user_client.table("students").delete().eq("id", student_id).execute()
        return {"message": "Student mapping removed successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
