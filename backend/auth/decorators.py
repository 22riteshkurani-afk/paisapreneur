"""
Authentication decorators for protecting routes
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


def token_required(fn):
    """
    Decorator to require valid JWT token
    Returns 401 if token is missing or invalid
    """
    @wraps(fn)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return decorated_function
