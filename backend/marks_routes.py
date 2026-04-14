import os
import asyncio
import base64
import json
from fastapi import APIRouter, HTTPException, Header
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

from models import MarksSaveRequest

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase_client: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_current_user_id(token: str):
    try:
        # Fast local JWT decode, avoiding a ~300ms network roundtrip. 
        # Token signature and expiration are still cryptographically verified 
        # by Supabase PostgREST during the actual data operations using user_client.
        payload_b64 = token.split('.')[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
        return payload["sub"]
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token format")

def get_user_client(token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    return create_client(SUPABASE_URL, SUPABASE_KEY, options=options)

def calculate_internal_marks(marks_data: dict, credits: int) -> float:
    co_total = sum(filter(None, [
        marks_data.get('co1'),
        marks_data.get('co2'),
        marks_data.get('co3'),
        marks_data.get('co4'),
        marks_data.get('co5')
    ]))
    
    ct1 = marks_data.get('cycle_test1') or 0
    ct2 = marks_data.get('cycle_test2') or 0
    ct3 = marks_data.get('cycle_test3') or 0
    assign = marks_data.get('assignment') or 0
    
    if credits == 4:
        # Internal = (CO_Total / 125 * 20) + (Assign * 0.1) + (CT1 * 0.09) + (CT2 * 0.09) + (CT3 * 0.0625)
        # Assuming Cycle Tests are out of 100.
        co_weightage = (co_total / 125.0 * 20.0) if 125 > 0 else 0
        assign_weightage = assign * 0.1
        ct1_weightage = ct1 * 0.09
        ct2_weightage = ct2 * 0.09
        ct3_weightage = ct3 * 0.0625
        return round(co_weightage + assign_weightage + ct1_weightage + ct2_weightage + ct3_weightage, 2)
    else:
        # If assignment is out of 50, now the total is 100 + 100 + 100 + 50 = 350
        student_total = ct1 + ct2 + ct3 + assign
        return round((student_total / 350.0) * 40.0, 2)

@router.get("/course/{course_id}")
async def get_marks_for_course(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        # Run all three independent fetching tasks concurrently in threadpool
        t1 = asyncio.to_thread(lambda: user_client.table("courses").select("id, credits").eq("id", course_id).eq("teacher_id", teacher_id).execute())
        t2 = asyncio.to_thread(lambda: user_client.table("course_enrollments").select("student_id, students(name, register_no)").eq("course_id", course_id).execute())
        t3 = asyncio.to_thread(lambda: user_client.table("marks").select("*").eq("course_id", course_id).execute())
        
        course_resp, enroll_resp, marks_resp = await asyncio.gather(t1, t2, t3)
        
        if not course_resp.data:
            raise HTTPException(status_code=403, detail="Course not found or access denied")
            
        course_data = course_resp.data[0]
        enrolled_students = enroll_resp.data
        marks_dict = {m["student_id"]: m for m in marks_resp.data}
        
        result = []
        for e in enrolled_students:
            s_id = e["student_id"]
            student_info = e["students"]
            
            # Merge
            student_merge = {
                "student_id": s_id,
                "name": student_info["name"] if student_info else "Unknown",
                "register_no": student_info["register_no"] if student_info else "Unknown",
                "course_id": course_id,
                "co1": "", "co2": "", "co3": "", "co4": "", "co5": "",
                "assignment": "", "cycle_test1": "", "cycle_test2": "", "cycle_test3": "",
                "internal_marks": 0
            }
            
            if s_id in marks_dict:
                existing_marks = marks_dict[s_id]
                for k in ["co1", "co2", "co3", "co4", "co5", "assignment", "cycle_test1", "cycle_test2", "cycle_test3", "internal_marks"]:
                    if existing_marks.get(k) is not None:
                        student_merge[k] = existing_marks[k]
                        
            result.append(student_merge)
            
        # Sort by register number
        result.sort(key=lambda x: str(x["register_no"]))
        
        return {"course": course_data, "students": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("")
async def save_marks(payload: MarksSaveRequest, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    if not payload.marks:
        return {"message": "No marks to save"}
        
    course_id = payload.marks[0].course_id
    
    # Verify ownership and get credits
    course_resp = await asyncio.to_thread(lambda: user_client.table("courses").select("id, credits").eq("id", course_id).eq("teacher_id", teacher_id).execute())
    if not course_resp.data:
        raise HTTPException(status_code=403, detail="Course not found or access denied")
        
    credits = course_resp.data[0]["credits"]
    
    # Prepare upsert data
    upsert_data = []
    for mark_entry in payload.marks:
        m_dict = mark_entry.model_dump(exclude_unset=True)
        # Calculate internal
        internal = calculate_internal_marks(m_dict, credits)
        m_dict["internal_marks"] = internal
        upsert_data.append(m_dict)
        
    try:
        await asyncio.to_thread(lambda: user_client.table("marks").upsert(upsert_data, on_conflict="student_id, course_id").execute())
        return {"message": "Marks saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
