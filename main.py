"""Paisapreneur AI — Business Blueprint Generator API."""

import json
import logging
import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google import genai

from config import settings
from models import BlueprintResponse, HealthResponse

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
    description="Generate actionable business blueprints powered by Gemini AI",
    version="2.0.0",
)

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


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def home():
    """Serve the main frontend page."""
    return FileResponse("static/index.html")


@app.get("/health", response_model=HealthResponse, tags=["monitoring"])
def health():
    """Health check endpoint for uptime monitoring."""
    return HealthResponse()


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
