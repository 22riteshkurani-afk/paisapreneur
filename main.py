from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 API KEY
genai.configure(api_key="AIzaSyDD8c0pbzOKXQ0eJaPQOLC3KP83R_zY2HA")

model = genai.GenerativeModel("gemini-1.5-flash")

@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}

@app.get("/generate")
def generate_idea(industry: str):

    prompt = f"""
    User interest: {industry}

    Generate a profitable startup idea in India.

    Include:
    Idea
    Target users
    Revenue model
    MVP
    30-day plan
    """

    response = model.generate_content(prompt)

    return {"idea": response.text}