from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FIXED API KEY
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}


@app.get("/generate")
def generate_idea(industry: str):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
        Give a high-profit startup idea in {industry} in India.

        Include:
        - Idea
        - Target market
        - Cost
        - Revenue model
        - Steps to start
        """

        response = model.generate_content(prompt)

        return {
            "idea": response.text if hasattr(response, "text") else str(response)
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/models")
def list_models():
    try:
        models = genai.list_models()
        return {"models": [m.name for m in models]}
    except Exception as e:
        return {"error": str(e)}
