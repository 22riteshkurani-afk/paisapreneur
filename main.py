"""Paisapreneur AI — Multi-Agent SaaS Platform."""

import json
import logging
import os
import time
import uuid
from collections import defaultdict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware

from config import settings
from database import get_db, init_db, User, ChatHistory
from models import (
    AISuggestionRequest,
    AISuggestionResponse,
    BlueprintResponse,
    HealthResponse,
    ResumeData,
    ResumeSaveResponse,
    Agent1Output,
    Agent2Output,
    Agent3Output,
    ChatRequest,
    ChatResponse
)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("paisapreneur")

# ── App & Auth ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Paisapreneur AI Framework",
    description="Multi-agent business engine with AI Mentor",
    version="4.0.0",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "paisapreneur_secret_2026")
)

oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

genai.configure(api_key=settings.GOOGLE_API_KEY)

RESUME_DIR = Path("data/resumes")
RESUME_DIR.mkdir(parents=True, exist_ok=True)

_cache: dict[str, tuple[float, dict]] = {}
_rate_limits: dict[str, list[float]] = defaultdict(list)

# ── Multi-Agent Prompts ──────────────────────────────────────────────────────

AGENT1_PROMPT = """You are Agent 1 (Idea Validator) for Paisapreneur.
The user's niche is: {industry}

Generate a clear, validated business model optimized for speed to revenue.
Return ONLY valid JSON:
{{
    "business_name": "Catchy name",
    "tagline": "One-line pitch",
    "business_model": "Describe in 2-3 sentences",
    "value_proposition": "What makes it unique",
    "target_audience": "Specific audience in India",
    "problem_solved": "Exact pain point",
    "solution": "How this solves it"
}}
"""

AGENT2_PROMPT = """You are Agent 2 (Revenue Planner) for Paisapreneur.
Based on this business model:
{agent1_data}

Generate a robust revenue plan.
Return ONLY valid JSON:
{{
    "revenue_streams": [
        {{"source": "Primary", "model": "How it makes money", "expected_monthly": "₹ amount"}},
        {{"source": "Secondary", "model": "How it makes money", "expected_monthly": "₹ amount"}}
    ],
    "pricing_strategy": "Specific pricing strategy",
    "break_even_estimate": "Estimated months to break even"
}}
"""

AGENT3_PROMPT = """You are Agent 3 (Execution Coach) for Paisapreneur.
Based on:
Model: {agent1_data}
Revenue: {agent2_data}

Generate an actionable 30-day timeline and execution strategy.
Return ONLY valid JSON:
{{
    "acquisition_channels": ["Channel 1", "Channel 2"],
    "first_100_customers": "Step-by-step plan",
    "growth_hack": "Unconventional trick",
    "timeline": [
        {{"week": "Week 1", "tasks": ["Task 1", "Task 2"]}},
        {{"week": "Week 2", "tasks": ["Task 1", "Task 2"]}},
        {{"week": "Week 3", "tasks": ["Task 1"]}},
        {{"week": "Week 4", "tasks": ["Task 1"]}}
    ],
    "tools": {{
        "Website": "Tool name",
        "Payment Gateway": "Tool name",
        "Marketing": "Tool name"
    }},
    "estimated_startup_cost": "₹ range",
    "key_risk": "Biggest risk",
    "mitigation": "How to mitigate"
}}
"""

MENTOR_PROMPT = """You are Agent 4 (AI Mentor) for Paisapreneur.
You act as a personalized execution coach for the user. Be concise, actionable, and encouraging.

User's current blueprint context:
{blueprint_context}

Previous conversation history:
{history_context}

User's new question:
{message}

Provide a direct, high-value answer. NO markdown wrapping around the whole response, just text formatting where appropriate.
"""


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    max_req = settings.RATE_LIMIT_MAX_REQUESTS

    _rate_limits[client_ip] = [ts for ts in _rate_limits[client_ip] if now - ts < window]

    if len(_rate_limits[client_ip]) >= max_req:
        logger.warning("Rate limit exceeded for %s", client_ip)
        raise HTTPException(status_code=429, detail="Rate limit exceeded.")

    _rate_limits[client_ip].append(now)


# ── Auth & Users ─────────────────────────────────────────────────────────────

