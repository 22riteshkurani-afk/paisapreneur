"""Shared test fixtures for Paisapreneur tests."""

import pytest
import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from main import app, _cache, _rate_limits


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_state():
    """Clear cache and rate limits between tests."""
    _cache.clear()
    _rate_limits.clear()
    yield
    _cache.clear()
    _rate_limits.clear()


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


@pytest.fixture
def mock_gemini():
    """Mock the Gemini API client to return a predictable blueprint."""
    mock_response = MagicMock()
    mock_response.text = json.dumps(MOCK_BLUEPRINT_RESPONSE)

    with patch("main.client.models.generate_content", return_value=mock_response) as mock:
        yield mock


@pytest.fixture
def mock_gemini_invalid():
    """Mock the Gemini API returning invalid JSON."""
    mock_response = MagicMock()
    mock_response.text = "This is not JSON at all!"

    with patch("main.client.models.generate_content", return_value=mock_response) as mock:
        yield mock


@pytest.fixture
def mock_gemini_error():
    """Mock the Gemini API raising an exception."""
    with patch(
        "main.client.models.generate_content",
        side_effect=Exception("API quota exceeded")
    ) as mock:
        yield mock
