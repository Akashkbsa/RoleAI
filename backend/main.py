# ============================================================
# main.py — FastAPI application entry point
# Sets up CORS, loads environment variables, and includes routes.
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file BEFORE importing routes
# (so GROQ_API_KEY is available when groq_service initializes)
load_dotenv()

# Import the API router
from routes.generate import router as api_router

# Create the FastAPI application instance
app = FastAPI(
    title="AI Role-Based Response Generator",
    description="Generate AI responses tailored to different professional roles",
    version="1.0.0",
)

# --- CORS Middleware ---
# Allow ALL origins so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(api_router)


# --- Root Endpoint ---
@app.get("/")
async def root():
    """Root endpoint — welcome message."""
    return {"message": "Welcome to AI Role-Based Response Generator API"}
