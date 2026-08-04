"""
Authentication utilities for token generation, validation, and Google OAuth
"""

import os
import json
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from google.auth.transport import requests
from google.oauth2 import id_token
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models import User, UserModuleData
from backend.database import session_scope


def verify_google_token(token):
    """
    Verify Google OAuth token and return user info
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        dict with email, full_name, picture, sub (provider_id)
        
    Raises:
        ValueError: If token is invalid
    """
    try:
        # Get Google OAuth client ID from environment
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not google_client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured")
        
        # Verify the token with Google's servers
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), google_client_id)
        
        # Token is valid, extract user info
        return {
            "email": idinfo.get("email"),
            "full_name": idinfo.get("name"),
            "avatar_url": idinfo.get("picture"),
            "provider_id": idinfo.get("sub"),
            "verified_email": idinfo.get("email_verified", False),
        }
    except ValueError as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error verifying Google token: {str(e)}")


def create_or_update_user(oauth_info):
    """
    Create new user or update existing user from OAuth info
    
    Args:
        oauth_info: dict from verify_google_token()
        
    Returns:
        User object
    """
    with session_scope() as session:
        user = session.query(User).filter_by(email=oauth_info["email"]).first()

        if user:
            user.full_name = oauth_info["full_name"]
            user.avatar_url = oauth_info["avatar_url"]
            user.provider = "google"
            user.provider_id = oauth_info["provider_id"]
            user.last_login = datetime.utcnow()
            session.commit()
        else:
            user = User(
                email=oauth_info["email"],
                full_name=oauth_info["full_name"],
                avatar_url=oauth_info["avatar_url"],
                provider="google",
                provider_id=oauth_info["provider_id"],
                onboarding_completed=False,
                subscription_tier="free",
                last_login=datetime.utcnow(),
            )
            session.add(user)
            session.commit()

        return user


def create_email_user(email: str, password: str, full_name: str | None = None):
    normalized_email = (email or "").strip().lower()
    if not normalized_email or not password:
        raise ValueError("Email and password are required")

    with session_scope() as session:
        existing = session.query(User).filter_by(email=normalized_email).first()
        if existing:
            if existing.provider == "email":
                raise ValueError("User already exists")
            existing.provider = "email"
            existing.full_name = full_name or existing.full_name
            existing.password_hash = generate_password_hash(password)
            existing.last_login = datetime.utcnow()
            return existing

        user = User(
            email=normalized_email,
            full_name=full_name,
            provider="email",
            password_hash=generate_password_hash(password),
            onboarding_completed=False,
            subscription_tier="free",
            last_login=datetime.utcnow(),
        )
        session.add(user)
        session.commit()
        return user


def authenticate_email_user(email: str, password: str):
    normalized_email = (email or "").strip().lower()
    with session_scope() as session:
        user = session.query(User).filter_by(email=normalized_email).first()
        if not user or not user.password_hash:
            return None
        if check_password_hash(user.password_hash, password):
            user.last_login = datetime.utcnow()
            session.commit()
            return user
        return None


def save_user_module_data(user_id: int, module_name: str, payload: dict, record_key: str | None = None):
    safe_payload = json.dumps(payload or {}, default=str)
    with session_scope() as session:
        existing = None
        if record_key:
            existing = session.query(UserModuleData).filter_by(user_id=user_id, module_name=module_name, record_key=record_key).first()
        if existing:
            existing.payload = safe_payload
            existing.updated_at = datetime.utcnow()
            return existing.to_dict()

        entry = UserModuleData(
            user_id=user_id,
            module_name=module_name,
            record_key=record_key,
            payload=safe_payload,
        )
        session.add(entry)
        session.commit()
        return entry.to_dict()


def get_user_module_data(user_id: int, module_name: str, record_key: str | None = None):
    with session_scope() as session:
        query = session.query(UserModuleData).filter_by(user_id=user_id, module_name=module_name)
        if record_key:
            query = query.filter_by(record_key=record_key)
        items = query.order_by(UserModuleData.updated_at.desc()).all()
        return [item.to_dict() for item in items]


def generate_tokens(user_id):
    """
    Generate JWT access and refresh tokens
    
    Args:
        user_id: User ID
        
    Returns:
        tuple (access_token, refresh_token)
    """
    # Access token expires in 15 minutes
    access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(minutes=15)
    )
    
    # Refresh token expires in 7 days
    refresh_token = create_refresh_token(
        identity=user_id,
        expires_delta=timedelta(days=7)
    )
    
    return access_token, refresh_token


def get_current_user():
    """
    Get current authenticated user from JWT
    
    Returns:
        User object or None
    """
    user_id = get_jwt_identity()
    if not user_id:
        return None
    
    with session_scope() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if user:
            # Convert to dict to avoid session issues
            return user.to_dict()
        return None
