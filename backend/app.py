import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
import requests
from flask_cors import CORS
from flask_talisman import Talisman
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, decode_token
from backend.database import init_db, session_scope
from backend.models import (
    BusinessIdea,
    DailyTask,
    FounderProfile,
    JournalEntry,
    Milestone,
    User,
    Venture,
)
from backend.auth import auth_bp
from backend.auth.utils import save_user_module_data, get_user_module_data
from backend.services.production import RATE_LIMITERS, gemini_service, sanitize_text

for env_path in (BASE_DIR / ".env", REPO_ROOT / ".env"):
    if env_path.exists():
        load_dotenv(env_path)


def resolve_database_url(database_url: str) -> str:
    if not database_url.startswith("sqlite"):
        return database_url

    if database_url.startswith("sqlite://") and "/" in database_url[10:]:
        relative_path = database_url.split("sqlite:///", 1)[-1]
        if relative_path and not relative_path.startswith(("/", "C:/", "C:\\")):
            resolved = (REPO_ROOT / relative_path).resolve()
            return f"sqlite:///{resolved.as_posix()}"

    return database_url


FRONTEND_DIST = os.path.join(REPO_ROOT, "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================
# CORS configuration - hardened for production
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8000").split(","),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600,
    }
})

# Talisman - HTTPS and security headers
# Disable forced HTTPS for local development and test clients while preserving the
# security headers in production environments.
if os.getenv("FLASK_ENV") == "production":
    Talisman(app)
else:
    Talisman(app, force_https=False)

# ============================================================================
# JWT CONFIGURATION
# ============================================================================
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-this-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

jwt = JWTManager(app)

# ============================================================================
# ERROR HANDLERS
# ============================================================================
@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized - invalid or missing token"}), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({"error": "Forbidden"}), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# REGISTER BLUEPRINTS
# ============================================================================
app.register_blueprint(auth_bp)

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================
database_url = resolve_database_url(os.getenv("DATABASE_URL", "sqlite:///backend/paisapreneur.db"))
init_db(database_url)


def normalize_email(value):
    if not value or not isinstance(value, str):
        return ""
    return value.strip().lower()


def make_json_list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


def build_profile_payload(profile):
    data = profile.to_dict()
    profile_data = data.copy()
    profile_data["interests"] = json.loads(profile.interests or "[]")
    profile_data["strengths"] = json.loads(profile.strengths or "[]")
    profile_data["onboarding_profile"] = json.loads(profile.onboarding_profile or "{}")
    return profile_data


def create_default_tasks(profile):
    interests = json.loads(profile.interests or "[]")
    strengths = json.loads(profile.strengths or "[]")
    base_title = profile.name or "Founder"
    tasks = [
        {
            "title": "Review your daily founder dashboard",
            "description": "Open your founder OS and update priorities before the day begins.",
            "priority": "high",
        },
        {
            "title": "Capture progress in your founder journal",
            "description": "Log one lesson, one challenge, and one decision from today.",
            "priority": "medium",
        },
        {
            "title": "Prepare one execution task for your top venture",
            "description": "Choose the highest-leverage action that moves your chosen venture forward.",
            "priority": "high",
        },
    ]

    if any("ai" in interest for interest in interests):
        tasks.append({
            "title": "Review AI opportunity assumptions",
            "description": "Validate where AI creates real value and where manual support is still needed.",
            "priority": "high",
        })
    else:
        tasks.append({
            "title": "Validate your customer problem once more",
            "description": "Speak with one potential user and capture real pain points.",
            "priority": "high",
        })

    if "marketing" in strengths or "sales" in strengths:
        tasks.append({
            "title": "Map your first customer outreach sequence",
            "description": "Turn your strongest value proposition into a sequence for early buyers.",
            "priority": "medium",
        })

    return [DailyTask(
        founder_email=profile.email,
        title=task["title"],
        description=task["description"],
        priority=task["priority"],
    ) for task in tasks]


