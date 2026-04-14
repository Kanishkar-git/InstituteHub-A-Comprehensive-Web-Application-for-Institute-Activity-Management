from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str

# Class Management Models
class ClassCreate(BaseModel):
    class_name: str
    year: int
    department: str
    section: str
    semester: int

class ClassResponse(BaseModel):
    id: str
    class_name: str
    year: int
    department: str
    section: str
    semester: int
    teacher_id: str
    created_at: datetime
    student_count: Optional[int] = 0

# Student Management Models
class StudentCreate(BaseModel):
    name: str
    register_no: str
    email: EmailStr
    class_id: str

class StudentResponse(BaseModel):
    id: str
    name: str
    register_no: str
    email: str
    class_id: str
    created_at: datetime

# Course Management Models
class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    faculty: str
    credits: int
    class_id: str

class CourseResponse(BaseModel):
    id: str
    course_code: str
    course_name: str
    faculty: str
    credits: int
    class_id: str
    teacher_id: str
    created_at: datetime

# Marks Management Models
class MarkEntry(BaseModel):
    student_id: str
    course_id: str
    co1: Optional[int] = None
    co2: Optional[int] = None
    co3: Optional[int] = None
    co4: Optional[int] = None
    co5: Optional[int] = None
    assignment: Optional[int] = None
    cycle_test1: Optional[float] = None
    cycle_test2: Optional[float] = None
    cycle_test3: Optional[float] = None

class MarksSaveRequest(BaseModel):
    marks: List[MarkEntry]
