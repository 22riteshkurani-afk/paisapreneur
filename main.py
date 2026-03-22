from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import os
import json

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NEW GEMINI CLIENT
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}


@app.get("/generate")
def generate_idea(industry: str):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"""
            Return ONLY valid JSON.

            Generate a startup idea in {industry} in India.

            Format:
            {{
              "idea_name": "",
              "description": "",
              "target_market": "",
              "startup_cost": "",
              "revenue_model": "",
              "steps": ["", "", ""]
            }}
            """
        )

        raw = response.text
        cleaned = raw.replace("```json", "").replace("```", "")

        return json.loads(cleaned)

    except Exception as e:
        return {"error": str(e)}
