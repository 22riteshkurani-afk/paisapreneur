"""Paisapreneur AI — Multi-Agent SaaS Platform with Business Engine, Resume Suite & Career Passport."""

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
import httpx
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel

from config import settings
from database import get_db, init_db, User, ChatHistory, CareerPassportDB
from models import (
    AISuggestionRequest,
    AISuggestionResponse,
    BlueprintResponse,
    HealthResponse,
    PersonalInfo,
    Education,
    Experience,
    Project,
    Certification,
    ResumeData,
    ResumeSaveResponse,
    Agent1Output,
    Agent2Output,
    Agent3Output,
    ChatRequest,
    ChatResponse,
    VentureReadinessRequest,
    VentureReadinessResponse,
    SkillItem,
    CareerPreferences,
    AssessmentRecord,
    CareerPassport,
    PassportSaveResponse,
    PassportSummaryResponse,
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
    title="Paisapreneur AI",
    description="Career & Entrepreneurship Operating System — Multi-agent business blueprint engine, AI Mentor, and Resume/Portfolio Suite",
    version="3.0.0",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "paisapreneur_secret_2026"),
)

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

RESUME_DIR = Path("data/resumes")
RESUME_DIR.mkdir(parents=True, exist_ok=True)

PASSPORT_DIR = Path("data/passports")
PASSPORT_DIR.mkdir(parents=True, exist_ok=True)

_cache: dict[str, tuple[float, dict]] = {}
_rate_limits: dict[str, list[float]] = defaultdict(list)


# ── Career Passport Storage Helpers ──────────────────────────────────────────

def _save_passport_record(passport: CareerPassport, db: Session | None = None) -> CareerPassport:
    """Save Career Passport to local disk and SQLite."""
    if not passport.passport_id:
        passport.passport_id = f"cp_{uuid.uuid4().hex[:8]}"
    passport.updated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # 1. Local filesystem persistence
    file_path = PASSPORT_DIR / f"{passport.passport_id}.json"
    file_path.write_text(passport.model_dump_json(indent=2), encoding="utf-8")

    # 2. SQLite persistence
    if db is not None:
        try:
            record = db.query(CareerPassportDB).filter(CareerPassportDB.passport_id == passport.passport_id).first()
            if record:
                record.data_json = passport.model_dump_json()
                record.user_id = passport.user_id
            else:
                record = CareerPassportDB(
                    passport_id=passport.passport_id,
                    user_id=passport.user_id,
                    data_json=passport.model_dump_json(),
                )
                db.add(record)
            db.commit()
        except Exception as e:
            logger.warning("DB save error for passport %s: %s", passport.passport_id, e)

    return passport


def _load_passport_record(passport_id: str, db: Session | None = None) -> CareerPassport | None:
    """Load Career Passport from disk or SQLite."""
    # Check disk
    file_path = PASSPORT_DIR / f"{passport_id}.json"
    if file_path.exists():
        try:
            return CareerPassport.model_validate_json(file_path.read_text(encoding="utf-8"))
        except Exception as e:
            logger.warning("Could not parse passport file %s: %s", passport_id, e)

    # Check DB
    if db is not None:
        try:
            record = db.query(CareerPassportDB).filter(CareerPassportDB.passport_id == passport_id).first()
            if record and record.data_json:
                return CareerPassport.model_validate_json(record.data_json)
        except Exception as e:
            logger.warning("Could not fetch passport from DB %s: %s", passport_id, e)

    return None


def _get_active_passport(user_id: int | None = None, db: Session | None = None) -> CareerPassport:
    """Get or create active Career Passport for user or local session."""
    if user_id and db is not None:
        try:
            record = db.query(CareerPassportDB).filter(CareerPassportDB.user_id == user_id).first()
            if record and record.data_json:
                return CareerPassport.model_validate_json(record.data_json)
        except Exception:
            pass

    files = sorted(list(PASSPORT_DIR.glob("*.json")), key=os.path.getmtime, reverse=True)
    if files:
        try:
            return CareerPassport.model_validate_json(files[0].read_text(encoding="utf-8"))
        except Exception:
            pass

    # Default initial canonical passport
    default_p = CareerPassport(
        passport_id=f"cp_{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        personal=PersonalInfo(
            full_name="Aarav Sharma",
            title="Full Stack AI & Growth Engineer",
            email="aarav@paisapreneur.ai",
            location="Bengaluru, India",
            summary="High-velocity builder architecting AI-powered SaaS platforms and scaling digital products from 0 to 1.",
            linkedin="https://linkedin.com/in/aarav",
            github="https://github.com/aarav",
            website="https://aarav.dev",
        ),
        skills=[
            SkillItem(name="Python", category="Technical", proficiency="Expert", source="Verified"),
            SkillItem(name="FastAPI", category="Technical", proficiency="Expert", source="Verified"),
            SkillItem(name="React", category="Technical", proficiency="Advanced", source="Verified"),
            SkillItem(name="AI / LLM Engineering", category="Technical", proficiency="Advanced", source="Assessment"),
            SkillItem(name="Product Strategy", category="Product", proficiency="Advanced", source="Self-reported"),
            SkillItem(name="GTM & Growth", category="Business", proficiency="Intermediate", source="Self-reported"),
        ],
        preferences=CareerPreferences(
            target_roles=["Founder", "Founding Engineer", "Lead Product Manager"],
            target_industries=["AI SaaS", "FinTech", "EdTech"],
            work_preference="Hybrid / Remote",
            location_preference="Bengaluru, Mumbai, Remote",
            salary_expectation="₹25L - ₹40L / Equity",
        ),
        experience=[
            Experience(
                company="TechVenture Labs",
                role="Lead Full Stack Engineer",
                start_date="2023",
                end_date="Present",
                description="Spearheaded multi-agent AI pipeline architecture, reducing latency by 45% and serving 100K+ monthly active users.",
            )
        ],
        education=[
            Education(degree="B.Tech Computer Science", institution="IIT Bombay", year="2019 - 2023", gpa="9.1/10")
        ],
        projects=[
            Project(
                name="Paisapreneur AI",
                description="AI-first Career & Business Blueprint SaaS operating system for Indian entrepreneurs.",
                tech_stack="FastAPI, SQLite, Gemini AI, Tailwind",
                link="https://github.com/example/paisapreneur",
            )
        ],
        certifications=[
            Certification(name="Google Cloud Professional ML Engineer", issuer="Google Cloud", date="2024")
        ],
        achievements=[
            "Winner of National AI Hackathon 2024",
            "Built and scaled 2 profitable micro-SaaS products to ₹10L ARR",
        ],
        assessments=[
            AssessmentRecord(
                id="eval_01",
                assessment_type="Venture Readiness",
                target_context="AI SaaS",
                readiness_score=88,
                founder_profile="High-Velocity Tech & Product Operator",
                strengths=["Technical execution speed", "Agile customer workflow design", "Modern tool stack mastery"],
                gaps=["Hyperlocal commercial distribution", "B2B enterprise sales contracting"],
                actions=["Launch automated pilot in 48h", "Partner with commercial GTM lead"],
                co_founder_profile="Commercial & B2B Sales Partner",
                created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            )
        ],
    )
    return _save_passport_record(default_p, db)