def create_default_ventures(profile):
    interests = json.loads(profile.interests or "[]")
    names = []
    if "ai_tools" in interests:
        names.append({
            "title": "AI Productivity Co-founder OS",
            "summary": "A founder dashboard that turns AI workflows into daily execution habits and monetizes through premium subscriptions.",
            "monetization": "Monthly SaaS subscription + premium coaching bundle.",
        })
    if "saas" in interests:
        names.append({
            "title": "Vertical SaaS for Remote Teams",
            "summary": "A narrow, high-value team productivity product tailored to founder-led remote startups.",
            "monetization": "Tiered subscription plus pilot agreements.",
        })
    if "content_business" in interests:
        names.append({
            "title": "Creator Growth System",
            "summary": "A content and commerce engine that helps founders convert audience engagement into recurring revenue.",
            "monetization": "Sponsorship, premium training, and retention-based consulting.",
        })
    if not names:
        names.append({
            "title": "Founder Launch Accelerator",
            "summary": "A daily operating system that helps ambitious founders turn ideas into measurable revenue progress.",
            "monetization": "Subscription, performance consulting, and founder mentorship.",
        })

    return [Venture(
        founder_email=profile.email,
        title=item["title"],
        summary=item["summary"],
        monetization=item["monetization"],
        progress="start",
        status="draft",
    ) for item in names[:2]]


def create_default_milestones(profile):
    default_titles = [
        "Clarify core customer problem",
        "Ship first MVP or service pilot",
        "Collect first paying user",
        "Lock in repeatable acquisition path",
    ]
    return [Milestone(
        founder_email=profile.email,
        title=title,
        completed=False,
        category="launch",
    ) for title in default_titles]


def generate_insights(profile, ventures, tasks, journal):
    interests = json.loads(profile.interests or "[]")
    strengths = json.loads(profile.strengths or "[]")
    venture_count = len(ventures)
    task_completion = sum(1 for task in tasks if task.completed)
    journal_count = len(journal)

    return {
        "weeklyGuidance": (
            "Keep your founder OS active: focus on the one task that unlocks progress for your top venture, "
            "capture feedback daily, and protect your execution rhythm."
        ),
        "executionPriority": (
            "Turn your most uncertain assumption into a testable experiment today. "
            "That is the fastest path to clarity and momentum."
        ),
        "motivationalInsight": (
            f"You have {venture_count} venture{'s' if venture_count != 1 else ''} on deck and {journal_count} journal entries. "
            "That means you are building both strategy and founder wisdom — keep both in motion."
        ),
        "riskWarning": (
            "The biggest risk is execution drift: avoid chasing new ideas before the current venture has a repeatable feedback loop."
        ),
        "focusRecommendations": (
            "Double down on consistent habit formation, not perfection. If a task helps you learn faster, make it your priority."
        ),
        "focusArea": (
            "Product-market clarity" if "ai_tools" in interests or "saas" in interests else "Customer conversations"
        ),
    }


def calculate_progress(profile, ventures, tasks, milestones, journal):
    completed_tasks = sum(1 for task in tasks if task.completed)
    task_ratio = completed_tasks / max(len(tasks), 1)
    completed_milestones = sum(1 for milestone in milestones if milestone.completed)
    journal_count = len(journal)
    venture_count = len(ventures)

    execution_score = min(100, 55 + int(task_ratio * 30) + journal_count * 3 + venture_count * 4)
    readiness_score = min(100, 35 + int(task_ratio * 40) + completed_milestones * 7 + venture_count * 5)
    founder_streak = min(14, max(1, completed_tasks))

    if completed_milestones >= 3 and venture_count >= 2:
        maturity = "Scaling"
    elif completed_milestones >= 2:
        maturity = "Emerging"
    else:
        maturity = "Launch Ready"

    return {
        "launchReadiness": readiness_score,
        "executionScore": execution_score,
        "founderStreak": founder_streak,
        "milestonesCompleted": completed_milestones,
        "maturityStage": maturity,
        "businessMaturityStage": maturity,
        "ventureCount": venture_count,
    }


