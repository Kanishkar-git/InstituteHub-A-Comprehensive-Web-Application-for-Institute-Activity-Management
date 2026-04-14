import os
from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from typing import List

from models import ClassCreate, ClassResponse

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

@router.post("", response_model=ClassResponse)
async def create_class(class_data: ClassCreate, token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    # Optional: Verify if the user is actually a teacher
    user_db = supabase_client.table("users").select("role").eq("id", teacher_id).execute()
    if not user_db.data or user_db.data[0]['role'].lower() != 'teacher':
        raise HTTPException(status_code=403, detail="Only teachers can create classes")

    try:
        new_class = {
            "class_name": class_data.class_name,
            "year": class_data.year,
            "department": class_data.department,
            "section": class_data.section,
            "semester": class_data.semester,
            "teacher_id": teacher_id
        }
        
        response = user_client.table("classes").insert(new_class).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[ClassResponse])
async def get_teacher_classes(token: str):
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        # Fetch classes
        classes_response = user_client.table("classes").select("*").eq("teacher_id", teacher_id).execute()
        classes = classes_response.data
        
        # Get student counts for each class
        for cls in classes:
            # We fetch count of students. Count requires specific syntax via the python client if supported,
            # or we just fetch students and get length (fine for small rosters, but ideally use count via API)
            count_response = user_client.table("students").select("id", count="exact").eq("class_id", cls["id"]).execute()
            cls["student_count"] = count_response.count if count_response.count is not None else len(count_response.data)
            
        return classes
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
