import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from models import UserRegister, UserLogin, UserProfile

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: Supabase credentials not found in environment variables.")

# Create the supabase client
supabase_client: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.post("/register")
async def register(user: UserRegister):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    # Register user with Supabase Auth
    try:
        response = supabase_client.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "name": user.name,
                    "role": user.role
                }
            }
        })
        
        # User details are automatically inserted to public.users via Supabase trigger (see setup_database.sql)
        # We can also explicitly insert here if not using a trigger, but trigger is cleaner.
        
        return {"message": "User registered successfully", "user": response.user.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(user: UserLogin):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        
        return {
            "access_token": response.session.access_token,
            "user": response.user.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid credentials or " + str(e))

@router.get("/profile", response_model=UserProfile)
async def get_profile(token: str):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        # Get user from token
        user_response = supabase_client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user_id = user_response.user.id
        
        # Fetch role and additional details from the users table
        db_response = supabase_client.table("users").select("*").eq("id", user_id).execute()
        
        if not db_response.data:
            raise HTTPException(status_code=404, detail="User profile not found in database")
            
        user_data = db_response.data[0]
        return UserProfile(**user_data)
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(token: str):
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    try:
        supabase_client.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