def ensure_founder_assets(session, profile):
    existing_tasks = session.query(DailyTask).filter_by(founder_email=profile.email).count()
    existing_ventures = session.query(Venture).filter_by(founder_email=profile.email).count()
    existing_milestones = session.query(Milestone).filter_by(founder_email=profile.email).count()

    if existing_tasks == 0:
        session.add_all(create_default_tasks(profile))
    if existing_ventures == 0:
        session.add_all(create_default_ventures(profile))
    if existing_milestones == 0:
        session.add_all(create_default_milestones(profile))


def build_dashboard(session, profile):
    ensure_founder_assets(session, profile)
    tasks = session.query(DailyTask).filter_by(founder_email=profile.email).order_by(DailyTask.id.asc()).all()
    ventures = session.query(Venture).filter_by(founder_email=profile.email).order_by(Venture.id.asc()).all()
    journal = session.query(JournalEntry).filter_by(founder_email=profile.email).order_by(JournalEntry.id.desc()).all()
    milestones = session.query(Milestone).filter_by(founder_email=profile.email).order_by(Milestone.id.asc()).all()

    progression = calculate_progress(profile, ventures, tasks, milestones, journal)
    insights = generate_insights(profile, ventures, tasks, journal)

    return {
        "profile": build_profile_payload(profile),
        "progress": progression,
        "tasks": [task.to_dict() for task in tasks],
        "ventures": [venture.to_dict() for venture in ventures],
        "journal": [entry.to_dict() for entry in journal],
        "milestones": [milestone.to_dict() for milestone in milestones],
        "insights": insights,
        "founderScore": progression["executionScore"],
        "readinessScore": progression["launchReadiness"],
        "generatedAt": datetime.utcnow().isoformat() + "Z",
    }


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(status="ok", database=database_url)


@app.route("/api/profile", methods=["GET", "PUT"])
def user_profile():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        token = auth_header.split(" ", 1)[1].strip()
        user_id = decode_token(token)["sub"]
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    with session_scope() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if request.method == "GET":
            return jsonify({"success": True, "profile": user.to_dict()})

        payload = request.get_json(silent=True) or {}
        for field in [
            "full_name",
            "headline",
            "location",
            "bio",
            "experience",
            "website",
            "linkedin_url",
            "github_url",
            "avatar_url",
        ]:
            if field in payload:
                setattr(user, field, payload[field])

        user.updated_at = datetime.utcnow()
        session.commit()
        return jsonify({"success": True, "profile": user.to_dict()})


@app.route("/api/chat", methods=["POST"])
def chat_route():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message") or payload.get("prompt") or ""
    if not message:
        return jsonify(error="Message is required."), 400

    client_key = request.headers.get("X-Client-Id") or request.remote_addr or "default"
    if not RATE_LIMITERS["ai"].allow(client_key):
        return jsonify(error="Rate limit exceeded."), 429

    cleaned_message = sanitize_text(message)
    if not cleaned_message:
        return jsonify(error="Message is required."), 400

    try:
        content = gemini_service.generate(cleaned_message)
        return jsonify({"response": content})
    except Exception:
        return jsonify({"response": "I’m available to help with your career, resume, interviews, and founder planning."})


@app.route("/api/resume/generate", methods=["POST"])
@jwt_required()
def resume_generate():
    payload = request.get_json(silent=True) or {}
    prompt = payload.get("prompt") or ""
    user_id = get_jwt_identity()
    data = payload.get("data") or {}
    if user_id:
        save_user_module_data(user_id, "resume", {"prompt": prompt, "data": data}, record_key="latest")
    return jsonify({"content": f"AI-enhanced resume content for: {prompt[:120]}"})


@app.route("/api/resume/save", methods=["POST"])
@jwt_required()
def resume_save():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        result = save_user_module_data(user_id, "resume", payload, record_key="draft")
        return jsonify({"saved": True, "record": result})
    return jsonify({"saved": True})


