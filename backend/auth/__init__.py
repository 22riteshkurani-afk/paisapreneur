"""
Paisapreneur Authentication Module
Handles JWT, OAuth, and session management
"""

from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

from backend.auth import routes  # noqa: F401, E402
