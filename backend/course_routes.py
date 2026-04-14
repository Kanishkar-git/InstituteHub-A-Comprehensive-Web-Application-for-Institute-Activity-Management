import os
from fastapi import APIRouter, HTTPException
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

from models import CourseCreate, CourseResponse

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

@router.post("", response_model=CourseResponse)
async def create_course(course: CourseCreate, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    # Verify the class belongs to the teacher
    class_db = user_client.table("classes").select("id").eq("id", course.class_id).eq("teacher_id", teacher_id).execute()
    if not class_db.data:
        raise HTTPException(status_code=403, detail="Class not found or access denied")

    try:
        new_course = {
            "course_code": course.course_code,
            "course_name": course.course_name,
            "faculty": course.faculty,
            "credits": course.credits,
            "class_id": course.class_id,
            "teacher_id": teacher_id
        }
        
        # Insert Course
        response = user_client.table("courses").insert(new_course).execute()
        created_course = response.data[0]
        course_id = created_course["id"]

        # Fetch students for auto-enrollment
        students_resp = user_client.table("students").select("id").eq("class_id", course.class_id).execute()
        
        if students_resp.data:
            enrollments = [
                {
                    "course_id": course_id,
                    "student_id": s["id"]
                }
                for s in students_resp.data
            ]
            # Bulk insert into course_enrollments
            user_client.table("course_enrollments").insert(enrollments).execute()

        return created_course
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
async def get_all_courses(token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        courses_resp = user_client.table("courses").select("*, classes(class_name, department, section, year)").eq("teacher_id", teacher_id).execute()
        return courses_resp.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/class/{class_id}")
async def get_courses_by_class(class_id: str, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        # Verify class ownership optional depending on strictness, but we can just filter by teacher_id anyway
        courses_resp = user_client.table("courses").select("*").eq("class_id", class_id).eq("teacher_id", teacher_id).execute()
        return courses_resp.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{course_id}")
async def get_course_details(course_id: str, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        courses_resp = user_client.table("courses").select("*").eq("id", course_id).eq("teacher_id", teacher_id).execute()
        if not courses_resp.data:
            raise HTTPException(status_code=404, detail="Course not found")
        return courses_resp.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
