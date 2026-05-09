"""Tests for the Paisapreneur API endpoints."""

import pytest


MOCK_BLUEPRINT_RESPONSE = {
    "business_name": "FitBuddy India",
    "tagline": "Your neighborhood gym partner",
    "niche": "fitness",
    "business_model": "Peer-to-peer fitness accountability platform.",
    "value_proposition": "Connects gym-goers in the same neighborhood.",
    "target_audience": "Urban millennials aged 22-35 in Tier 1 cities",
    "problem_solved": "Lack of accountability and motivation for fitness.",
    "solution": "Match users with workout partners nearby.",
    "revenue_streams": [
        {"source": "Subscriptions", "model": "Monthly premium", "expected_monthly": "₹2L"},
        {"source": "Gym partnerships", "model": "Commission", "expected_monthly": "₹50K"},
        {"source": "Merchandise", "model": "D2C sales", "expected_monthly": "₹20K"}
    ],
    "pricing_strategy": "Free tier + ₹299/mo premium",
    "break_even_estimate": "4-6 months",
    "acquisition_channels": ["Instagram reels", "Gym tie-ups", "Referral program", "WhatsApp groups"],
    "first_100_customers": "Run free 7-day challenges in local gyms.",
    "growth_hack": "Partner with fitness influencers for free trials.",
    "timeline": [
        {"week": "Week 1", "tasks": ["Validate idea", "Build landing page", "Set up socials"]},
        {"week": "Week 2", "tasks": ["Build MVP", "Onboard 10 beta users"]},
        {"week": "Week 3", "tasks": ["Iterate on feedback", "Launch marketing"]},
        {"week": "Week 4", "tasks": ["Scale to 50 users", "Enable payments"]}
    ],
    "tools": {
        "Website/Landing Page": "Framer",
        "Payment Gateway": "Razorpay",
        "Marketing": "Instagram + WhatsApp",
        "CRM/Email": "Brevo",
        "Analytics": "Mixpanel",
        "Operations": "Notion"
    },
    "estimated_startup_cost": "₹5-8 Lakhs",
    "key_risk": "Low initial adoption",
    "mitigation": "Start hyperlocal in one city."
}


class TestHomeEndpoint:
    """Test the / endpoint serving the frontend."""

    def test_home_returns_html(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]

    def test_home_contains_app_name(self, client):
        resp = client.get("/")
        assert "Paisapreneur" in resp.text


class TestHealthEndpoint:
    """Test the /health endpoint."""

    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_response_structure(self, client):
        data = client.get("/health").json()
        assert data["status"] == "ok"
        assert data["version"] == "2.0.0"


class TestGenerateEndpoint:
    """Test the /generate endpoint for full blueprints."""

    def test_generate_valid_industry(self, client, mock_gemini):
        resp = client.get("/generate", params={"industry": "fitness"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["business_name"] == MOCK_BLUEPRINT_RESPONSE["business_name"]

    def test_generate_has_all_blueprint_sections(self, client, mock_gemini):
        data = client.get("/generate", params={"industry": "AI"}).json()
        required = [
            "business_name", "tagline", "niche",
            "business_model", "value_proposition", "target_audience",
            "problem_solved", "solution",
            "revenue_streams", "pricing_strategy", "break_even_estimate",
            "acquisition_channels", "first_100_customers", "growth_hack",
            "timeline", "tools",
            "estimated_startup_cost", "key_risk", "mitigation"
        ]
        for field in required:
            assert field in data, f"Missing field: {field}"

    def test_generate_revenue_streams_structure(self, client, mock_gemini):
        data = client.get("/generate", params={"industry": "food"}).json()
        assert isinstance(data["revenue_streams"], list)
        assert len(data["revenue_streams"]) >= 1
        stream = data["revenue_streams"][0]
        assert "source" in stream
        assert "model" in stream
        assert "expected_monthly" in stream

    def test_generate_timeline_structure(self, client, mock_gemini):
        data = client.get("/generate", params={"industry": "edtech"}).json()
        assert isinstance(data["timeline"], list)
        assert len(data["timeline"]) >= 1
        week = data["timeline"][0]
        assert "week" in week
        assert "tasks" in week
        assert isinstance(week["tasks"], list)

    def test_generate_tools_is_dict(self, client, mock_gemini):
        data = client.get("/generate", params={"industry": "fintech"}).json()
        assert isinstance(data["tools"], dict)
        assert len(data["tools"]) >= 1

    def test_generate_missing_industry(self, client):
        resp = client.get("/generate")
        assert resp.status_code == 422

    def test_generate_empty_industry(self, client):
        resp = client.get("/generate", params={"industry": ""})
        assert resp.status_code == 422

    def test_generate_short_industry(self, client):
        resp = client.get("/generate", params={"industry": "a"})
        assert resp.status_code == 422

    def test_generate_invalid_json_from_gemini(self, client, mock_gemini_invalid):
        resp = client.get("/generate", params={"industry": "wellness"})
        assert resp.status_code == 502

    def test_generate_gemini_api_error(self, client, mock_gemini_error):
        resp = client.get("/generate", params={"industry": "solar"})
        assert resp.status_code == 500


class TestCaching:
    """Test response caching behavior."""

    def test_second_call_uses_cache(self, client, mock_gemini):
        client.get("/generate", params={"industry": "fitness"})
        assert mock_gemini.call_count == 1
        resp = client.get("/generate", params={"industry": "fitness"})
        assert resp.status_code == 200
        assert mock_gemini.call_count == 1

    def test_different_industry_no_cache(self, client, mock_gemini):
        client.get("/generate", params={"industry": "fitness"})
        client.get("/generate", params={"industry": "food"})
        assert mock_gemini.call_count == 2

    def test_cache_case_insensitive(self, client, mock_gemini):
        client.get("/generate", params={"industry": "Fitness"})
        client.get("/generate", params={"industry": "fitness"})
        assert mock_gemini.call_count == 1


class TestRateLimiting:
    """Test rate limiting behavior."""

    def test_rate_limit_triggers(self, client, mock_gemini):
        for i in range(10):
            client.get("/generate", params={"industry": f"industry{i}"})
        resp = client.get("/generate", params={"industry": "one_more"})
        assert resp.status_code == 429


class TestCORS:
    """Test CORS headers."""

    def test_cors_headers_present(self, client):
        resp = client.options(
            "/generate",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert resp.status_code in (200, 204, 400)
