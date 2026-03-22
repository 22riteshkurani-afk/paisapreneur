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

# API KEY
genai.configure(api_key=os.getenv("paisapreneur-key"))

# -----------------------------
# EXISTING ROUTES
# -----------------------------

@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}


@app.get("/generate")
def generate_idea(industry: str):
    try:
        model = genai.GenerativeModel("YOUR_MODEL_NAME")
        response = model.generate_content(f"Startup idea for {industry}")
        return {"idea": response.text}
    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# 👉 PASTE HERE (NEW ENDPOINT)
# -----------------------------

@app.get("/models")
def list_models():
    try:
        models = genai.list_models()
        return {
            "models": [m.name for m in models]
        }
    except Exception as e:
        return {"error": str(e)}
