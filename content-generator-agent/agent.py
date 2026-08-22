"""
Content Generation Agent
Powered by Microsoft Agent Framework and Azure AI Foundry
"""

import os
from typing import Optional
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.ai.agent.framework import Agent, AgentConfig, Tool


# Load environment variables
load_dotenv()


class ContentGeneratorAgent:
    """Content generation agent for creating various types of content."""
    
    def __init__(self):
        """Initialize the content generator agent."""
        self.credential = DefaultAzureCredential()
        self.config = AgentConfig(
            model_deployment_name=os.getenv("FOUNDRY_DEPLOYMENT_NAME", "gpt-4"),
            endpoint=os.getenv("FOUNDRY_ENDPOINT"),
        )
        self.agent: Optional[Agent] = None
        self._setup_tools()
    
    def _setup_tools(self) -> None:
        """Set up tools for the agent."""
        # Example tools can be added here
        pass
    
    def initialize(self) -> None:
        """Initialize the agent with Foundry credentials."""
        try:
            self.agent = Agent(
                config=self.config,
                credential=self.credential,
                name="content-generator",
                description="AI agent for generating various types of content"
            )
            print("✓ Agent initialized successfully")
        except Exception as e:
            raise RuntimeError(f"Failed to initialize agent: {e}")
    
    async def generate_content(self, prompt: str) -> str:
        """
        Generate content based on the provided prompt.
        
        Args:
            prompt: The content generation prompt
            
        Returns:
            Generated content as a string
        """
        if not self.agent:
            raise RuntimeError("Agent not initialized. Call initialize() first.")
        
        try:
            response = await self.agent.run(prompt)
            return response.content
        except Exception as e:
            raise RuntimeError(f"Content generation failed: {e}")


async def main():
    """Main entry point for the agent."""
    agent = ContentGeneratorAgent()
    agent.initialize()
    
    # Example usage
    prompt = "Write a blog post about the benefits of AI in content creation"
    result = await agent.generate_content(prompt)
    print(f"Generated content:\n{result}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
