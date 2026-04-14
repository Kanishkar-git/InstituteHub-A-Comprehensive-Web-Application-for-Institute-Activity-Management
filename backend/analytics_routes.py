import os
import asyncio
import base64
import json
from fastapi import APIRouter, HTTPException, Header
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
from ml_service import run_predictive_analytics

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_current_user_id(token: str):
    try:
        payload_b64 = token.split('.')[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token format")

def get_user_client(token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    return create_client(SUPABASE_URL, SUPABASE_KEY, options=options)

async def prefetch_course_and_marks(course_id: str, teacher_id: str, user_client: Client):
    t1 = asyncio.to_thread(lambda: user_client.table("courses").select("id, credits").eq("id", course_id).eq("teacher_id", teacher_id).execute())
    t2 = asyncio.to_thread(lambda: user_client.table("marks").select("*, students(name, register_no)").eq("course_id", course_id).execute())
    
    course_resp, marks_resp = await asyncio.gather(t1, t2)
    
    if not course_resp.data:
        raise HTTPException(status_code=403, detail="Course not found or access denied")
        
    return course_resp.data[0], marks_resp.data

@router.get("/summary/{course_id}")
async def get_analytics_summary(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        course, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        total_students = len(marks)
        if total_students == 0:
            return {"total_students": 0, "class_average": 0, "pass_percentage": 0, "highest_score": 0}
            
        internal_marks = [m.get("internal_marks", 0) for m in marks]
        class_average = sum(internal_marks) / total_students
        highest_score = max(internal_marks)
        
        pass_threshold = 25 if course["credits"] == 4 else 20
        passed_students = sum(1 for m in internal_marks if m >= pass_threshold)
        pass_percentage = (passed_students / total_students) * 100
        
        return {
            "total_students": total_students,
            "class_average": round(class_average, 2),
            "pass_percentage": round(pass_percentage, 1),
            "highest_score": round(highest_score, 2),
            "credits": course["credits"]
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/co-attainment/{course_id}")
async def get_co_attainment(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        _, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        if not marks:
            return []

        counts = {"co1": 0, "co2": 0, "co3": 0, "co4": 0, "co5": 0}
        sums = {"co1": 0, "co2": 0, "co3": 0, "co4": 0, "co5": 0}

        for m in marks:
            for co in ["co1", "co2", "co3", "co4", "co5"]:
                val = m.get(co)
                if val is not None:
                    sums[co] += val
                    counts[co] += 1

        attainment = []
        for co in ["co1", "co2", "co3", "co4", "co5"]:
            # COs are out of 25 right now mapping to 100%
            avg = (sums[co] / counts[co]) if counts[co] > 0 else 0
            percentage = (avg / 25.0) * 100 if avg > 0 else 0
            attainment.append({
                "subject": co.upper(),
                "A": round(percentage, 1),
                "fullMark": 100
            })
            
        return attainment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/marks-distribution/{course_id}")
async def get_marks_distribution(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        course, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        distribution = {"90-100%": 0, "80-89%": 0, "70-79%": 0, "60-69%": 0, "Below 60%": 0}
        max_internal = 50 if course["credits"] == 4 else 40
        
        for m in marks:
            score = m.get("internal_marks", 0)
            percentage = (score / max_internal) * 100 if max_internal > 0 else 0
            
            if percentage >= 90: distribution["90-100%"] += 1
            elif percentage >= 80: distribution["80-89%"] += 1
            elif percentage >= 70: distribution["70-79%"] += 1
            elif percentage >= 60: distribution["60-69%"] += 1
            else: distribution["Below 60%"] += 1
            
        result = [{"name": k, "value": v} for k, v in distribution.items() if v > 0]
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/student-trends/{course_id}")
async def get_student_trends(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        _, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        if not marks:
            return []

        counts = {"ct1": 0, "ct2": 0, "ct3": 0, "assign": 0}
        sums = {"ct1": 0, "ct2": 0, "ct3": 0, "assign": 0}

        for m in marks:
            for key, db_key in [("ct1", "cycle_test1"), ("ct2", "cycle_test2"), ("ct3", "cycle_test3"), ("assign", "assignment")]:
                val = m.get(db_key)
                if val is not None:
                    sums[key] += val
                    counts[key] += 1
                    
        return [
            {"name": "CT1", "average": round(sums["ct1"] / counts["ct1"], 1) if counts["ct1"] > 0 else 0},
            {"name": "CT2", "average": round(sums["ct2"] / counts["ct2"], 1) if counts["ct2"] > 0 else 0},
            {"name": "CT3", "average": round(sums["ct3"] / counts["ct3"], 1) if counts["ct3"] > 0 else 0},
            {"name": "Assignment", "average": round((sums["assign"] / counts["assign"]) * 2, 1) if counts["assign"] > 0 else 0} # Normalizing assign (50) to 100 for trend visual parity
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/top-students/{course_id}")
async def get_top_students(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        _, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        # Sort by internal_marks descending
        sorted_marks = sorted(marks, key=lambda x: x.get("internal_marks", 0), reverse=True)
        top_5 = sorted_marks[:5]
        
        result = []
        for i, m in enumerate(top_5):
            student_info = m.get("students")
            # Calculate CO average out of 25
            co_vals = [m.get(c) for c in ["co1", "co2", "co3", "co4", "co5"] if m.get(c) is not None]
            co_avg = round(sum(co_vals) / len(co_vals), 1) if co_vals else 0
            
            result.append({
                "rank": i + 1,
                "name": student_info["name"] if student_info else "Unknown",
                "register_no": student_info["register_no"] if student_info else "Unknown",
                "internal_marks": m.get("internal_marks", 0),
                "co_avg": co_avg
            })
            
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/weak-students/{course_id}")
async def get_weak_students(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        course, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        credits = course["credits"]
        # Determine thresholds
        # students who have internal less than 20 are weak
        # Using 20 as absolute weak threshold as user mentioned "Students who have internal less than 20 are weak student"
        weak_threshold = 20
        
        weak_students = []
        for m in marks:
            internal = m.get("internal_marks", 0)
            if internal <= weak_threshold:
                student_info = m.get("students")
                
                # Determine risk level
                risk = "Red" if internal < 15 else "Yellow" 
                
                weak_students.append({
                    "name": student_info["name"] if student_info else "Unknown",
                    "register_no": student_info["register_no"] if student_info else "Unknown",
                    "internal_marks": internal,
                    "risk_level": risk
                })
                
        # Sort by lowest marks first
        weak_students.sort(key=lambda x: x["internal_marks"])
        return weak_students
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/predictive-analytics/{course_id}")
async def get_predictive_analytics(course_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    teacher_id = get_current_user_id(token)
    user_client = get_user_client(token)
    
    try:
        course, marks = await prefetch_course_and_marks(course_id, teacher_id, user_client)
        
        pass_threshold = 25 if course["credits"] == 4 else 20
        
        # Fetch all marks across the platform for historical training data
        all_marks_resp = await asyncio.to_thread(lambda: user_client.table("marks").select("*").execute())
        all_marks = all_marks_resp.data

        # We process the raw marks data through Data Science models
        analytics_result = run_predictive_analytics(marks, all_marks, pass_threshold)
        
        if "error" in analytics_result:
            return {"error": analytics_result["error"]}
            
        return analytics_result
        
    except Exception as e:
        import traceback
        print(f"Error in predicting analytics: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attendance-scatter/{course_id}")
async def get_attendance_scatter(course_id: str, authorization: str = Header(...)):
    # Mock data for demonstration
    import random
    data = []
    for i in range(40):
        attendance = random.randint(50, 100)
        # Marks are loosely correlated to attendance
        marks = min(50, max(0, int((attendance / 100) * 50 * random.uniform(0.7, 1.2))))
        data.append({
            "id": i,
            "name": f"Student {i+1}",
            "attendance": attendance,
            "marks": marks
        })
    return data

@router.get("/topic-heatmap/{course_id}")
async def get_topic_heatmap(course_id: str, authorization: str = Header(...)):
    # Mock data for demonstration
    return [
        {"topic": "Q1: DB Normalization", "averageScore": 45},
        {"topic": "Q2: SQL Joins", "averageScore": 85},
        {"topic": "Q3: Indexing", "averageScore": 62},
        {"topic": "Q4: Transactions", "averageScore": 38},
        {"topic": "Q5: Stored Procedures", "averageScore": 76},
    ]

@router.get("/predictive-trajectory/{course_id}")
async def get_predictive_trajectory(course_id: str, authorization: str = Header(...)):
    # Mock data for demonstration
    return [
        {"assessment": "CT1", "actual": 65, "predicted": None},
        {"assessment": "CT2", "actual": 72, "predicted": None},
        {"assessment": "CT3", "actual": 68, "predicted": None},
        {"assessment": "Final", "actual": None, "predicted": 75},
    ]

@router.get("/cohort-comparison/{course_id}")
async def get_cohort_comparison(course_id: str, authorization: str = Header(...)):
    # Mock data for demonstration
    return [
        {"assessment": "CT1", "currentBatch": 68, "previousBatch": 65},
        {"assessment": "CT2", "currentBatch": 72, "previousBatch": 70},
        {"assessment": "CT3", "currentBatch": 75, "previousBatch": 78},
        {"assessment": "Assignment", "currentBatch": 82, "previousBatch": 80},
    ]
