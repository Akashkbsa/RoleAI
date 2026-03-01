# ============================================================
# generate.py — API route definitions
# Defines all endpoints: /api/generate, /api/compare, /api/health
# ============================================================

from fastapi import APIRouter, HTTPException

# Import Pydantic models for request/response validation
from models.schemas import (
    GenerateRequest,
    GenerateResponse,
    CompareRequest,
    CompareResponse,
)

# Import the Groq service functions
from services.groq_service import generate_response, generate_all_roles

# Create the API router with /api prefix
router = APIRouter(prefix="/api")


# --- POST /api/generate ---
# Generates a single AI response for a specific role
@router.post("/generate", response_model=GenerateResponse)
async def generate_endpoint(request: GenerateRequest):
    """Generate an AI response tailored to a specific role (CEO, Engineer, or Student)."""
    try:
        result = generate_response(
            question=request.question,
            role=request.role,
            temperature=request.temperature,
        )
        return GenerateResponse(
            role=request.role,
            response=result["response"],
            tokens_used=result["tokens_used"],
            model=result["model"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- POST /api/compare ---
# Generates responses for ALL three roles for side-by-side comparison
@router.post("/compare", response_model=CompareResponse)
async def compare_endpoint(request: CompareRequest):
    """Generate responses for all three roles and return them for comparison."""
    try:
        results = generate_all_roles(
            question=request.question,
            temperature=request.temperature,
        )
        return CompareResponse(
            ceo=results["ceo"],
            engineer=results["engineer"],
            student=results["student"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- GET /api/health ---
# Simple health check to verify the server is running
@router.get("/health")
async def health_check():
    """Health check endpoint — returns server status."""
    return {"status": "ok", "message": "Server is running"}
