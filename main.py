from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai 
import os

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

model = genai.GenerativeModel("gemini-pro")

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

        response = model.generate_content(prompt)

        return {"idea": response.text}

    except Exception as e:
        return {"error": str(e)}
