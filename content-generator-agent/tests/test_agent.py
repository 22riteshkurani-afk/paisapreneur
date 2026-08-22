"""
Tests for the content generator agent
"""

import pytest
from agent import ContentGeneratorAgent


class TestContentGeneratorAgent:
    """Test cases for ContentGeneratorAgent."""
    
    def test_agent_initialization(self):
        """Test that the agent initializes correctly."""
        agent = ContentGeneratorAgent()
        assert agent is not None
        assert agent.credential is not None
    
    @pytest.mark.asyncio
    async def test_generate_content_without_init(self):
        """Test that generate_content fails without initialization."""
        agent = ContentGeneratorAgent()
        
        with pytest.raises(RuntimeError):
            await agent.generate_content("Test prompt")
