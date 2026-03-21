from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from google import genai

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ API KEY
client = genai.Client(api_key=os.getenv("API_KEY"))

@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}

@app.get("/generate")
def generate_idea(industry: str):
    try:
        prompt = f"""
        User interest: {industry}

        Generate a profitable startup idea in India.

        Include:
        - Idea
        - Target users
        - Revenue model
        - MVP
        - 30-day plan
        """

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        return {"idea": response.text if hasattr(response, "text") else str(response)}

    except Exception as e:
        return {"error": str(e)}
