import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(256), unique=True, nullable=False, index=True)
    full_name = Column(String(256), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    provider = Column(String(64), default="google")  # "google", "email", etc.
    provider_id = Column(String(256), nullable=True, unique=True)
    password_hash = Column(String(512), nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    subscription_tier = Column(String(64), default="free")  # free, pro, enterprise
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "avatar_url": self.avatar_url,
            "provider": self.provider,
            "provider_id": self.provider_id,
            "onboarding_completed": self.onboarding_completed,
            "subscription_tier": self.subscription_tier,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class FounderProfile(Base):
    __tablename__ = "founder_profiles"

    id = Column(Integer, primary_key=True)
    email = Column(String(256), unique=True, nullable=False)
    name = Column(String(256), nullable=True)
    experience = Column(String(64), nullable=True)
    interests = Column(Text, nullable=True)
    income_goals = Column(String(64), nullable=True)
    budget = Column(String(64), nullable=True)
    time_commitment = Column(String(64), nullable=True)
    strengths = Column(Text, nullable=True)
    onboarding_profile = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "experience": self.experience,
            "interests": json.loads(self.interests or "[]"),
            "income_goals": self.income_goals,
            "budget": self.budget,
            "time_commitment": self.time_commitment,
            "strengths": json.loads(self.strengths or "[]"),
            "onboarding_profile": json.loads(self.onboarding_profile or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class Venture(Base):
    __tablename__ = "ventures"

    id = Column(Integer, primary_key=True)
    founder_email = Column(String(256), nullable=False)
    title = Column(String(256), nullable=False)
    summary = Column(Text, nullable=False)
    monetization = Column(Text, nullable=True)
    progress = Column(Text, nullable=True)
    status = Column(String(64), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "monetization": self.monetization,
            "progress": self.progress,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True)
    founder_email = Column(String(256), nullable=False)
    entry = Column(Text, nullable=False)
    mood = Column(String(64), nullable=True)
    lessons = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "entry": self.entry,
            "mood": self.mood,
            "lessons": self.lessons,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(Integer, primary_key=True)
    founder_email = Column(String(256), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String(32), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True)
    founder_email = Column(String(256), nullable=False)
    title = Column(String(256), nullable=False)
    completed = Column(Boolean, default=False)
    category = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "category": self.category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class BusinessIdea(Base):
    __tablename__ = "business_ideas"

    id = Column(Integer, primary_key=True)
    industry = Column(String(128), nullable=False)
    business_name = Column(String(256), nullable=False)
    tagline = Column(String(512), nullable=False)
    business_model = Column(Text, nullable=False)
    value_proposition = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    problem_solved = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "industry": self.industry,
            "business_name": self.business_name,
            "tagline": self.tagline,
            "business_model": self.business_model,
            "value_proposition": self.value_proposition,
            "target_audience": self.target_audience,
            "problem_solved": self.problem_solved,
            "solution": self.solution,
        }


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    title = Column(String(256), nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "title": self.title,
            "content": json.loads(self.content or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    session_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "session_data": json.loads(self.session_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    job_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "job_data": json.loads(self.job_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CareerPassport(Base):
    __tablename__ = "career_passports"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    profile_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "profile_data": json.loads(self.profile_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class BusinessPlanEntry(Base):
    __tablename__ = "business_plans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    plan_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "plan_data": json.loads(self.plan_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    user_email = Column(String(256), nullable=False, index=True)
    message_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_email": self.user_email,
            "message_data": json.loads(self.message_data or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
