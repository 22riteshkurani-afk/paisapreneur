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

<<<<<<< HEAD
# 🔑 API KEY
import os
genai.configure(api_key=os.getenv("API_KEY"))
=======
# ✅ FIXED API KEY
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
>>>>>>> 859916daf54ac06d85cb3a1789ca95ae4c0324e0


@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}


import json

@app.get("/generate")
def generate_idea(industry: str):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
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

        response = model.generate_content(
            prompt,
            request_options={"timeout": 30}
        )

        raw_text = response.text

        # 🔥 Clean & parse JSON safely
        cleaned = raw_text.strip().replace("```json", "").replace("```", "")

        data = json.loads(cleaned)

        return data

    except Exception as e:
        return {"error": str(e)}


@app.get("/models")
def list_models():
    try:
        models = genai.list_models()
        return {"models": [m.name for m in models]}
    except Exception as e:
        return {"error": str(e)}
