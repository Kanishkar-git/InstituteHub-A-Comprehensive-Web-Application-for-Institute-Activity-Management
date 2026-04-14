from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import os
from dotenv import load_dotenv
load_dotenv()

try:
    from groq import Groq
except ImportError:
    Groq = None

router = APIRouter()

class AIChatRequest(BaseModel):
    query: str
    context: Dict[str, Any]

SYSTEM_PROMPT = """You are an intelligent AI Teaching Assistant integrated inside an Educational Analytics Dashboard.
Your role is to help teachers understand student performance, analytics, and insights based on real-time dashboard data.

RESPONSE STYLE:
- Clear and concise
- Professional but friendly
- Use bullet points
- Avoid technical jargon unless asked
- Always give actionable insights

RESPONSE FORMAT:
1. Short summary
2. Key reasons (bullet points)
3. Action suggestions

DO NOT:
- Give generic answers
- Ignore dashboard data
- Be vague

ALWAYS:
- Use available data
- Be specific
- Help teacher take action
"""

@router.post("/chat")
async def ask_ai(request: AIChatRequest):
    if Groq is None:
        # Fallback if package is not installed
        return {"response": "I am operating in fallback mode. To enable full AI capabilities, please install the `groq` package and configure your GROQ_API_KEY."}
        
    api_key = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")
    if api_key == "YOUR_GROQ_API_KEY" or not api_key:
        # Mock response if API key is not configured
        mock_response = f"I see you're asking about {request.query}. Without a valid GROQ_API_KEY, I can tell you that {request.context.get('student', 'the student')} is currently performing at an internal score of {request.context.get('internal', 'unknown')}.\n\n* Please configure your GROQ_API_KEY to receive full insights."
        return {"response": mock_response}

    try:
        client = Groq(api_key=api_key)
        
        context_str = "\n".join([f"{k}: {v}" for k, v in request.context.items()])
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{request.query}\n\nData Context:\n{context_str}"}
            ]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