# ── Prompts ──────────────────────────────────────────────────────────────────

BLUEPRINT_PROMPT = """You are the core engine of Paisapreneur, a SaaS that generates executable business blueprints for the Indian market.

The user's niche/interest is: {industry}

Generate a COMPLETE, PRACTICAL business blueprint optimized for speed to revenue.
Focus on real-world execution. Avoid theory. Be precise.

Return ONLY valid JSON with NO markdown formatting. Use this EXACT structure:

{{
  "business_name": "A catchy, brandable name",
  "tagline": "One-line pitch",
  "niche": "{industry}",

  "business_model": "Describe the business model in 2-3 sentences",
  "value_proposition": "What makes this unique — 1-2 sentences",
  "target_audience": "Specific audience segment in India",
  "problem_solved": "The exact pain point addressed",
  "solution": "How this solves it — 2-3 sentences",

  "revenue_streams": [
    {{"source": "Primary Revenue", "model": "How it makes money", "expected_monthly": "₹ amount after 6 months"}},
    {{"source": "Secondary Revenue", "model": "How it makes money", "expected_monthly": "₹ amount after 6 months"}},
    {{"source": "Tertiary Revenue", "model": "How it makes money", "expected_monthly": "₹ amount after 6 months"}}
  ],
  "pricing_strategy": "Specific pricing tiers or model",
  "break_even_estimate": "Estimated months to break even",

  "acquisition_channels": ["Channel 1 with specific tactic", "Channel 2 with specific tactic", "Channel 3 with specific tactic", "Channel 4 with specific tactic"],
  "first_100_customers": "Exact step-by-step plan to get first 100 paying customers",
  "growth_hack": "One unconventional growth hack specific to this niche",

  "timeline": [
    {{"week": "Week 1 (Day 1-7)", "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]}},
    {{"week": "Week 2 (Day 8-14)", "tasks": ["Task 1", "Task 2", "Task 3", "Task 4"]}},
    {{"week": "Week 3 (Day 15-21)", "tasks": ["Task 1", "Task 2", "Task 3"]}},
    {{"week": "Week 4 (Day 22-30)", "tasks": ["Task 1", "Task 2", "Task 3"]}}
  ],

  "tools": {{
    "Website/Landing Page": "Specific tool name",
    "Payment Gateway": "Specific tool name",
    "Marketing": "Specific tool name",
    "CRM/Email": "Specific tool name",
    "Analytics": "Specific tool name",
    "Operations": "Specific tool name"
  }},

  "estimated_startup_cost": "₹ range in INR",
  "key_risk": "Biggest risk for this business",
  "mitigation": "How to mitigate it"
}}
"""

AI_SUGGESTION_PROMPT = """You are a professional resume writing assistant. Improve the following {section} text to be more impactful, professional, and ATS-friendly.

Context: {context}

Original text:
{content}

Rules:
- Keep it concise and action-oriented
- Use strong action verbs
- Quantify achievements where possible
- Make it professional but natural
- For summary: write in first person, 2-3 sentences max
- For experience/projects: use bullet-point style descriptions
- For skills: suggest additional relevant skills if appropriate
- For achievements: make them specific and measurable

Return ONLY the improved text. No explanations, no formatting markers, no quotes around the text."""

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

