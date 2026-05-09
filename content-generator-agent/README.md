# Content Generator Agent

AI-powered agent for generating various types of content using Microsoft Foundry and Azure AI.

## Prerequisites

- Python 3.9+
- Azure subscription with Azure AI Foundry access
- VS Code with Python extension

## Setup

### 1. Authenticate with Azure

```bash
azd auth login
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.template` to `.env` and fill in your Foundry credentials:

```bash
cp .env.template .env
```

Update `.env` with:
- `FOUNDRY_PROJECT_ID`: Your Foundry project ID
- `FOUNDRY_DEPLOYMENT_NAME`: Your model deployment name
- `FOUNDRY_ENDPOINT`: Your Foundry endpoint URL
- `FOUNDRY_MODEL_NAME`: The model name (e.g., "gpt-4")

### 4. Run the Agent

```bash
python agent.py
```

## Development

### Running Tests

```bash
pytest tests/
```

### Debug in VS Code

1. Open the workspace in VS Code
2. Select the debug configuration (Agent Debug or Agent Inspector)
3. Press F5 to start debugging

## Architecture

- **agent.py**: Main agent implementation
- **tools/**: Custom tools for the agent
- **tests/**: Unit tests

## Troubleshooting

### Authentication Error
Ensure you've run `azd auth login` and have valid Azure credentials.

### Model Not Found
Verify your `FOUNDRY_DEPLOYMENT_NAME` matches a deployed model in your Foundry project.

## Resources

- [Azure AI Agent Framework Documentation](https://learn.microsoft.com/en-us/azure/ai-services/agents/overview)
- [Microsoft Foundry Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/what-is-ai-studio)
