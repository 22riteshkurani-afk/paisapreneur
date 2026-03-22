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

# ✅ FIXED API KEY SETUP
genai.configure(api_key=os.getenv("paisapreneur-key"))

# ✅ MODEL
model = genai.GenerativeModel("gemini-1.5-flash")

@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}

@app.get("/generate")
def generate_idea(industry: str):
    try:
        response = model.generate_content(
            f"Give a profitable startup idea in {industry} in India with business model, cost, and steps"
        )

        # SAFE extraction
        if response and hasattr(response, "text"):
            return {"idea": response.text}
        else:
            return {"error": "No response from AI"}

    except Exception as e:
        return {"error": str(e)}
