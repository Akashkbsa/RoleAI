# ============================================================
# schemas.py — Pydantic request/response models
# Defines the data contracts for the API endpoints
# ============================================================

from pydantic import BaseModel, Field
from typing import Literal


# --- Request Models ---

class GenerateRequest(BaseModel):
    """Request body for the /api/generate endpoint.
    Accepts a question, a target role, and an optional temperature."""
    question: str = Field(..., description="The user's question or topic")
    role: Literal["ceo", "engineer", "student"] = Field(
        ..., description="Target audience role"
    )
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=1.5,
        description="Controls response creativity (0.0 = safe, 1.5 = creative)"
    )


class CompareRequest(BaseModel):
    """Request body for the /api/compare endpoint.
    Accepts a question and temperature — generates for all three roles."""
    question: str = Field(..., description="The user's question or topic")
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=1.5,
        description="Controls response creativity (0.0 = safe, 1.5 = creative)"
    )


# --- Response Models ---

class GenerateResponse(BaseModel):
    """Response body for the /api/generate endpoint.
    Returns the role, generated response, token count, and model used."""
    role: str = Field(..., description="The role used for generation")
    response: str = Field(..., description="The AI-generated response text")
    tokens_used: int = Field(..., description="Number of tokens consumed")
    model: str = Field(..., description="The LLM model used")


class CompareResponse(BaseModel):
    """Response body for the /api/compare endpoint.
    Returns all three role responses for side-by-side comparison."""
    ceo: str = Field(..., description="Response tailored for a CEO")
    engineer: str = Field(..., description="Response tailored for an Engineer")
    student: str = Field(..., description="Response tailored for a Student")
