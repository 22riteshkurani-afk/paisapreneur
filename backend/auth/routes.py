"""
Authentication routes for login, logout, token refresh, etc.
"""

import os
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.auth import auth_bp
from backend.auth.utils import (
    verify_google_token,
    create_or_update_user,
    create_email_user,
    authenticate_email_user,
    generate_tokens,
    get_current_user,
)
from backend.models import User
from backend.database import session_scope


@auth_bp.route("/google", methods=["POST"])
def google_login():
    """
    Handle Google OAuth login
    Frontend sends Google ID token
    Backend verifies and creates JWT tokens
    
    Request JSON:
        - token: Google ID token
        
    Response:
        - access_token: JWT for API requests
        - refresh_token: Token for refreshing access_token
        - user: User info
    """
    try:
        data = request.get_json()
        if not data or "token" not in data:
            return jsonify({"error": "Missing Google token"}), 400
        
        google_token = data["token"]
        
        # Verify Google token
        oauth_info = verify_google_token(google_token)
        
        # Create or update user in database
        user = create_or_update_user(oauth_info)
        
        # Generate JWT tokens
        access_token, refresh_token = generate_tokens(user.id)
        
        return jsonify({
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        }), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Authentication failed", "details": str(e)}), 500


@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = create_email_user(email, password, full_name)
        access_token, refresh_token = generate_tokens(user.id)
        return jsonify({
            "success": True,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        }), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = authenticate_email_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    access_token, refresh_token = generate_tokens(user.id)
    return jsonify({
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    """
    Refresh access token using refresh token
    
    Response:
        - access_token: New JWT
        - user: User info
    """
    try:
        user_id = get_jwt_identity()
        
        # Generate new access token
        access_token, _ = generate_tokens(user_id)
        
        # Get user info
        with session_scope() as session:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            user_data = user.to_dict()
        
        return jsonify({
            "success": True,
            "access_token": access_token,
            "user": user_data,
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Token refresh failed"}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """
    Get current authenticated user info
    Protected route - requires valid JWT
    
    Response:
        - user: Current user info
    """
    try:
        user_id = get_jwt_identity()
        
        with session_scope() as session:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            user_data = user.to_dict()
        
        return jsonify({
            "success": True,
            "user": user_data,
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to fetch user"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout - clear tokens on frontend
    Backend just confirms logout
    Frontend handles token cleanup
    
    Response:
        - success: True
    """
    try:
        # In a production system with refresh tokens in cookies,
        # you might want to blacklist the token here
        return jsonify({
            "success": True,
            "message": "Logged out successfully",
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Logout failed"}), 500


@auth_bp.route("/onboarding-status", methods=["GET"])
@jwt_required()
def get_onboarding_status():
    """
    Check if user has completed onboarding
    Protected route - requires valid JWT
    
    Response:
        - onboarding_completed: boolean
        - user: User info
    """
    try:
        user_id = get_jwt_identity()
        
        with session_scope() as session:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            user_data = user.to_dict()
        
        return jsonify({
            "success": True,
            "onboarding_completed": user_data["onboarding_completed"],
            "user": user_data,
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to fetch onboarding status"}), 500


@auth_bp.route("/complete-onboarding", methods=["POST"])
@jwt_required()
def complete_onboarding():
    """
    Mark onboarding as completed
    Protected route - requires valid JWT
    
    Response:
        - success: True
        - user: Updated user info
    """
    try:
        user_id = get_jwt_identity()
        
        with session_scope() as session:
            user = session.query(User).filter_by(id=user_id).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            user.onboarding_completed = True
            session.commit()
            user_data = user.to_dict()
        
        return jsonify({
            "success": True,
            "user": user_data,
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Failed to complete onboarding"}), 500
