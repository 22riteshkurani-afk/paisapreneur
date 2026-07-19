import hashlib
import hmac
import logging
import os
import re
import time
import json
from datetime import datetime, timedelta
from typing import Any, Dict, List

import requests
from flask import request
from werkzeug.security import check_password_hash, generate_password_hash

logger = logging.getLogger("paisapreneur")
logger.setLevel(logging.INFO)


class SimpleRateLimiter:
    def __init__(self, limit: int = 60, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = {}

    def allow(self, key: str) -> bool:
        now = time.time()
        bucket = self._requests.setdefault(key, [])
        bucket[:] = [timestamp for timestamp in bucket if now - timestamp < self.window_seconds]
        if len(bucket) >= self.limit:
            return False
        bucket.append(now)
        return True


RATE_LIMITERS = {
    "auth": SimpleRateLimiter(limit=20, window_seconds=60),
    "ai": SimpleRateLimiter(limit=20, window_seconds=60),
    "payments": SimpleRateLimiter(limit=10, window_seconds=60),
}


def validate_environment() -> List[str]:
    errors: List[str] = []
    if not os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET_KEY") == "change-this-in-production":
        errors.append("JWT_SECRET_KEY should be set to a strong secret in production")
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("VITE_GEMINI_API"):
        errors.append("GEMINI_API_KEY or VITE_GEMINI_API should be configured for AI features")
    return errors


def validate_required_fields(payload: Dict[str, Any], required_fields: List[str]) -> List[str]:
    errors: List[str] = []
    for field in required_fields:
        value = payload.get(field)
        if value is None or (isinstance(value, str) and not value.strip()):
            errors.append(f"{field} is required")
    return errors


def sanitize_text(value: str) -> str:
    if not isinstance(value, str):
        return ""
    return re.sub(r"\s+", " ", value).strip()


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, password) if password_hash else False


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API") or ""
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    def generate(self, prompt: str, history: List[Dict[str, str]] | None = None) -> str:
        if not self.api_key:
            return self._fallback_response(prompt)

        payload = {
            "contents": [{"parts": [{"text": self._build_prompt(prompt, history)}]}],
        }
        try:
            response = requests.post(f"{self.base_url}?key={self.api_key}", json=payload, timeout=25)
            response.raise_for_status()
            body = response.json()
            return body["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as exc:
            logger.exception("Gemini request failed: %s", exc)
            return self._fallback_response(prompt)

    def stream(self, prompt: str, history: List[Dict[str, str]] | None = None) -> Dict[str, Any]:
        return {"content": self.generate(prompt, history), "streaming": True}

    def _build_prompt(self, prompt: str, history: List[Dict[str, str]] | None = None) -> str:
        if not history:
            return prompt
        context = "\n".join([f"{entry['role']}: {entry['content']}" for entry in history[-6:]])
        return f"Conversation context:\n{context}\n\nUser: {prompt}"

    def _fallback_response(self, prompt: str) -> str:
        return (
            "I can help with your career, resume, interview prep, business planning, and job search. "
            f"Your request: {prompt[:160]}"
        )


class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "")
        self.key = os.getenv("SUPABASE_ANON_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.url and self.key)

    def upsert(self, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_configured():
            return {"status": "skipped", "table": table}
        try:
            response = requests.post(
                f"{self.url}/rest/v1/{table}",
                headers={
                    "apikey": self.key,
                    "Authorization": f"Bearer {self.key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=15,
            )
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            logger.exception("Supabase upsert failed: %s", exc)
            return {"status": "error", "error": str(exc)}


class RazorpayService:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "")
        self.secret = os.getenv("RAZORPAY_SECRET", "")

    def create_order(self, amount: int, receipt: str = "paisapreneur") -> Dict[str, Any]:
        if not self.key_id or not self.secret:
            return {
                "order_id": f"demo-order-{int(time.time())}",
                "amount": amount,
                "currency": "INR",
                "receipt": receipt,
                "key": self.key_id or "demo-key",
                "test_mode": True,
            }

        return {
            "order_id": f"rzp_{int(time.time())}",
            "amount": amount,
            "currency": "INR",
            "receipt": receipt,
            "key": self.key_id,
            "test_mode": False,
        }

    def verify_signature(self, payload: Dict[str, Any], signature: str) -> bool:
        if not self.secret:
            return True
        body = json.dumps(payload, separators=(",", ":"), sort_keys=True)
        expected = hmac.new(self.secret.encode("utf-8"), body.encode("utf-8"), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


gemini_service = GeminiService()
supabase_service = SupabaseService()
razorpay_service = RazorpayService()
