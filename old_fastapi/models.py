"""Pydantic models for request validation and response serialization."""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


# ── Blueprint Models ─────────────────────────────────────────────────────────

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


# ── AI Mentor / Chat Models ──────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """Chat message from the user to the AI Mentor."""

    message: str = Field(..., min_length=1, max_length=1000)
    blueprint_context: str = Field(default="", description="Optional context about the current blueprint being viewed.")


class ChatResponse(BaseModel):
    """Response from the AI Mentor."""

    reply: str


# ── Intermediate Agent Models ────────────────────────────────────────────────

class Agent1Output(BaseModel):
    """Agent 1: Idea Validator & Business Model."""
    business_name: str
    tagline: str
    business_model: str
    value_proposition: str
    target_audience: str
    problem_solved: str
    solution: str


class Agent2Output(BaseModel):
    """Agent 2: Revenue Planner."""
    revenue_streams: list[RevenueStream]
    pricing_strategy: str
    break_even_estimate: str


class Agent3Output(BaseModel):
    """Agent 3: Execution Coach."""
    acquisition_channels: list[str]
    first_100_customers: str
    growth_hack: str
    timeline: list[TimelineWeek]
    tools: dict[str, str]
    estimated_startup_cost: str
    key_risk: str
    mitigation: str


# ── Career Passport & Venture Bridge Models ──────────────────────────────────

class VentureReadinessRequest(BaseModel):
    """Request to assess career competency against a business blueprint."""

    passport_id: str | None = None
    resume_id: str | None = None
    skills: list[str] = []
    experience_summary: str = ""
    blueprint_industry: str = Field(..., min_length=2, max_length=100)
    blueprint_name: str = ""


class VentureReadinessResponse(BaseModel):
    """AI assessment of competency fit for a business opportunity."""

    readiness_score: int
    founder_profile: str
    top_strengths: list[str]
    skill_gaps: list[str]
    fast_track_actions: list[str]
    co_founder_recommendation: str


# ── Career Passport Core Models ──────────────────────────────────────────────

class SkillItem(BaseModel):
    """Structured skill item with proficiency, category, and source verification."""

    name: str
    category: str = "Technical"  # Technical, Product, Business, Leadership, Creative
    proficiency: str = "Intermediate"  # Beginner, Intermediate, Advanced, Expert
    source: str = "Self-reported"  # Self-reported, Assessment, Verified, Project


class CareerPreferences(BaseModel):
    """Target career preferences and goals."""

    target_roles: list[str] = []
    target_industries: list[str] = []
    work_preference: str = "Flexible"  # Remote, Hybrid, Onsite, Flexible
    location_preference: str = ""
    salary_expectation: str = ""
    availability: str = "Immediate"


class AssessmentRecord(BaseModel):
    """Persistent competency assessment or readiness evaluation."""

    id: str = ""
    assessment_type: str = "Venture Readiness"
    target_context: str = ""
    readiness_score: int = 0
    founder_profile: str = ""
    strengths: list[str] = []
    gaps: list[str] = []
    actions: list[str] = []
    co_founder_profile: str = ""
    created_at: str = ""


class CareerPassport(BaseModel):
    """Canonical Single Source of Truth for user identity, capabilities, and assets."""

    passport_id: str = ""
    user_id: int | None = None

    # 1. Identity
    personal: PersonalInfo = PersonalInfo()

    # 2. Career Preferences & Target Goals
    preferences: CareerPreferences = CareerPreferences()

    # 3. Skills Matrix
    skills: list[SkillItem] = []

    # 4. Experience & Track Record
    experience: list[Experience] = []

    # 5. Education & Credentials
    education: list[Education] = []
    certifications: list[Certification] = []

    # 6. Projects & Ventures
    projects: list[Project] = []

    # 7. Achievements & Milestones
    achievements: list[str] = []

    # 8. Intelligence & Assessments
    assessments: list[AssessmentRecord] = []

    # 9. Linked Asset IDs & Customization
    active_resume_id: str = ""
    active_portfolio_id: str = ""
    template: str = "modern"

    # Computed metadata
    updated_at: str = ""

    def calculate_completion(self) -> int:
        """Calculate profile completion percentage based on filled sections."""
        score = 0
        # Identity (20%)
        if self.personal.full_name and self.personal.email:
            score += 10
        if self.personal.title and (self.personal.summary or self.personal.location):
            score += 10

        # Education (15%)
        if self.education and len(self.education) > 0 and self.education[0].institution:
            score += 15

        # Experience (20%)
        if self.experience and len(self.experience) > 0 and self.experience[0].company:
            score += 20

        # Skills (15%)
        if self.skills and len(self.skills) >= 3:
            score += 15
        elif self.skills and len(self.skills) > 0:
            score += 8

        # Projects & Ventures (15%)
        if self.projects and len(self.projects) > 0 and self.projects[0].name:
            score += 15

        # Career Preferences (10%)
        if self.preferences.target_roles and len(self.preferences.target_roles) > 0:
            score += 5
        if self.preferences.target_industries and len(self.preferences.target_industries) > 0:
            score += 5

        # Assessments / Intelligence (5%)
        if self.assessments and len(self.assessments) > 0:
            score += 5

        return min(100, score)

    def to_resume_data(self) -> ResumeData:
        """Convert Career Passport into ResumeData consumable by Resume Builder."""
        skill_names = [s.name for s in self.skills]
        return ResumeData(
            personal=self.personal,
            education=self.education,
            skills=skill_names,
            experience=self.experience,
            projects=self.projects,
            certifications=self.certifications,
            achievements=self.achievements,
            template=self.template or "modern",
        )

    @classmethod
    def from_resume_data(
        cls,
        resume_data: ResumeData,
        passport_id: str = "",
        user_id: int | None = None,
    ) -> "CareerPassport":
        """Construct a CareerPassport from ResumeData."""
        structured_skills = [
            SkillItem(name=s, category="Technical", proficiency="Intermediate", source="Self-reported")
            for s in resume_data.skills
        ]
        return cls(
            passport_id=passport_id,
            user_id=user_id,
            personal=resume_data.personal,
            education=resume_data.education,
            skills=structured_skills,
            experience=resume_data.experience,
            projects=resume_data.projects,
            certifications=resume_data.certifications,
            achievements=resume_data.achievements,
            template=resume_data.template,
            updated_at=datetime.now(timezone.utc).isoformat(),
        )


class PassportSaveResponse(BaseModel):
    """Response after saving a Career Passport."""

    passport_id: str
    message: str = "Career Passport updated successfully"
    completion_percentage: int = 0


class PassportSummaryResponse(BaseModel):
    """Dashboard-friendly summary of Career Passport."""

    passport_id: str
    full_name: str
    title: str
    completion_percentage: int
    readiness_score: int
    top_skills: list[str]
    skill_gaps: list[str]
    target_roles: list[str]
    active_resume_id: str
    active_portfolio_id: str
    recommended_action: str
