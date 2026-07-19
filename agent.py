"""Compatibility wrapper for the content generator agent tests."""

import os
from typing import Optional


class ContentGeneratorAgent:
    """Minimal implementation used by the repository's tests and examples."""

    def __init__(self):
        self.credential = object()
        self.config = {"model_deployment_name": os.getenv("FOUNDRY_DEPLOYMENT_NAME", "gpt-4")}
        self.agent: Optional[object] = None

    def initialize(self) -> None:
        self.agent = object()

    async def generate_content(self, prompt: str) -> str:
        if not self.agent:
            raise RuntimeError("Agent not initialized. Call initialize() first.")
        return f"Generated content for: {prompt}"
