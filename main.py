"""Paisapreneur AI — Business Blueprint Generator + Resume Builder API."""

import json
import logging
import os
import time
import uuid
from collections import defaultdict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from google import genai

from config import settings
from models import (
    AISuggestionRequest,
    AISuggestionResponse,
    BlueprintResponse,
    HealthResponse,
    ResumeData,
    ResumeSaveResponse,
)
# After: from google import genai
# Add these:
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("paisapreneur")

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Paisapreneur AI",
    description="Generate actionable business blueprints and professional resumes powered by Gemini AI",
    version="3.0.0",
)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "paisapreneur_secret_2026")
)

# Google OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files ─────────────────────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Gemini Client ────────────────────────────────────────────────────────────
client = genai.Client(api_key=settings.GOOGLE_API_KEY)

# ── Data Directory ───────────────────────────────────────────────────────────
RESUME_DIR = Path("data/resumes")
RESUME_DIR.mkdir(parents=True, exist_ok=True)

# ── In-Memory Cache ─────────────────────────────────────────────────────────
_cache: dict[str, tuple[float, dict]] = {}

# ── Rate Limiter (in-memory) ────────────────────────────────────────────────
_rate_limits: dict[str, list[float]] = defaultdict(list)

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
    """Health check endpoint for uptime monitoring."""
    return HealthResponse(status="ok", version="3.0.0")


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

    # Sanitize input
    industry = industry.strip()
    logger.info("Generating blueprint for niche='%s' from %s", industry, client_ip)

    # Check cache
    cached = _get_cached(industry)
    if cached:
        return cached

    # Call Gemini
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=BLUEPRINT_PROMPT.format(industry=industry),
        )

        raw = response.text
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)

        # Validate against our model
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

@app.post("/api/resume", response_model=ResumeSaveResponse, tags=["resume"])
def save_resume(data: ResumeData):
    """Save resume data and return a unique ID."""
    resume_id = str(uuid.uuid4())[:8]
    file_path = RESUME_DIR / f"{resume_id}.json"

    try:
        file_path.write_text(data.model_dump_json(indent=2), encoding="utf-8")
        logger.info("Resume saved: %s", resume_id)
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
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=AI_SUGGESTION_PROMPT.format(
                section=body.section,
                context=body.context or "general professional",
                content=body.content,
            ),
        )

        suggestion = response.text.strip()
        # Clean potential markdown formatting
        suggestion = suggestion.replace("```", "").strip()

        logger.info("AI suggestion generated for section='%s'", body.section)
        return AISuggestionResponse(original=body.content, suggestion=suggestion)

    except Exception as e:
        logger.error("AI suggestion error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI suggestion. Please try again.",
        )


@app.get("/portfolio/{resume_id}", include_in_schema=False)
def portfolio_page(resume_id: str):
    """Serve a generated portfolio page for a resume."""
    file_path = RESUME_DIR / f"{resume_id}.json"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    try:
        raw = file_path.read_text(encoding="utf-8")
        data = json.loads(raw)

        # Read and render the portfolio template
        template_path = Path("templates/portfolio.html")
        template_content = template_path.read_text(encoding="utf-8")

        # Simple template rendering (replacing placeholders)
        html = _render_portfolio(template_content, data, resume_id)

        return HTMLResponse(content=html)

    except Exception as e:
        logger.error("Failed to render portfolio %s: %s", resume_id, e)
        raise HTTPException(status_code=500, detail="Failed to load portfolio.")


def _render_portfolio(template: str, data: dict, resume_id: str) -> str:
    """Render portfolio HTML from template and resume data."""
    personal = data.get("personal", {})

    # Build skills HTML
    skills_html = ""
    for skill in data.get("skills", []):
        skills_html += f'<span class="pf-skill-tag">{skill}</span>\n'

    # Build experience HTML
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

    # Build projects HTML
    projects_html = ""
    for proj in data.get("projects", []):
        link_html = f'<a href="{proj.get("link", "#")}" target="_blank" class="pf-project-link">View Project →</a>' if proj.get("link") else ""
        projects_html += f"""
        <div class="pf-project-card">
            <h3>{proj.get('name', '')}</h3>
            <p>{proj.get('description', '')}</p>
            <div class="pf-project-tech">{proj.get('tech_stack', '')}</div>
            {link_html}
        </div>"""

    # Build education HTML
    edu_html = ""
    for edu in data.get("education", []):
        gpa_str = f" · GPA: {edu.get('gpa')}" if edu.get("gpa") else ""
        edu_html += f"""
        <div class="pf-edu-item">
            <h3>{edu.get('degree', '')}</h3>
            <div class="pf-edu-meta">{edu.get('institution', '')} · {edu.get('year', '')}{gpa_str}</div>
        </div>"""

    # Build certifications HTML
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

    # Build achievements HTML
    ach_html = ""
    for ach in data.get("achievements", []):
        ach_html += f'<div class="pf-ach-item"><span class="pf-ach-icon">🏆</span><span>{ach}</span></div>\n'

    # Build contact HTML for hero
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

    # Name initial for avatar
    name = personal.get("full_name", "?")
    initial = name[0].upper() if name else "?"

    # Replace placeholders
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
# ── Auth Routes ──────────────────────────────────────────────

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    user = request.session.get("user")
    if user:
        return RedirectResponse("/dashboard")
    with open("login.html") as f:
        return f.read()

@app.get("/login/google")
async def google_login(request: Request):
    redirect_uri = "https://paisapreneur.com/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token['userinfo']
    request.session['user'] = {
        "name": user['name'],
        "email": user['email'],
        "picture": user['picture']
    }
    return RedirectResponse("/dashboard")

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    user = request.session.get("user")
    if not user:
        return RedirectResponse("/login")
    return f"""
    <html>
    <body style="font-family:Arial;text-align:center;padding:50px;background:#0A0A0A;color:white">
        <img src="{user['picture']}" width="80" style="border-radius:50%"><br><br>
        <h2>Welcome, {user['name']}! 👋</h2>
        <p style="color:#C9A84C">{user['email']}</p>
        <a href="/logout" style="color:#C9A84C">Logout</a>
    </body>
    </html>
    """

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login")