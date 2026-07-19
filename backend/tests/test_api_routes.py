import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app import app
from backend.services.production import RATE_LIMITERS


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