def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Fetch current user from session and DB."""
    session_user = request.session.get("user")
    if not session_user:
        return None
    user = db.query(User).filter(User.email == session_user.get("email")).first()
    return user


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    user = request.session.get("user")
    if user:
        return RedirectResponse("/dashboard")
    with open("login.html") as f:
        return f.read()


@app.get("/login/google")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token['userinfo']
    
    # Save/Update user in DB
    user = db.query(User).filter(User.email == user_info['email']).first()
    if not user:
        user = User(email=user_info['email'], name=user_info['name'], tier='free')
        db.add(user)
        db.commit()
        db.refresh(user)
    
    request.session['user'] = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user_info.get('picture', ''),
        "tier": user.tier
    }
    return RedirectResponse("/dashboard")


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if not user:
        return RedirectResponse("/login")
    
    session_user = request.session.get("user")
    
    return f"""
    <html>
    <body style="font-family:Arial;text-align:center;padding:50px;background:#0A0A0A;color:white">
        <img src="{session_user.get('picture', '')}" width="80" style="border-radius:50%"><br><br>
        <h2>Welcome, {user.name}! 👋</h2>
        <p style="color:#C9A84C">{user.email}</p>
        <p>Your Tier: <strong style="color:var(--accent-mid)">{user.tier.upper()}</strong></p>
        <div style="margin:20px;display:flex;gap:15px;justify-content:center;">
            <a href="/" style="padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:5px;">Go to App</a>
            <a href="/logout" style="padding:10px 20px;background:#ef4444;color:white;text-decoration:none;border-radius:5px;">Logout</a>
        </div>
    </body>
    </html>
    """

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login")


# ── Multi-Agent API Routes ───────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def home():
    return FileResponse("static/index.html")

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", version="4.0.0")

def _parse_json(text: str) -> dict:
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

@app.get("/generate", response_model=BlueprintResponse, tags=["engine"])
def generate_blueprint(request: Request, industry: str = Query(..., min_length=2, max_length=100)):
    """Chained Multi-Agent Generation"""
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    # Note: Temporarily removing auth check to allow easy testing without google oauth properly set up.
    # We will assume a mock user if none exists in session for this demo.
    
    industry = industry.strip()
    logger.info(f"Generating chained blueprint for: {industry}")

    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        # AGENT 1: Validator
        res1 = model.generate_content(AGENT1_PROMPT.format(industry=industry))
        data1 = _parse_json(res1.text)
        Agent1Output(**data1) # Validate

        # AGENT 2: Revenue
        res2 = model.generate_content(AGENT2_PROMPT.format(agent1_data=json.dumps(data1)))
        data2 = _parse_json(res2.text)
        Agent2Output(**data2) # Validate

        # AGENT 3: Execution
        res3 = model.generate_content(AGENT3_PROMPT.format(
            agent1_data=json.dumps(data1),
            agent2_data=json.dumps(data2)
        ))
        data3 = _parse_json(res3.text)
        Agent3Output(**data3) # Validate

        # Combine
        combined = {**data1, **data2, **data3, "niche": industry}
        return BlueprintResponse(**combined)

    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Agents returned invalid JSON.")
    except Exception as e:
        logger.error(f"Agent Chain Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate blueprint via Agent Chain.")


@app.post("/api/chat", response_model=ChatResponse, tags=["engine"])
def ai_mentor_chat(request: Request, payload: ChatRequest, db: Session = Depends(get_db)):
    """AI Mentor Agent with persistent memory."""
    # Mocking user ID for demo purposes if not logged in
    session_user = request.session.get("user")
    user_id = session_user["id"] if session_user else 1 
    
    # 1. Fetch History
    history = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).order_by(ChatHistory.timestamp.asc()).all()
    history_last_5 = history[-5:]
    
    context_str = "\n".join([f"User: {h.message}\nMentor: {h.response}" for h in history_last_5])
    
    # 2. Check Monetization limit logic (Basic Free = max 5 msgs, 499 = max 50 msgs, 999 = unlimited)
    # Simplified mock check for demonstration
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.tier == "free" and len(history) >= 20: 
         return ChatResponse(reply="🔒 You've reached the free AI Mentor limit. Upgrade to Elite (₹999) to unlock unlimited personalized mentoring and deep execution strategies.")

    # 3. Call Agent 4
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = MENTOR_PROMPT.format(
            blueprint_context=payload.blueprint_context,
            history_context=context_str if context_str else "No prior history.",
            message=payload.message
        )
        response = model.generate_content(prompt)
        reply_text = response.text.strip()
        
        # 4. Save to DB
        chat_entry = ChatHistory(user_id=user_id, message=payload.message, response=reply_text)
        db.add(chat_entry)
        db.commit()
        
        return ChatResponse(reply=reply_text)
        
    except Exception as e:
        logger.error(f"AI Mentor Error: {e}")
        raise HTTPException(status_code=500, detail="The AI Mentor is currently unavailable.")

# Initialize DB on load
init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)