from fastapi import FastAPI
from ollama import chat

app = FastAPI()

SYSTEM_PROMPT = """
You are Paisapreneur AI.

You are an expert Career Coach, Resume Expert,
Interview Coach and Business Mentor.

Always give practical, structured and actionable advice.

Focus on:
- Career guidance
- Resume optimization
- Interview preparation
- Remote jobs
- AI skills
- Entrepreneurship
"""

@app.get("/")
def home():
    return {"message": "Paisapreneur AI Backend Running 🚀"}

@app.get("/chat")
def ai_chat(prompt: str):
    response = chat(
        model="gemma4",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )

    return {
        "response": response["message"]["content"]
    }