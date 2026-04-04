"""Pydantic models for request validation and response serialization."""

from pydantic import BaseModel, Field


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
