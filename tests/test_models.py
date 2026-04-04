"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError

from models import IdeaRequest, BlueprintResponse, RevenueStream, TimelineWeek, ErrorResponse, HealthResponse


class TestIdeaRequest:
    """Test IdeaRequest model validation."""

    def test_valid_industry(self):
        req = IdeaRequest(industry="fitness")
        assert req.industry == "fitness"

    def test_valid_industry_long(self):
        req = IdeaRequest(industry="artificial intelligence and machine learning")
        assert "artificial" in req.industry

    def test_industry_too_short(self):
        with pytest.raises(ValidationError):
            IdeaRequest(industry="a")

    def test_industry_too_long(self):
        with pytest.raises(ValidationError):
            IdeaRequest(industry="x" * 101)

    def test_industry_empty(self):
        with pytest.raises(ValidationError):
            IdeaRequest(industry="")

    def test_industry_missing(self):
        with pytest.raises(ValidationError):
            IdeaRequest()

    def test_industry_special_characters(self):
        req = IdeaRequest(industry="AI & ML")
        assert req.industry == "AI & ML"

    def test_industry_unicode(self):
        req = IdeaRequest(industry="फिटनेस")
        assert req.industry == "फिटनेस"


class TestRevenueStream:
    """Test RevenueStream model."""

    def test_valid_stream(self):
        s = RevenueStream(source="Subs", model="Monthly", expected_monthly="₹2L")
        assert s.source == "Subs"

    def test_missing_field(self):
        with pytest.raises(ValidationError):
            RevenueStream(source="Subs")


class TestTimelineWeek:
    """Test TimelineWeek model."""

    def test_valid_week(self):
        w = TimelineWeek(week="Week 1", tasks=["Build MVP", "Launch"])
        assert len(w.tasks) == 2

    def test_empty_tasks(self):
        w = TimelineWeek(week="Week 1", tasks=[])
        assert w.tasks == []


class TestBlueprintResponse:
    """Test BlueprintResponse model."""

    def test_valid_blueprint(self):
        bp = BlueprintResponse(
            business_name="TestBiz",
            tagline="Test",
            niche="test",
            business_model="SaaS",
            value_proposition="Fast",
            target_audience="Devs",
            problem_solved="Slow tools",
            solution="Build faster",
            revenue_streams=[
                RevenueStream(source="Subs", model="Monthly", expected_monthly="₹1L")
            ],
            pricing_strategy="₹99/mo",
            break_even_estimate="3 months",
            acquisition_channels=["Twitter"],
            first_100_customers="DM founders",
            growth_hack="Open source core",
            timeline=[
                TimelineWeek(week="Week 1", tasks=["Build"])
            ],
            tools={"Website": "Vercel"},
            estimated_startup_cost="₹2L",
            key_risk="Competition",
            mitigation="Move fast"
        )
        assert bp.business_name == "TestBiz"
        assert len(bp.revenue_streams) == 1

    def test_missing_required_field(self):
        with pytest.raises(ValidationError):
            BlueprintResponse(business_name="TestBiz")


class TestErrorResponse:
    """Test ErrorResponse model."""

    def test_error_only(self):
        err = ErrorResponse(error="Something broke")
        assert err.error == "Something broke"
        assert err.detail is None

    def test_error_with_detail(self):
        err = ErrorResponse(error="Bad input", detail="Too short")
        assert err.detail == "Too short"


class TestHealthResponse:
    """Test HealthResponse model."""

    def test_defaults(self):
        health = HealthResponse()
        assert health.status == "ok"
        assert health.version == "2.0.0"