@app.route("/api/resume/<int:resume_id>/export/pdf", methods=["GET"])
def resume_export_pdf(resume_id):
    return jsonify({"ok": True})


@app.route("/api/resume/<int:resume_id>/export/docx", methods=["GET"])
def resume_export_docx(resume_id):
    return jsonify({"ok": True})


@app.route("/api/interview/questions", methods=["POST"])
@jwt_required()
def interview_questions():
    payload = request.get_json(silent=True) or {}
    setup = payload.get("setup") or {}
    role = setup.get("role", "professional")
    company = setup.get("company", "target company")
    questions = [
        f"Tell me about a time you solved a complex problem as a {role}.",
        f"Why do you want to work at {company}?",
        "Describe a project where you made a measurable impact.",
        "How do you handle ambiguity and changing priorities?",
    ]
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "interview", {"setup": setup, "questions": questions}, record_key="latest")
    return jsonify({"questions": questions})


@app.route("/api/interview/evaluate", methods=["POST"])
@jwt_required()
def interview_evaluate():
    payload = request.get_json(silent=True) or {}
    answer = payload.get("answer") or ""
    feedback = f"Your answer is clear and structured. Add a metric and a stronger STAR example to improve your score. Answer preview: {answer[:120]}"
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "interview", {"answer": answer, "feedback": feedback}, record_key="evaluation")
    return jsonify({"feedback": feedback, "score": 8.5})


@app.route("/api/interview/history", methods=["GET"])
@jwt_required()
def interview_history():
    user_id = get_jwt_identity()
    records = get_user_module_data(user_id, "interview") if user_id else []
    history = [{"prompt": item["payload"].get("questions", ["Tell me about a time you led a team through change."])[0] if isinstance(item.get("payload"), dict) else "Tell me about a time you led a team through change."} for item in records]
    if not history:
        history = [{"prompt": "Tell me about a time you led a team through change."}]
    return jsonify({"history": history})


@app.route("/api/jobs/search", methods=["GET"])
@jwt_required()
def jobs_search():
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "job_search", {"query": request.args.to_dict()}, record_key="latest")
    return jsonify({"jobs": [{
        "company": "Microsoft",
        "role": "Senior Product Designer",
        "salary": "$160k - $190k",
        "location": "Remote, US",
        "experience": "Senior",
        "posted": "2 days ago",
        "description": "Build compelling product experiences for AI services.",
        "skills": ["Figma", "UX Research", "AI"],
        "match": 92,
        "missingSkills": "Advanced prototyping",
        "type": "Full-time",
    }]})


@app.route("/api/jobs/save", methods=["POST"])
@jwt_required()
def jobs_save():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "job_saved", payload, record_key=payload.get("company") or "saved")
    return jsonify({"saved": True})


@app.route("/api/jobs/applications", methods=["GET"])
@jwt_required()
def jobs_applications():
    user_id = get_jwt_identity()
    records = get_user_module_data(user_id, "job_saved") if user_id else []
    return jsonify({"applications": records})


@app.route("/api/passport/profile", methods=["GET", "POST"])
@jwt_required()
def passport_profile():
    user_id = get_jwt_identity()
    if request.method == "GET":
        records = get_user_module_data(user_id, "passport_profile") if user_id else []
        profile = records[0]["payload"] if records else {"careerLevel": "Growth Stage"}
        return jsonify({"profile": profile})

    payload = request.get_json(silent=True) or {}
    if user_id:
        save_user_module_data(user_id, "passport_profile", payload, record_key="profile")
    return jsonify({"saved": True, "profile": payload})


@app.route("/api/passport/achievement", methods=["POST"])
@jwt_required()
def passport_achievement():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "passport_achievement", payload, record_key=payload.get("title") or "achievement")
    return jsonify({"saved": True})


@app.route("/api/business/plan", methods=["POST"])
@jwt_required()
def business_plan():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "business_plan", payload, record_key="plan")
    return jsonify({"plan": [{"title": "Vision", "content": payload.get("idea", "Build your offer around one clear customer outcome.")}]})


