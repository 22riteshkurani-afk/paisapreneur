"""Pydantic models for request validation and response serialization."""

from pydantic import BaseModel, Field


# ── Blueprint Models (existing) ──────────────────────────────────────────────

class IdeaRequest(BaseModel):
    """Validated industry input for idea generation."""

    industry: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Niche or interest to generate a business blueprint for",
        examples=["fitness", "AI", "food", "edtech"],
    )


class RevenueStream(BaseModel):
    """A single revenue stream."""

    source: str
    model: str
    expected_monthly: str


class TimelineWeek(BaseModel):
    """A single week in the execution timeline."""

    week: str
    tasks: list[str]


class BlueprintResponse(BaseModel):
    """Complete business blueprint response."""

    # Header
    business_name: str
    tagline: str
    niche: str

    # 1. Business Model
    business_model: str
    value_proposition: str
    target_audience: str
    problem_solved: str
    solution: str

    # 2. Revenue Plan
    revenue_streams: list[RevenueStream]
    pricing_strategy: str
    break_even_estimate: str

    # 3. Acquisition Strategy
    acquisition_channels: list[str]
    first_100_customers: str
    growth_hack: str

    # 4. Execution Timeline
    timeline: list[TimelineWeek]

    # 5. Tools Stack
    tools: dict[str, str]

    # Bonus
    estimated_startup_cost: str
    key_risk: str
    mitigation: str


# Keep old model for backward compat
class IdeaResponse(BaseModel):
    """Structured startup idea response (legacy)."""

    idea_name: str
    description: str
    target_market: str
    startup_cost: str
    revenue_model: str
    steps: list[str]


class ErrorResponse(BaseModel):
    """Structured error response."""

    error: str
    detail: str | None = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    version: str = "2.0.0"


# ── Resume Builder Models ────────────────────────────────────────────────────

class Education(BaseModel):
    """A single education entry."""

    degree: str = ""
    institution: str = ""
    year: str = ""
    gpa: str = ""


class Experience(BaseModel):
    """A single work experience entry."""

    company: str = ""
    role: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class Project(BaseModel):
    """A single project entry."""

    name: str = ""
    description: str = ""
    tech_stack: str = ""
    link: str = ""


class Certification(BaseModel):
    """A single certification entry."""

    name: str = ""
    issuer: str = ""
    date: str = ""


class PersonalInfo(BaseModel):
    """User's personal information."""

    full_name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""
    summary: str = ""


class ResumeData(BaseModel):
    """Complete resume data."""

    personal: PersonalInfo = PersonalInfo()
    education: list[Education] = []
    skills: list[str] = []
    experience: list[Experience] = []
    projects: list[Project] = []
    certifications: list[Certification] = []
    achievements: list[str] = []
    template: str = "modern"


class ResumeSaveResponse(BaseModel):
    """Response after saving a resume."""

    id: str
    message: str = "Resume saved successfully"


class AISuggestionRequest(BaseModel):
    """Request to get AI suggestions for a resume section."""

    section: str = Field(
        ...,
        description="Section name: summary, experience, project, skills, achievement",
        examples=["summary", "experience"],
    )
    content: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        description="Current text content to improve",
    )
    context: str = Field(
        default="",
        max_length=500,
        description="Additional context like job title or industry",
    )


class AISuggestionResponse(BaseModel):
    """AI-improved text suggestion."""

    original: str
    suggestion: str
