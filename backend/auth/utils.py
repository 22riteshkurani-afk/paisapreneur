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
from backend.models import User
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
        # Check if user exists by email or provider_id
        user = session.query(User).filter_by(email=oauth_info["email"]).first()
        
        if user:
            # Update existing user
            user.full_name = oauth_info["full_name"]
            user.avatar_url = oauth_info["avatar_url"]
            user.provider_id = oauth_info["provider_id"]
            user.last_login = datetime.utcnow()
            session.commit()
        else:
            # Create new user
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
