from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth_routes import router as auth_router
from class_routes import router as class_router
from student_routes import router as student_router
from course_routes import router as course_router
from marks_routes import router as marks_router
from analytics_routes import router as analytics_router

app = FastAPI(title="Student Learning Outcome Analytics Platform API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(class_router, prefix="/api/classes")
app.include_router(student_router, prefix="/api/students")
app.include_router(course_router, prefix="/api/courses")
app.include_router(marks_router, prefix="/api/marks")
app.include_router(analytics_router, prefix="/api/analytics")
from ai_routes import router as ai_router
app.include_router(ai_router, prefix="/api/ai")

@app.get("/")
def read_root():
    # Health check endpoint
    return {"message": "Welcome to Student Learning Outcome Analytics Platform API"}
