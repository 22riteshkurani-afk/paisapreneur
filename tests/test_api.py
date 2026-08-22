"""Tests for the Paisapreneur API endpoints."""

import pytest
import json
from unittest.mock import patch

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


class TestResumeAndPortfolioEndpoints:
    """Test Resume Builder and Portfolio Generator routes."""

    def test_resume_builder_page(self, client):
        resp = client.get("/resume-builder")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]
        assert "Resume" in resp.text

    def test_save_and_load_resume(self, client):
        sample_resume = {
            "personal": {
                "full_name": "Aarav Sharma",
                "title": "Full Stack AI Engineer",
                "email": "aarav@example.com",
                "phone": "+91 98765 43210",
                "location": "Bengaluru, India",
                "linkedin": "https://linkedin.com/in/aarav",
                "github": "https://github.com/aarav",
                "website": "https://aarav.dev",
                "summary": "Experienced builder creating AI applications."
            },
            "education": [
                {
                    "degree": "B.Tech in Computer Science",
                    "institution": "IIT Bombay",
                    "year": "2020 - 2024",
                    "gpa": "9.2/10"
                }
            ],
            "skills": ["Python", "FastAPI", "React", "Gemini AI", "PostgreSQL"],
            "experience": [
                {
                    "company": "TechCorp India",
                    "role": "Software Engineer",
                    "start_date": "2024",
                    "end_date": "Present",
                    "description": "Architected LLM backend services handling 1M+ requests."
                }
            ],
            "projects": [
                {
                    "name": "Paisapreneur AI",
                    "description": "Business blueprint and resume builder SaaS",
                    "tech_stack": "FastAPI, Tailwind, Gemini",
                    "link": "https://github.com/example/paisapreneur"
                }
            ],
            "certifications": [
                {
                    "name": "Google Cloud Professional ML Engineer",
                    "issuer": "Google Cloud",
                    "date": "2025"
                }
            ],
            "achievements": [
                "1st place in National AI Hackathon 2025"
            ],
            "template": "modern"
        }

        # 1. Save Resume
        save_resp = client.post("/api/resume", json=sample_resume)
        assert save_resp.status_code == 200
        res_data = save_resp.json()
        assert "id" in res_data
        resume_id = res_data["id"]

        # 2. Load Resume
        load_resp = client.get(f"/api/resume/{resume_id}")
        assert load_resp.status_code == 200
        loaded_data = load_resp.json()
        assert loaded_data["personal"]["full_name"] == "Aarav Sharma"
        assert len(loaded_data["skills"]) == 5

        # 3. View Portfolio
        portfolio_resp = client.get(f"/portfolio/{resume_id}")
        assert portfolio_resp.status_code == 200
        assert "text/html" in portfolio_resp.headers["content-type"]
        assert "Aarav Sharma" in portfolio_resp.text
        assert "Full Stack AI Engineer" in portfolio_resp.text

    def test_ai_suggestion_endpoint(self, client):
        with patch("main._generate_ai_content", return_value="Engineered high-throughput asynchronous microservices."):
            resp = client.post("/api/resume/ai-suggest", json={
                "section": "experience",
                "content": "Worked on backend microservices.",
                "context": "Software Engineer"
            })
            assert resp.status_code == 200
            data = resp.json()
            assert data["original"] == "Worked on backend microservices."
            assert "Engineered" in data["suggestion"]

    def test_venture_readiness_assessment(self, client):
        resp = client.post("/api/career/venture-readiness", json={
            "blueprint_industry": "AI SaaS",
            "blueprint_name": "PromptOps",
            "skills": ["Python", "FastAPI", "React", "Cloud"],
            "experience_summary": "5 years building cloud applications"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "readiness_score" in data
        assert isinstance(data["readiness_score"], int)
        assert "founder_profile" in data
        assert isinstance(data["top_strengths"], list)
        assert isinstance(data["skill_gaps"], list)
        assert isinstance(data["fast_track_actions"], list)
        assert "co_founder_recommendation" in data


class TestCareerPassportEndpoints:
    """Test suite for Career Passport Core API endpoints."""

    def test_create_and_load_career_passport(self, client):
        passport_payload = {
            "passport_id": "cp_test_api_01",
            "personal": {
                "full_name": "Rohan Deshmukh",
                "title": "Lead Product Architect",
                "email": "rohan@example.com",
                "location": "Pune, India",
                "summary": "Building scalable platforms."
            },
            "skills": [
                {"name": "System Architecture", "category": "Technical", "proficiency": "Expert"},
                {"name": "Product Strategy", "category": "Product", "proficiency": "Advanced"},
                {"name": "Team Leadership", "category": "Leadership", "proficiency": "Expert"}
            ],
            "experience": [
                {
                    "company": "VentureScale",
                    "role": "Head of Product",
                    "start_date": "2022",
                    "end_date": "Present",
                    "description": "Scaled revenue 3x."
                }
            ],
            "education": [
                {
                    "degree": "M.Tech",
                    "institution": "COEP Pune",
                    "year": "2020",
                    "gpa": "9.0"
                }
            ],
            "preferences": {
                "target_roles": ["Founder", "VP Product"],
                "target_industries": ["FinTech", "AI SaaS"],
                "work_preference": "Remote"
            }
        }

        # 1. Create Passport
        save_resp = client.post("/api/passport", json=passport_payload)
        assert save_resp.status_code == 200
        save_data = save_resp.json()
        assert save_data["passport_id"] == "cp_test_api_01"
        assert save_data["completion_percentage"] >= 70

        # 2. Read Passport
        get_resp = client.get("/api/passport/cp_test_api_01")
        assert get_resp.status_code == 200
        got_passport = get_resp.json()
        assert got_passport["personal"]["full_name"] == "Rohan Deshmukh"
        assert len(got_passport["skills"]) == 3

    def test_get_active_passport(self, client):
        resp = client.get("/api/passport/active")
        assert resp.status_code == 200
        data = resp.json()
        assert "passport_id" in data
        assert "personal" in data

    def test_get_passport_summary(self, client):
        resp = client.get("/api/passport/cp_test_api_01/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert data["passport_id"] == "cp_test_api_01"
        assert data["full_name"] == "Rohan Deshmukh"
        assert "completion_percentage" in data
        assert "readiness_score" in data
        assert "top_skills" in data

    def test_export_passport_to_resume(self, client):
        resp = client.get("/api/passport/cp_test_api_01/export-resume")
        assert resp.status_code == 200
        resume_data = resp.json()
        assert resume_data["personal"]["full_name"] == "Rohan Deshmukh"
        assert "System Architecture" in resume_data["skills"]

    def test_import_resume_into_passport(self, client):
        update_resume = {
            "personal": {
                "full_name": "Rohan Deshmukh",
                "title": "Principal Growth Architect",
                "email": "rohan@example.com",
                "location": "Pune, India"
            },
            "skills": ["System Architecture", "Rust", "Kubernetes"],
            "experience": [
                {
                    "company": "NextGen AI",
                    "role": "Principal Architect",
                    "start_date": "2024",
                    "end_date": "Present",
                    "description": "Architected low-latency distributed engines."
                }
            ],
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            "template": "minimal"
        }
        resp = client.post("/api/passport/cp_test_api_01/import-resume", json=update_resume)
        assert resp.status_code == 200

        # Verify updated passport
        get_resp = client.get("/api/passport/cp_test_api_01")
        assert get_resp.status_code == 200
        p_data = get_resp.json()
        assert p_data["personal"]["title"] == "Principal Growth Architect"
        skill_names = [s["name"] for s in p_data["skills"]]
        assert "Rust" in skill_names

    def test_portfolio_rendered_from_passport(self, client):
        resp = client.get("/portfolio/cp_test_api_01")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]
        assert "Rohan Deshmukh" in resp.text

    def test_assessment_attaches_to_career_passport(self, client):
        resp = client.post("/api/career/venture-readiness", json={
            "passport_id": "cp_test_api_01",
            "blueprint_industry": "Healthcare AI",
            "blueprint_name": "HealthGuard Pro",
            "skills": ["System Architecture", "Security", "ML"],
            "experience_summary": "10 years building mission critical infrastructure"
        })
        assert resp.status_code == 200

        # Check that assessment record is attached in the passport
        get_resp = client.get("/api/passport/cp_test_api_01")
        assert get_resp.status_code == 200
        p_data = get_resp.json()
        assert len(p_data["assessments"]) > 0
        latest_assess = p_data["assessments"][-1]
        assert latest_assess["target_context"] == "Healthcare AI"

    def test_dashboard_page_rendered(self, client):
        resp = client.get("/dashboard")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]
        assert "Career Passport" in resp.text

        resp_passport = client.get("/passport")
        assert resp_passport.status_code == 200
        assert "text/html" in resp_passport.headers["content-type"]


