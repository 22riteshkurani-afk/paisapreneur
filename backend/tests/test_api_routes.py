import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app import app


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