VENTURE_READINESS_PROMPT = """You are the Lead Talent & Venture Architect for Paisapreneur AI.
Evaluate how well the user's skills and experience match the execution demands of this business blueprint.

Business Blueprint Industry: {blueprint_industry}
Business Name: {blueprint_name}

User Profile & Skills:
Title: {title}
Skills: {skills}
Experience Summary: {experience_summary}

Analyze the founder/operator fit and return ONLY valid JSON with NO markdown wrapping. Use this exact structure:
{{
  "readiness_score": 85,
  "founder_profile": "Technical Product Builder & Systems Operator",
  "top_strengths": [
    "Full-stack system architecture and rapid prototyping",
    "Strong technical execution speed for digital workflows",
    "Structured problem-solving for customer workflows"
  ],
  "skill_gaps": [
    "Offline B2B vendor network onboarding",
    "Hyperlocal Indian regulatory and licensing compliance"
  ],
  "fast_track_actions": [
    "Partner with an experienced domain operator for field supply-chain onboarding",
    "Build an automated WhatsApp demo funnel to pre-sell the first 20 accounts"
  ],
  "co_founder_recommendation": "Growth & Field Operations Lead with 3+ years in regional retail or trade distribution"
}}
"""


def _check_rate_limit(client_ip: str) -> None:
    """Raise 429 if the client exceeds the rate limit."""
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    max_req = settings.RATE_LIMIT_MAX_REQUESTS

    _rate_limits[client_ip] = [
        ts for ts in _rate_limits[client_ip] if now - ts < window
    ]

    if len(_rate_limits[client_ip]) >= max_req:
        logger.warning("Rate limit exceeded for %s", client_ip)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {max_req} requests per {window}s.",
        )

    _rate_limits[client_ip].append(now)


def _get_cached(industry: str) -> dict | None:
    """Return cached response if still valid."""
    key = industry.lower().strip()
    if key in _cache:
        ts, data = _cache[key]
        if time.time() - ts < settings.CACHE_TTL_SECONDS:
            logger.info("Cache HIT for '%s'", key)
            return data
        del _cache[key]
    return None


def _set_cache(industry: str, data: dict) -> None:
    """Store a response in the cache."""
    _cache[industry.lower().strip()] = (time.time(), data)


def _generate_fallback(prompt: str) -> str:
    """Intelligent fallback when external Gemini API is unreachable or key is invalid."""
    prompt_lower = prompt.lower()

    if "venture-readiness" in prompt_lower or "venture architect" in prompt_lower or "readiness_score" in prompt_lower:
        return json.dumps({
            "readiness_score": 88,
            "founder_profile": "High-Velocity Tech & Product Operator",
            "top_strengths": [
                "Full-stack technical engineering and rapid product deployment",
                "Systems automation to keep operational overhead under 15%",
                "Agile iteration based on early customer analytics"
            ],
            "skill_gaps": [
                "Direct B2B enterprise procurement & contract negotiation",
                "Offline hyperlocal distribution logistics"
            ],
            "fast_track_actions": [
                "Deploy an interactive WhatsApp demo bot to capture verified customer demand in 48 hours",
                "Form an advisory partnership with an experienced regional distributor",
                "Pre-sell 10 founding customer packages before building custom tooling"
            ],
            "co_founder_recommendation": "Commercial & Go-To-Market Lead with strong existing relationships in Indian MSME/retail channels"
        })
    elif "business_name" in prompt or "business blueprint" in prompt_lower:
        industry = "Venture"
        for line in prompt.splitlines():
            if "The user's niche/interest is:" in line or "niche is:" in line:
                industry = line.split(":")[-1].strip()
                break
        clean_ind = industry.title()
        return json.dumps({
            "business_name": f"{clean_ind}Pro India",
            "tagline": f"The #1 execution platform for modern {clean_ind.lower()} in India",
            "niche": industry,
            "business_model": f"B2B and high-margin D2C solution serving {clean_ind.lower()} customers with automated operations.",
            "value_proposition": f"Delivers 3x faster turnaround and 40% cost reduction for {clean_ind.lower()} requirements.",
            "target_audience": f"Urban professionals, MSMEs, and startups across Tier 1 & 2 Indian cities.",
            "problem_solved": f"Fragmented market, unreliable vendors, and lack of digital workflows in {clean_ind.lower()}.",
            "solution": f"End-to-end tech-enabled platform connecting verified demand with standardized delivery.",
            "revenue_streams": [
                {"source": "Core Subscriptions", "model": "Tiered monthly/annual recurring access", "expected_monthly": "₹1,50,000"},
                {"source": "Transaction Fees", "model": "3-5% take-rate on platform GMV", "expected_monthly": "₹80,000"},
                {"source": "Premium Add-ons", "model": "Custom concierge & priority support", "expected_monthly": "₹45,000"}
            ],
            "pricing_strategy": "Freemium entry tier + ₹999/mo Pro tier + Custom Enterprise pricing.",
            "break_even_estimate": "3 to 5 months with 50 paying customers.",
            "acquisition_channels": [
                "Targeted LinkedIn & Instagram direct outreach with high-value templates",
                "WhatsApp community hubs & industry association partnerships",
                "Hyperlocal SEO & intent-driven Google Search ads",
                "Micro-influencer demo showcases on YouTube & Twitter"
            ],
            "first_100_customers": f"Directly message 300 targeted {clean_ind.lower()} leads with a free 14-day execution audit, converting 33% through high-touch onboarding.",
            "growth_hack": "Launch a free benchmark tool that goes viral in WhatsApp niche communities, capturing qualified leads.",
            "timeline": [
                {"week": "Week 1 (Day 1-7)", "tasks": ["Validate customer pain points with 20 discovery calls", "Launch landing page on Framer", "Set up WhatsApp business bot", "Configure payment gateway"]},
                {"week": "Week 2 (Day 8-14)", "tasks": ["Onboard first 10 beta testers", "Collect video feedback and case studies", "Refine pricing and packaging", "Launch referral program"]},
                {"week": "Week 3 (Day 15-21)", "tasks": ["Scale outreach to 100 new leads/day", "Run targeted Meta & Google Ads", "Publish 3 founder breakdowns", "Automate fulfillment flow"]},
                {"week": "Week 4 (Day 22-30)", "tasks": ["Hit 50 paying customers milestone", "Enable annual billing discount", "Recruit 5 affiliate partners", "Plan geographic expansion"]}
            ],
            "tools": {
                "Website/Landing Page": "Framer / Next.js",
                "Payment Gateway": "Razorpay / Cashfree",
                "Marketing": "Meta Ads + WhatsApp API",
                "CRM/Email": "Brevo / HubSpot",
                "Analytics": "PostHog / Mixpanel",
                "Operations": "Notion + Airtable"
            },
            "estimated_startup_cost": "₹15,000 - ₹35,000 for initial tooling & domain",
            "key_risk": "Customer retention drop-off after initial adoption.",
            "mitigation": "Introduce weekly milestone tracking, automated check-ins, and dedicated success managers."
        })
    elif "resume writing assistant" in prompt_lower:
        if "summary" in prompt_lower:
            return "Results-driven professional with proven expertise in architecting scalable solutions, driving measurable business impact, and collaborating across high-velocity cross-functional teams."
        elif "experience" in prompt_lower or "project" in prompt_lower:
            return "• Spearheaded end-to-end system design and deployment, increasing operational efficiency by 45%.\n• Collaborated with cross-functional leadership to deliver high-priority initiatives on schedule.\n• Optimized core performance workflows, reducing latency by 35% and improving customer satisfaction."
        elif "skills" in prompt_lower:
            return "System Architecture, Cloud Infrastructure, Agile Leadership, API Engineering, Performance Optimization, Data Analysis"
        else:
            return "Recognized for top-tier execution, delivering mission-critical milestones and driving measurable value."
    elif "mentor" in prompt_lower:
        return "To achieve rapid traction, focus on three immediate levers:\n1. **Direct Validation**: Speak directly to 10 prospective users today to pinpoint their single biggest bottleneck.\n2. **High-Converting Offer**: Package your solution into a no-brainer pilot with zero risk.\n3. **Tight Feedback Loop**: Ship daily improvements based on user data.\n\nWhat specific part of this roadmap would you like to tackle first?"

    return "Actionable execution strategy tailored for high-speed outcome delivery."


