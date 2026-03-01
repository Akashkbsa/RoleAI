# ============================================================
# groq_service.py — Groq API integration service
# Handles communication with the Groq LLM API.
# Provides functions for single-role and multi-role generation.
# ============================================================

import os
from dotenv import load_dotenv
from groq import Groq

# Import the role-specific system prompts
from prompts.role_prompts import ROLE_PROMPTS

# Load environment variables from .env file
load_dotenv()

# Initialize the Groq client with the API key
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# The LLM model to use (available on Groq free tier)
MODEL_NAME = "llama-3.1-8b-instant"


def generate_response(question: str, role: str, temperature: float) -> dict:
    """
    Generate a single AI response for a specific role.

    Args:
        question: The user's question or topic.
        role: One of 'ceo', 'engineer', or 'student'.
        temperature: Controls creativity (0.0–1.5).

    Returns:
        A dict with keys: response, tokens_used, model.
    """
    # Look up the system prompt for the requested role
    system_prompt = ROLE_PROMPTS.get(role)
    if not system_prompt:
        raise ValueError(f"Invalid role: {role}. Must be one of: ceo, engineer, student")

    # Call the Groq API
    chat_completion = groq_client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        temperature=temperature,
        max_tokens=1024,
    )

    # Extract the response and usage info
    response_text = chat_completion.choices[0].message.content
    tokens_used = chat_completion.usage.total_tokens

    return {
        "response": response_text,
        "tokens_used": tokens_used,
        "model": MODEL_NAME,
    }


def generate_all_roles(question: str, temperature: float) -> dict:
    """
    Generate responses for ALL three roles (CEO, Engineer, Student).
    Used by the Compare All feature.

    Args:
        question: The user's question or topic.
        temperature: Controls creativity (0.0–1.5).

    Returns:
        A dict with keys: ceo, engineer, student (each is the response text).
    """
    results = {}
    for role in ["ceo", "engineer", "student"]:
        result = generate_response(question, role, temperature)
        results[role] = result["response"]

    return results
