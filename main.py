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

# ✅ Configure API key
genai.configure(api_key=os.getenv("paisapreneur-key"))

# ✅ Use latest working model
MODEL_NAME = "gemini-1.5-flash-latest"


@app.get("/")
def home():
    return {"message": "Paisapreneur is running 🚀"}


@app.get("/generate")
def generate_idea(industry: str):
    try:
        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""
        Act like a startup expert.

        Give a high-profit startup idea in {industry} in India.

        Include:
        - Idea
        - Target market
        - Cost
        - Revenue model
        - Step-by-step execution
        """

        response = model.generate_content(prompt)

        return {
            "idea": response.text if hasattr(response, "text") else str(response)
        }

    except Exception as e:
        return {"error": str(e)}