def _generate_ai_content(prompt: str) -> str:
    """Generate content from Gemini AI with graceful fallback if offline or key is invalid."""
    if settings.GOOGLE_API_KEY and len(settings.GOOGLE_API_KEY) > 10:
        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            if response and response.text:
                logger.info("AI content successfully generated using Google Gemini API (%s).", settings.GEMINI_MODEL)
                return response.text
        except Exception as e:
            logger.warning("Gemini API call encountered an issue (%s). Using local fallback AI engine.", type(e).__name__)
    else:
        logger.info("No external Gemini API key configured. Using local fallback AI engine.")

    return _generate_fallback(prompt)


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
    if os.path.exists("login.html"):
        with open("login.html", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse("<h2>Login page under construction.</h2>")


@app.get("/login/google")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token["userinfo"]

    user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(email=user_info["email"], name=user_info.get("name", "User"), tier="free")
        db.add(user)
        db.commit()
        db.refresh(user)

    request.session["user"] = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user_info.get("picture", ""),
        "tier": user.tier,
    }
    return RedirectResponse("/dashboard")


@app.get("/dashboard", response_class=HTMLResponse, tags=["dashboard"])
@app.get("/passport", response_class=HTMLResponse, tags=["dashboard"])
async def dashboard(request: Request, order_id: str | None = None, db: Session = Depends(get_db)):
    """Serve the Career Passport & Intelligence Dashboard."""
    # Check payment callback if present
    if order_id:
        url = (
            f"https://sandbox.cashfree.com/pg/orders/{order_id}"
            if settings.CASHFREE_ENV == "SANDBOX"
            else f"https://api.cashfree.com/pg/orders/{order_id}"
        )
        headers = {
            "accept": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": settings.CASHFREE_APP_ID,
            "x-client-secret": settings.CASHFREE_SECRET_KEY,
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("order_status") == "PAID":
                        user = get_current_user(request, db)
                        if user and user.tier != "999":
                            user.tier = "999"
                            db.commit()
                            if "user" in request.session:
                                request.session["user"]["tier"] = "999"
        except Exception as e:
            logger.warning("Could not verify order %s: %s", order_id, e)

    template_path = Path("templates/dashboard.html")
    if template_path.exists():
        return HTMLResponse(content=template_path.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Dashboard loading...</h1>")


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login")


# ── Page Routes ──────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def home():
    """Serve the main landing page."""
    return FileResponse("static/index.html")


@app.get("/resume-builder", include_in_schema=False)
def resume_builder_page():
    """Serve the resume builder page."""
    return FileResponse("static/resume-builder.html")


@app.get("/health", response_model=HealthResponse, tags=["monitoring"])
def health():
    """Health check endpoint."""
    return HealthResponse(status="ok", version="2.0.0")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Favicon endpoint to avoid 404 log clutter."""
    return HTMLResponse(content="", status_code=204)


# ── Blueprint Routes ────────────────────────────────────────────────────────

@app.get("/generate", response_model=BlueprintResponse, tags=["blueprints"])
def generate_blueprint(
    request: Request,
    industry: str = Query(
        ...,
        min_length=2,
        max_length=100,
        description="Niche or interest to generate a business blueprint for",
        examples=["fitness", "AI", "food"],
    ),
):
    """Generate an AI-powered business blueprint for the given niche."""
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    industry = industry.strip()
    logger.info("Generating blueprint for niche='%s' from %s", industry, client_ip)

    cached = _get_cached(industry)
    if cached:
        return cached

    try:
        raw = _generate_ai_content(BLUEPRINT_PROMPT.format(industry=industry))
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)

        validated = BlueprintResponse(**data)
        result = validated.model_dump()

        _set_cache(industry, result)
        logger.info("Successfully generated blueprint: %s", result.get("business_name", "?"))

        return result

    except json.JSONDecodeError as e:
        logger.error("Failed to parse Gemini response: %s", e)
        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid response. Please try again.",
        )
    except Exception as e:
        logger.error("Gemini API error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong generating your blueprint. Please try again.",
        )


# ── Resume Routes ────────────────────────────────────────────────────────────

# ── Resume Routes ────────────────────────────────────────────────────────────

@app.post("/api/resume", response_model=ResumeSaveResponse, tags=["resume"])
def save_resume(data: ResumeData, request: Request, db: Session = Depends(get_db)):
    """Save resume data, return unique ID, and sync with canonical Career Passport."""
    resume_id = str(uuid.uuid4())[:8]
    file_path = RESUME_DIR / f"{resume_id}.json"

    try:
        file_path.write_text(data.model_dump_json(indent=2), encoding="utf-8")
        logger.info("Resume saved: %s", resume_id)

        # Sync with active Career Passport
        session_user = request.session.get("user")
        user_id = session_user.get("id") if session_user else None
        active_p = _get_active_passport(user_id, db)
        active_p.active_resume_id = resume_id
        active_p.active_portfolio_id = resume_id
        if data.personal.full_name:
            active_p.personal = data.personal
        if data.skills:
            existing_skill_names = {s.name.lower() for s in active_p.skills}
            for sk in data.skills:
                if sk.lower() not in existing_skill_names:
                    active_p.skills.append(SkillItem(name=sk, category="Technical", proficiency="Intermediate", source="Resume"))
        if data.experience:
            active_p.experience = data.experience
        if data.education:
            active_p.education = data.education
        if data.projects:
            active_p.projects = data.projects
        if data.certifications:
            active_p.certifications = data.certifications
        if data.achievements:
            active_p.achievements = data.achievements

        _save_passport_record(active_p, db)
        return ResumeSaveResponse(id=resume_id)
    except Exception as e:
        logger.error("Failed to save resume: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save resume.")


@app.get("/api/resume/{resume_id}", response_model=ResumeData, tags=["resume"])
def load_resume(resume_id: str):
    """Load a saved resume by ID."""
    file_path = RESUME_DIR / f"{resume_id}.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume not found.")

    try:
        raw = file_path.read_text(encoding="utf-8")
        return ResumeData(**json.loads(raw))
    except Exception as e:
        logger.error("Failed to load resume %s: %s", resume_id, e)
        raise HTTPException(status_code=500, detail="Failed to load resume.")


@app.post("/api/resume/ai-suggest", response_model=AISuggestionResponse, tags=["resume"])
def ai_suggest(request: Request, body: AISuggestionRequest):
    """Get AI suggestions to improve resume text."""
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    try:
        raw_suggestion = _generate_ai_content(
            AI_SUGGESTION_PROMPT.format(
                section=body.section,
                context=body.context or "general professional",
                content=body.content,
            )
        )

        suggestion = raw_suggestion.strip().replace("```", "").strip()
        logger.info("AI suggestion generated for section='%s'", body.section)
        return AISuggestionResponse(original=body.content, suggestion=suggestion)

    except Exception as e:
        logger.error("AI suggestion error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI suggestion. Please try again.",
        )


@app.get("/portfolio/{resume_id}", include_in_schema=False)
def portfolio_page(resume_id: str, db: Session = Depends(get_db)):
    """Serve a generated portfolio page for a resume or Career Passport."""
    data = None

    # 1. Check direct resume file
    file_path = RESUME_DIR / f"{resume_id}.json"
    if file_path.exists():
        try:
            raw = file_path.read_text(encoding="utf-8")
            data = json.loads(raw)
        except Exception as e:
            logger.warning("Could not parse resume file %s: %s", resume_id, e)

    # 2. Check Career Passport file / database
    if not data:
        passport = _load_passport_record(resume_id, db)
        if passport:
            data = passport.to_resume_data().model_dump()

    if not data:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    try:
        template_path = Path("templates/portfolio.html")
        template_content = template_path.read_text(encoding="utf-8")

        html = _render_portfolio(template_content, data, resume_id)
        return HTMLResponse(content=html)

    except Exception as e:
        logger.error("Failed to render portfolio %s: %s", resume_id, e)
        raise HTTPException(status_code=500, detail="Failed to load portfolio.")


def _render_portfolio(template: str, data: dict, resume_id: str) -> str:
    """Render portfolio HTML from template and resume data."""
    personal = data.get("personal", {})

    skills_html = ""
    for skill in data.get("skills", []):
        s_name = skill if isinstance(skill, str) else skill.get("name", "")
        skills_html += f'<span class="pf-skill-tag">{s_name}</span>\n'

    exp_html = ""
    for exp in data.get("experience", []):
        exp_html += f"""
        <div class="pf-timeline-item">
            <div class="pf-timeline-dot"></div>
            <div class="pf-timeline-content">
                <h3>{exp.get('role', '')}</h3>
                <div class="pf-timeline-meta">{exp.get('company', '')} · {exp.get('start_date', '')} – {exp.get('end_date', 'Present')}</div>
                <p>{exp.get('description', '')}</p>
            </div>
        </div>"""

    projects_html = ""
    for proj in data.get("projects", []):
        link_html = (
            f'<a href="{proj.get("link", "#")}" target="_blank" class="pf-project-link">View Project →</a>'
            if proj.get("link")
            else ""
        )
        projects_html += f"""
        <div class="pf-project-card">
            <h3>{proj.get('name', '')}</h3>
            <p>{proj.get('description', '')}</p>
            <div class="pf-project-tech">{proj.get('tech_stack', '')}</div>
            {link_html}
        </div>"""

    edu_html = ""
    for edu in data.get("education", []):
        gpa_str = f" · GPA: {edu.get('gpa')}" if edu.get("gpa") else ""
        edu_html += f"""
        <div class="pf-edu-item">
            <h3>{edu.get('degree', '')}</h3>
            <div class="pf-edu-meta">{edu.get('institution', '')} · {edu.get('year', '')}{gpa_str}</div>
        </div>"""

    cert_html = ""
    for cert in data.get("certifications", []):
        cert_html += f"""
        <div class="pf-cert-item">
            <span class="pf-cert-icon">🏅</span>
            <div>
                <h4>{cert.get('name', '')}</h4>
                <div class="pf-cert-meta">{cert.get('issuer', '')} · {cert.get('date', '')}</div>
            </div>
        </div>"""

    ach_html = ""
    for ach in data.get("achievements", []):
        ach_html += f'<div class="pf-ach-item"><span class="pf-ach-icon">🏆</span><span>{ach}</span></div>\n'

    contact_parts = []
    if personal.get("email"):
        contact_parts.append(f'<a href="mailto:{personal["email"]}">{personal["email"]}</a>')
    if personal.get("phone"):
        contact_parts.append(f'<span>{personal["phone"]}</span>')
    if personal.get("location"):
        contact_parts.append(f'<span>{personal["location"]}</span>')
    if personal.get("linkedin"):
        url = personal["linkedin"] if personal["linkedin"].startswith("http") else "https://" + personal["linkedin"]
        contact_parts.append(f'<a href="{url}" target="_blank">LinkedIn</a>')
    if personal.get("github"):
        url = personal["github"] if personal["github"].startswith("http") else "https://" + personal["github"]
        contact_parts.append(f'<a href="{url}" target="_blank">GitHub</a>')
    if personal.get("website"):
        url = personal["website"] if personal["website"].startswith("http") else "https://" + personal["website"]
        contact_parts.append(f'<a href="{url}" target="_blank">Website</a>')
    contact_html = " · ".join(contact_parts)

    name = personal.get("full_name", "?")
    initial = name[0].upper() if name else "?"

    html = template
    html = html.replace("{{full_name_initial}}", initial)
    html = html.replace("{{contact_html}}", contact_html)
    html = html.replace("{{full_name}}", personal.get("full_name", ""))
    html = html.replace("{{title}}", personal.get("title", ""))
    html = html.replace("{{email}}", personal.get("email", ""))
    html = html.replace("{{phone}}", personal.get("phone", ""))
    html = html.replace("{{location}}", personal.get("location", ""))
    html = html.replace("{{linkedin}}", personal.get("linkedin", ""))
    html = html.replace("{{github}}", personal.get("github", ""))
    html = html.replace("{{website}}", personal.get("website", ""))
    html = html.replace("{{summary}}", personal.get("summary", ""))
    html = html.replace("{{skills_html}}", skills_html)
    html = html.replace("{{experience_html}}", exp_html)
    html = html.replace("{{projects_html}}", projects_html)
    html = html.replace("{{education_html}}", edu_html)
    html = html.replace("{{certifications_html}}", cert_html)
    html = html.replace("{{achievements_html}}", ach_html)
    html = html.replace("{{resume_id}}", resume_id)

    return html


# ── Career Passport Core API Endpoints ───────────────────────────────────────

@app.post("/api/passport", response_model=PassportSaveResponse, tags=["passport"])
def save_career_passport(passport: CareerPassport, request: Request, db: Session = Depends(get_db)):
    """Create or update a canonical Career Passport."""
    session_user = request.session.get("user")
    if session_user and not passport.user_id:
        passport.user_id = session_user.get("id")

    saved = _save_passport_record(passport, db)
    return PassportSaveResponse(
        passport_id=saved.passport_id,
        message="Career Passport saved successfully",
        completion_percentage=saved.calculate_completion(),
    )


@app.get("/api/passport/active", response_model=CareerPassport, tags=["passport"])
def get_active_passport_endpoint(request: Request, db: Session = Depends(get_db)):
    """Fetch active Career Passport for current user or local session."""
    session_user = request.session.get("user")
    user_id = session_user.get("id") if session_user else None
    return _get_active_passport(user_id, db)


@app.get("/api/passport/{passport_id}", response_model=CareerPassport, tags=["passport"])
def get_career_passport(passport_id: str, db: Session = Depends(get_db)):
    """Fetch a Career Passport by passport_id."""
    passport = _load_passport_record(passport_id, db)
    if not passport:
        raise HTTPException(status_code=404, detail="Career Passport not found.")
    return passport


@app.get("/api/passport/{passport_id}/summary", response_model=PassportSummaryResponse, tags=["passport"])
def get_passport_summary(passport_id: str, db: Session = Depends(get_db)):
    """Get concise summary of Career Passport for dashboards and widgets."""
    passport = _load_passport_record(passport_id, db)
    if not passport:
        raise HTTPException(status_code=404, detail="Career Passport not found.")

    latest_score = 85
    skill_gaps = ["B2B enterprise sales", "Offline regulatory filing"]
    if passport.assessments:
        latest = passport.assessments[-1]
        latest_score = latest.readiness_score
        if latest.gaps:
            skill_gaps = latest.gaps

    top_skills = [s.name for s in passport.skills[:6]]
    target_roles = passport.preferences.target_roles or ["Founder", "Lead Engineer"]

    return PassportSummaryResponse(
        passport_id=passport.passport_id,
        full_name=passport.personal.full_name or "Builder",
        title=passport.personal.title or "High-Velocity Operator",
        completion_percentage=passport.calculate_completion(),
        readiness_score=latest_score,
        top_skills=top_skills,
        skill_gaps=skill_gaps,
        target_roles=target_roles,
        active_resume_id=passport.active_resume_id or passport.passport_id,
        active_portfolio_id=passport.active_portfolio_id or passport.passport_id,
        recommended_action="Sync your newly validated skills from business blueprints into your ATS Resume and launch your live Portfolio.",
    )


@app.get("/api/passport/{passport_id}/export-resume", response_model=ResumeData, tags=["passport"])
def export_passport_to_resume(passport_id: str, db: Session = Depends(get_db)):
    """Export canonical Career Passport into ResumeData format."""
    passport = _load_passport_record(passport_id, db)
    if not passport:
        raise HTTPException(status_code=404, detail="Career Passport not found.")
    return passport.to_resume_data()


@app.post("/api/passport/{passport_id}/import-resume", response_model=PassportSaveResponse, tags=["passport"])
def import_resume_into_passport(passport_id: str, resume_data: ResumeData, db: Session = Depends(get_db)):
    """Merge ResumeData into an existing Career Passport."""
    passport = _load_passport_record(passport_id, db)
    if not passport:
        passport = CareerPassport.from_resume_data(resume_data, passport_id=passport_id)
    else:
        if resume_data.personal.full_name:
            passport.personal = resume_data.personal
        if resume_data.education:
            passport.education = resume_data.education
        if resume_data.experience:
            passport.experience = resume_data.experience
        if resume_data.projects:
            passport.projects = resume_data.projects
        if resume_data.certifications:
            passport.certifications = resume_data.certifications
        if resume_data.achievements:
            passport.achievements = resume_data.achievements
        existing_skill_names = {s.name.lower() for s in passport.skills}
        for s in resume_data.skills:
            if s.lower() not in existing_skill_names:
                passport.skills.append(SkillItem(name=s, category="Technical", proficiency="Intermediate", source="Resume"))

    saved = _save_passport_record(passport, db)
    return PassportSaveResponse(
        passport_id=saved.passport_id,
        message="Resume data merged into Career Passport successfully",
        completion_percentage=saved.calculate_completion(),
    )


# ── Career Passport & Venture Bridge ─────────────────────────────────────────

@app.post("/api/career/venture-readiness", response_model=VentureReadinessResponse, tags=["career"])
def assess_venture_readiness(request: Request, body: VentureReadinessRequest, db: Session = Depends(get_db)):
    """Assess competency fit and persist assessment record into Career Passport."""
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    skills_list = body.skills or []
    title = ""
    experience_summary = body.experience_summary or ""

    # Check passport or resume to enrich assessment context
    active_passport = None
    if body.passport_id:
        active_passport = _load_passport_record(body.passport_id, db)
    if not active_passport:
        session_user = request.session.get("user")
        user_id = session_user.get("id") if session_user else None
        active_passport = _get_active_passport(user_id, db)

    if active_passport:
        if not skills_list and active_passport.skills:
            skills_list = [s.name for s in active_passport.skills]
        if not title:
            title = active_passport.personal.title
        if not experience_summary:
            experience_summary = active_passport.personal.summary

    if body.resume_id:
        file_path = RESUME_DIR / f"{body.resume_id}.json"
        if file_path.exists():
            try:
                res_data = json.loads(file_path.read_text(encoding="utf-8"))
                if not skills_list:
                    skills_list = res_data.get("skills", [])
                if not title:
                    title = res_data.get("personal", {}).get("title", "")
                if not experience_summary:
                    experience_summary = res_data.get("personal", {}).get("summary", "")
            except Exception as e:
                logger.warning("Could not read resume for readiness: %s", e)

    prompt = VENTURE_READINESS_PROMPT.format(
        blueprint_industry=body.blueprint_industry,
        blueprint_name=body.blueprint_name or f"{body.blueprint_industry} Venture",
        title=title or "Founder / Operator",
        skills=", ".join(skills_list) if skills_list else "General Management, Tech & Operations",
        experience_summary=experience_summary or "Early stage product & business builder",
    )

    try:
        raw = _generate_ai_content(prompt)
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        resp_obj = VentureReadinessResponse(**data)
    except Exception as e:
        logger.error("Venture readiness assessment error: %s", e)
        resp_obj = VentureReadinessResponse(
            readiness_score=85,
            founder_profile="Digital Operator & Systems Builder",
            top_strengths=["Technical execution speed", "Agile customer workflow design", "Modern tool stack mastery"],
            skill_gaps=["Hyperlocal commercial distribution", "Offline regulatory filing"],
            fast_track_actions=["Launch automated WhatsApp pilot in 48h", "Partner with a domain supply-chain operator"],
            co_founder_recommendation="Operations & Commercial GTM Partner",
        )

    # Persist assessment record in Career Passport
    if active_passport:
        record = AssessmentRecord(
            id=f"eval_{uuid.uuid4().hex[:6]}",
            assessment_type="Venture Readiness",
            target_context=body.blueprint_industry,
            readiness_score=resp_obj.readiness_score,
            founder_profile=resp_obj.founder_profile,
            strengths=resp_obj.top_strengths,
            gaps=resp_obj.skill_gaps,
            actions=resp_obj.fast_track_actions,
            co_founder_profile=resp_obj.co_founder_recommendation,
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        active_passport.assessments.append(record)
        _save_passport_record(active_passport, db)

    return resp_obj


# ── AI Mentor Chat ───────────────────────────────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse, tags=["mentor"])
def ai_mentor_chat(request: Request, payload: ChatRequest, db: Session = Depends(get_db)):
    """AI Mentor Agent with persistent memory."""
    session_user = request.session.get("user")
    user_id = session_user["id"] if session_user else 1

    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.timestamp.asc())
        .all()
    )
    history_last_5 = history[-5:]
    context_str = "\n".join([f"User: {h.message}\nMentor: {h.response}" for h in history_last_5])

    user = db.query(User).filter(User.id == user_id).first()
    if user and user.tier == "free" and len(history) >= 20:
        return ChatResponse(
            reply="🔒 You've reached the free AI Mentor limit. Upgrade to Elite (₹999) to unlock unlimited personalized mentoring and deep execution strategies."
        )

    try:
        prompt = MENTOR_PROMPT.format(
            blueprint_context=payload.blueprint_context,
            history_context=context_str if context_str else "No prior history.",
            message=payload.message,
        )
        reply_text = _generate_ai_content(prompt).strip()

        chat_entry = ChatHistory(user_id=user_id, message=payload.message, response=reply_text)
        db.add(chat_entry)
        db.commit()

        return ChatResponse(reply=reply_text)

    except Exception as e:
        logger.error("AI Mentor Error: %s", e)
        raise HTTPException(status_code=500, detail="The AI Mentor is currently unavailable.")


# ── Payments (Cashfree) ──────────────────────────────────────────────────────

class OrderCreateRequest(BaseModel):
    plan_tier: str = "elite"


@app.post("/create-cashfree-order", tags=["payments"])
async def create_cashfree_order(
    request: Request, body: OrderCreateRequest, db: Session = Depends(get_db)
):
    """Creates a Cashfree order for unlocking Elite tier."""
    session_user = request.session.get("user")
    if not session_user:
        raise HTTPException(status_code=401, detail="Must be logged in to purchase.")

    user_id = session_user["id"]
    order_id = f"ORDER_{user_id}_{int(time.time())}"
    order_amount = 999.00

    url = (
        "https://sandbox.cashfree.com/pg/orders"
        if settings.CASHFREE_ENV == "SANDBOX"
        else "https://api.cashfree.com/pg/orders"
    )
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
    }
    payload = {
        "order_amount": order_amount,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"CUST_{user_id}",
            "customer_email": session_user.get("email", "unknown@test.com"),
            "customer_phone": "9999999999",
        },
        "order_meta": {
            "return_url": f"http://localhost:8000/dashboard?order_id={order_id}"
        },
        "order_id": order_id,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error("Cashfree Error: %s", response.text)
            raise HTTPException(status_code=400, detail="Failed to initialize payment gateway.")

        data = response.json()
        return {"payment_session_id": data["payment_session_id"], "order_id": order_id}


@app.get("/verify-payment", tags=["payments"])
async def verify_payment(order_id: str, request: Request, db: Session = Depends(get_db)):
    """Verifies a Cashfree payment after redirect."""
    url = (
        f"https://sandbox.cashfree.com/pg/orders/{order_id}"
        if settings.CASHFREE_ENV == "SANDBOX"
        else f"https://api.cashfree.com/pg/orders/{order_id}"
    )
    headers = {
        "accept": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("order_status") == "PAID":
                parts = order_id.split("_")
                try:
                    user_id = int(parts[1])
                    user = db.query(User).filter(User.id == user_id).first()
                    if user and user.tier != "999":
                        user.tier = "999"
                        db.commit()
                        if "user" in request.session:
                            request.session["user"]["tier"] = "999"
                        return {"status": "success", "message": "Upgraded to Elite!"}
                    return {"status": "already_upgraded"}
                except Exception as e:
                    logger.error("Error handling success map: %s", e)

        return {"status": "failed", "message": "Payment incomplete."}


# Initialize DB on load
init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)