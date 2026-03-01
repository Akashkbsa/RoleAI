# 📋 AI Role-Based Response Generator — Master Requirements Document
> UC #29 | HackMaster 3.0 | Difficulty: Medium | Domain: Role Prompt Engineering

---

## 🧠 Project Overview

Build a web application that takes **any question or topic** from the user and generates **three different answers** — one tailored for a **CEO**, one for an **Engineer**, and one for a **Student**. The same question gets answered differently based on WHO is reading it — adjusting the vocabulary, depth, tone, and structure of the response accordingly.

---

## 🗂️ Project Structure

```
project/
│
├── backend/
│   ├── main.py               ← FastAPI server (entry point)
│   ├── routes/
│   │   └── generate.py       ← API route that handles response generation
│   ├── services/
│   │   └── groq_service.py   ← Groq API integration & prompt building
│   ├── models/
│   │   └── schemas.py        ← Pydantic request/response models
│   ├── prompts/
│   │   └── role_prompts.py   ← All role-specific system prompt templates
│   └── requirements.txt      ← Python dependencies
│
└── frontend/
    ├── index.html            ← Main HTML page
    ├── style.css             ← All styling
    └── app.js                ← All frontend JavaScript logic
```

---

## ⚙️ Tech Stack

| Layer     | Technology        | Why                                      |
|-----------|-------------------|------------------------------------------|
| Frontend  | HTML + CSS + JS   | Simple, fast, no framework needed        |
| Backend   | Python + FastAPI  | Lightweight, async, modern Python API    |
| AI Model  | Groq API          | Free tier, ultra-fast inference          |
| LLM Model | llama3-8b-8192    | Available on Groq free tier, very capable|

---

## 📌 Functional Requirements

### R1 — Role Prompt Templates
- There must be **3 distinct system prompt templates**: one each for CEO, Engineer, and Student
- Each template must instruct the AI to adjust vocabulary, tone, depth, and format
- Templates must be stored separately in `role_prompts.py` (not hardcoded inside logic)

### R2 — Tone Control
- **CEO tone**: Executive, high-level, business-impact focused, concise, uses strategic language
- **Engineer tone**: Technical, precise, detail-oriented, uses technical terminology, may include code or systems thinking
- **Student tone**: Simple, friendly, uses analogies and examples, avoids jargon, encourages curiosity

### R3 — Structured Outputs
- **CEO response**: Short paragraphs, bullet points for key takeaways, ends with business implication
- **Engineer response**: Structured with sections (How it works / Key components / Technical considerations)
- **Student response**: Conversational, step-by-step, uses a real-world analogy to explain the concept

### R4 — Temperature Testing
- The UI must include a **temperature slider** (range: 0.0 to 1.5)
- Temperature controls how creative vs. predictable the AI response is
  - Low (0.0–0.4): Consistent, factual, safe answers
  - Medium (0.5–0.9): Balanced creativity and accuracy
  - High (1.0–1.5): More creative, varied, sometimes unexpected
- The selected temperature value must be sent to the backend and passed to the Groq API call

### R5 — Audience Comparison
- There must be a **"Compare All"** button that triggers generation for all 3 roles simultaneously
- Responses must be shown **side-by-side** in a 3-column layout
- Each column must be clearly labeled with the role name and an icon

---

## 🔌 API Design

### POST `/api/generate`

**Request Body:**
```json
{
  "question": "What is machine learning?",
  "role": "engineer",
  "temperature": 0.7
}
```

**Response Body:**
```json
{
  "role": "engineer",
  "response": "Machine learning is a subset of artificial intelligence...",
  "tokens_used": 312,
  "model": "llama3-8b-8192"
}
```

### POST `/api/compare`

**Request Body:**
```json
{
  "question": "What is machine learning?",
  "temperature": 0.7
}
```

**Response Body:**
```json
{
  "ceo": "Machine learning is a technology that...",
  "engineer": "Machine learning involves training models by...",
  "student": "Imagine you're teaching a dog tricks..."
}
```

### GET `/api/health`
- Simple health check endpoint
- Returns `{ "status": "ok" }`

---

## 🖥️ Frontend UI Requirements

1. **Header** — App title + subtitle
2. **Input Area** — Large text area where user types their question
3. **Role Selector** — 3 clickable role cards (CEO / Engineer / Student) with icons and description
4. **Temperature Slider** — Visual slider with label showing current value and mode (Safe / Balanced / Creative)
5. **Generate Button** — Triggers single-role generation
6. **Compare All Button** — Triggers 3-role side-by-side comparison
7. **Response Display Area** — Shows the AI response with role label and a copy button
8. **Loading State** — Spinner or animated skeleton while waiting for response
9. **Error Handling** — Shows a friendly error message if API fails

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

---

## 📦 Python Dependencies (`requirements.txt`)

```
fastapi==0.111.0
uvicorn==0.29.0
groq==0.9.0
python-dotenv==1.0.1
pydantic==2.7.1
```

---

## 🚀 How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
# Simply open frontend/index.html in a browser
# OR serve with a simple HTTP server:
cd frontend
python -m http.server 3000
# Then open http://localhost:3000
```

---

## ✅ Evaluation Checklist

| Requirement | Feature | Status |
|-------------|---------|--------|
| R1 | Role prompt templates exist and are distinct | ☐ |
| R2 | Tone is clearly different for each role | ☐ |
| R3 | Output is structured differently per role | ☐ |
| R4 | Temperature slider works and affects output | ☐ |
| R5 | Compare All shows 3 responses side-by-side | ☐ |
| — | FastAPI server runs without errors | ☐ |
| — | Frontend connects to backend successfully | ☐ |
| — | Error states handled gracefully | ☐ |
| — | GitHub commits tracked throughout | ☐ |