@app.route("/api/business/marketing", methods=["POST"])
@jwt_required()
def business_marketing():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "business_marketing", payload, record_key="marketing")
    return jsonify({"marketing": [{"title": "Launch", "description": "Create one message and one CTA for your first audience."}]})


@app.route("/api/business/revenue", methods=["POST"])
@jwt_required()
def business_revenue():
    payload = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    if user_id:
        save_user_module_data(user_id, "business_revenue", payload, record_key="revenue")
    return jsonify({"revenue": [{"title": "Subscription", "description": "Package recurring access for your audience."}]})


@app.route("/api/founder/profile", methods=["POST"])
def save_founder_profile():
    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email"))
    name = payload.get("name", "").strip()
    if not email:
        return jsonify(error="Founder email is required."), 400

    with session_scope() as session:
        profile = session.query(FounderProfile).filter_by(email=email).first()
        interests = make_json_list(payload.get("interests", []))
        strengths = make_json_list(payload.get("strengths", []))
        onboarding_profile = {
            "experience": payload.get("experience", ""),
            "income_goals": payload.get("incomeGoals", ""),
            "budget": payload.get("budget", ""),
            "time_commitment": payload.get("timeCommitment", ""),
            "interests": interests,
            "strengths": strengths,
        }

        if not profile:
            profile = FounderProfile(
                email=email,
                name=name,
                experience=payload.get("experience", ""),
                interests=json.dumps(interests),
                income_goals=payload.get("incomeGoals", ""),
                budget=payload.get("budget", ""),
                time_commitment=payload.get("timeCommitment", ""),
                strengths=json.dumps(strengths),
                onboarding_profile=json.dumps(onboarding_profile),
            )
            session.add(profile)
        else:
            profile.name = name or profile.name
            profile.experience = payload.get("experience", profile.experience)
            profile.interests = json.dumps(interests) or profile.interests
            profile.income_goals = payload.get("incomeGoals", profile.income_goals)
            profile.budget = payload.get("budget", profile.budget)
            profile.time_commitment = payload.get("timeCommitment", profile.time_commitment)
            profile.strengths = json.dumps(strengths) or profile.strengths
            profile.onboarding_profile = json.dumps(onboarding_profile)
            profile.updated_at = datetime.utcnow()

        session.flush()
        dashboard = build_dashboard(session, profile)

    return jsonify(dashboard)


@app.route("/api/founder/dashboard", methods=["GET"])
def get_founder_dashboard():
    email = normalize_email(request.args.get("email", ""))
    if not email:
        return jsonify(error="Founder email is required."), 400

    with session_scope() as session:
        profile = session.query(FounderProfile).filter_by(email=email).first()
        if not profile:
            return jsonify(error="Founder profile not found."), 404
        dashboard = build_dashboard(session, profile)

    return jsonify(dashboard)


@app.route("/api/founder/ventures", methods=["GET", "POST"])
def founder_ventures():
    if request.method == "GET":
        email = normalize_email(request.args.get("email", ""))
        if not email:
            return jsonify(error="Founder email is required."), 400
        with session_scope() as session:
            ventures = session.query(Venture).filter_by(founder_email=email).all()
            return jsonify([venture.to_dict() for venture in ventures])

    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email", ""))
    title = payload.get("title", "").strip()
    summary = payload.get("summary", "").strip()
    monetization = payload.get("monetization", "").strip()
    if not email or not title or not summary:
        return jsonify(error="Email, title, and summary are required."), 400

    with session_scope() as session:
        venture = Venture(
            founder_email=email,
            title=title,
            summary=summary,
            monetization=monetization,
            progress="draft",
            status="active",
        )
        session.add(venture)
        session.flush()
        ventures = session.query(Venture).filter_by(founder_email=email).all()
        return jsonify([v.to_dict() for v in ventures])


