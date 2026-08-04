import os
import subprocess
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app import app
from backend.services.production import RATE_LIMITERS


def test_app_imports_when_started_from_backend_directory():
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    proc = subprocess.run(
        [sys.executable, "-c", "import app"],
        cwd=backend_dir,
        capture_output=True,
        text=True,
    )

    assert proc.returncode == 0, proc.stderr.strip()


def test_chat_endpoint_returns_payload():
    client = app.test_client()
    response = client.post(
        "/api/chat",
        json={"message": "Help me create a strong career summary"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "response" in data
    assert isinstance(data["response"], str)


def test_chat_endpoint_rate_limited_after_many_requests():
    client = app.test_client()
    RATE_LIMITERS["ai"]._requests.clear()

    response = None
    for _ in range(21):
        response = client.post(
            "/api/chat",
            json={"message": "Rate limit test"},
        )
        if response.status_code == 429:
            break

    assert response is not None
    assert response.status_code == 429


def test_user_profile_endpoint_round_trip():
    client = app.test_client()
    response = client.post(
        "/api/auth/register",
        json={"email": "profile.user@example.com", "password": "Password123!", "full_name": "Profile User"},
    )

    assert response.status_code == 201, response.get_data(as_text=True)
    token = response.get_json()["access_token"]

    profile_get = client.get(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile_get.status_code == 200

    payload = {"full_name": "Updated Profile User", "headline": "Product Builder", "location": "Remote"}
    profile_put = client.put(
        "/api/profile",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profile_put.status_code == 200, profile_put.get_data(as_text=True)
    body = profile_put.get_json()
    assert body["profile"]["full_name"] == "Updated Profile User"
    assert body["profile"]["headline"] == "Product Builder"