@app.route("/api/founder/journal", methods=["GET", "POST"])
def founder_journal():
    if request.method == "GET":
        email = normalize_email(request.args.get("email", ""))
        if not email:
            return jsonify(error="Founder email is required."), 400
        with session_scope() as session:
            entries = (
                session.query(JournalEntry)
                .filter_by(founder_email=email)
                .order_by(JournalEntry.id.desc())
                .all()
            )
            return jsonify([entry.to_dict() for entry in entries])

    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email", ""))
    entry_text = payload.get("entry", "").strip()
    mood = payload.get("mood", "").strip()
    lessons = payload.get("lessons", "").strip()
    if not email or not entry_text:
        return jsonify(error="Email and journal entry are required."), 400

    with session_scope() as session:
        entry = JournalEntry(
            founder_email=email,
            entry=entry_text,
            mood=mood,
            lessons=lessons,
        )
        session.add(entry)
        session.flush()
        entries = (
            session.query(JournalEntry)
            .filter_by(founder_email=email)
            .order_by(JournalEntry.id.desc())
            .all()
        )
        return jsonify([item.to_dict() for item in entries])


@app.route("/api/founder/tasks", methods=["GET"])
def founder_tasks():
    email = normalize_email(request.args.get("email", ""))
    if not email:
        return jsonify(error="Founder email is required."), 400

    with session_scope() as session:
        tasks = session.query(DailyTask).filter_by(founder_email=email).order_by(DailyTask.id.asc()).all()
        return jsonify([task.to_dict() for task in tasks])


@app.route("/api/founder/task/toggle", methods=["POST"])
def toggle_founder_task():
    payload = request.get_json(silent=True) or {}
    email = normalize_email(payload.get("email", ""))
    task_id = payload.get("taskId")
    completed = payload.get("completed")
    if not email or task_id is None or completed is None:
        return jsonify(error="Email, taskId, and completed state are required."), 400

    with session_scope() as session:
        task = session.query(DailyTask).filter_by(founder_email=email, id=task_id).first()
        if not task:
            return jsonify(error="Task not found."), 404
        task.completed = bool(completed)
        session.flush()
        return jsonify(task.to_dict())


@app.route("/api/business-idea", methods=["POST"])
def business_idea():
    payload = request.get_json(silent=True) or {}
    industry = payload.get("industry", "growth")
    email = normalize_email(payload.get("email", ""))
    idea = {
        "business_name": f"{industry.title()} Launch Lab",
        "tagline": f"Rapid, revenue-first growth for {industry} founders.",
        "business_model": "A lean digital-first business that validates customer demand quickly and monetizes through subscription or consulting engagements.",
        "value_proposition": "Focuses on fast validation, low overhead, and measurable results for early-stage entrepreneurs.",
        "target_audience": "Ambitious founders, side hustlers, and small teams in India looking for scalable digital product and service models.",
        "problem_solved": "Too much time spent testing ideas without a clear revenue path or launch plan.",
        "solution": "A structured idea-to-launch playbook with clear customer acquisition and pricing guidance.",
    }

    with session_scope() as session:
        business_idea = BusinessIdea(
            industry=industry,
            business_name=idea["business_name"],
            tagline=idea["tagline"],
            business_model=idea["business_model"],
            value_proposition=idea["value_proposition"],
            target_audience=idea["target_audience"],
            problem_solved=idea["problem_solved"],
            solution=idea["solution"],
        )
        session.add(business_idea)
        if email:
            session.flush()
            venture = Venture(
                founder_email=email,
                title=idea["business_name"],
                summary=idea["solution"],
                monetization=idea["business_model"],
                progress="idea",
                status="draft",
            )
            session.add(venture)

    return jsonify(idea)


@app.route("/api/app-info", methods=["GET"])
def app_info():
    return jsonify(name="Paisapreneur", stack="React + Tailwind + Flask", database=database_url)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    dist_dir = app.static_folder or ""

    if path != "":
        requested_path = os.path.join(dist_dir, path)

        if os.path.exists(requested_path):
            return send_from_directory(dist_dir, path)

    return send_from_directory(dist_dir, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
