# 🤖 MASTER PROMPT — AI Role-Based Response Generator
> Give this entire prompt to your AI coding assistant to build the full project

---

You are an expert full-stack developer. I need you to build a complete web application called **"AI Role-Based Response Generator"** from scratch. I will describe every detail below. Do NOT skip any part. Build everything exactly as described.

---

## 📁 Project Structure to Create

```
project/
├── backend/
│   ├── main.py
│   ├── routes/
│   │   └── generate.py
│   ├── services/
│   │   └── groq_service.py
│   ├── models/
│   │   └── schemas.py
│   ├── prompts/
│   │   └── role_prompts.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🔧 BACKEND — Build these files exactly:

### 1. `backend/requirements.txt`
```
fastapi==0.111.0
uvicorn==0.29.0
groq==0.9.0
python-dotenv==1.0.1
pydantic==2.7.1
```

---

### 2. `backend/models/schemas.py`
Define the following Pydantic models:

- `GenerateRequest`: fields → `question` (str), `role` (str, one of: "ceo", "engineer", "student"), `temperature` (float, default 0.7)
- `GenerateResponse`: fields → `role` (str), `response` (str), `tokens_used` (int), `model` (str)
- `CompareRequest`: fields → `question` (str), `temperature` (float, default 0.7)
- `CompareResponse`: fields → `ceo` (str), `engineer` (str), `student` (str)

---

### 3. `backend/prompts/role_prompts.py`
Define a Python dictionary called `ROLE_PROMPTS` with keys "ceo", "engineer", "student".

Each value is a detailed system prompt string:

**CEO prompt must say:**
- You are responding to a senior business executive (CEO/C-Suite level)
- Use strategic, high-level business language
- Focus on ROI, business impact, competitive advantage, risk, and opportunity
- Keep it concise — executives are busy. Use bullet points for key takeaways
- Avoid deep technical jargon. If technical terms appear, briefly explain them in business terms
- End every response with a "Bottom Line" section: one sentence on what the CEO should care about

**Engineer prompt must say:**
- You are responding to a software engineer or technical professional
- Be technically precise and detailed
- Use correct technical terminology freely — do not oversimplify
- Structure your response with clear sections: "How It Works", "Key Components", "Technical Considerations"
- Include code snippets, system design thinking, or implementation details where relevant
- Assume the reader has a strong technical background

**Student prompt must say:**
- You are responding to a university student or beginner learner
- Use simple, friendly, and encouraging language
- Avoid jargon — if you must use a technical term, immediately explain it in plain English
- Always include a real-world analogy to make the concept click
- Structure your response step-by-step
- End with a "Fun Fact" or "Try This" section to keep the student curious and engaged

---

### 4. `backend/services/groq_service.py`
- Import `Groq` from the `groq` library
- Load the API key from environment variable `GROQ_API_KEY` using `python-dotenv`
- Create a function `generate_response(question: str, role: str, temperature: float) -> dict`
  - Look up the system prompt from `ROLE_PROMPTS` using the role key
  - Call `groq_client.chat.completions.create()` with:
    - model: `"llama3-8b-8192"`
    - messages: `[{"role": "system", "content": system_prompt}, {"role": "user", "content": question}]`
    - temperature: the passed temperature value
    - max_tokens: 1024
  - Return a dict with keys: `response` (the text), `tokens_used` (from usage), `model` (model name)
- Create a function `generate_all_roles(question: str, temperature: float) -> dict`
  - Call `generate_response` for all three roles: ceo, engineer, student
  - Return a dict with keys: `ceo`, `engineer`, `student` (each value is the response text)

---

### 5. `backend/routes/generate.py`
- Create an `APIRouter` with prefix `/api`
- Define `POST /api/generate` endpoint:
  - Accept `GenerateRequest` body
  - Call `generate_response()` from groq_service
  - Return `GenerateResponse`
- Define `POST /api/compare` endpoint:
  - Accept `CompareRequest` body
  - Call `generate_all_roles()` from groq_service
  - Return `CompareResponse`
- Define `GET /api/health` endpoint:
  - Return `{"status": "ok", "message": "Server is running"}`

---

### 6. `backend/main.py`
- Create FastAPI app instance with title "AI Role-Based Response Generator"
- Add CORS middleware that allows ALL origins (needed for frontend to communicate)
- Load environment variables using `load_dotenv()`
- Include the router from `routes/generate.py`
- Add a root GET `/` endpoint that returns `{"message": "Welcome to AI Role-Based Response Generator API"}`

---

## 🖥️ FRONTEND — Build these files exactly:

### 7. `frontend/index.html`
Build a full single-page HTML app. Include these sections:
- **Header**: App name "RoleAI" with a subtitle "Same question. Different perspective."
- **Question Input**: A large textarea with placeholder "Ask anything... e.g. What is blockchain?"
- **Role Selector**: Three clickable cards side by side — CEO (briefcase icon), Engineer (gear icon), Student (book icon). Each card shows the role name and a one-line description. Clicking highlights the selected role.
- **Temperature Slider**: A range input from 0 to 1.5 (step 0.1). Show the current value. Show a label that says "Safe" when below 0.4, "Balanced" between 0.4–0.9, and "Creative" above 0.9.
- **Two Buttons**: "Generate Response" (primary) and "Compare All Roles" (secondary)
- **Response Area**: A card that shows the role icon, role name, the response text, and a "Copy" button
- **Comparison Area**: A hidden section that shows 3 columns side by side (CEO / Engineer / Student), revealed when Compare All is clicked
- **Loading spinner**: Shown while waiting for API response
- Link to `style.css` and `app.js`

### 8. `frontend/style.css`
- Dark theme with background color `#0d0d0d`
- Accent color: electric blue `#00c2ff`
- Font: Import "Space Grotesk" from Google Fonts for headings, "Inter" for body
- Role cards: dark rounded cards with hover effect and a glowing border when selected
- Buttons: rounded, bold, with hover lift animation
- Temperature slider: custom styled with the accent color
- Response card: subtle glassmorphism effect (semi-transparent with backdrop blur)
- Comparison columns: equal width, bordered, scrollable if content overflows
- Responsive: stack to single column on mobile

### 9. `frontend/app.js`
- Define `API_BASE = "http://localhost:8000"`
- Track selected role (default: "ceo") and temperature (default: 0.7)
- On role card click → update selected role, highlight the clicked card, deselect others
- On temperature slider change → update the temperature variable and label text
- On "Generate Response" click:
  - Validate that a question has been entered (show alert if empty)
  - Show loading spinner, hide previous response
  - Send POST request to `API_BASE/api/generate` with `{question, role, temperature}`
  - On success: hide spinner, show response card with role name and response text
  - On error: hide spinner, show error message in red
- On "Compare All Roles" click:
  - Validate question is entered
  - Show loading spinner
  - Send POST request to `API_BASE/api/compare` with `{question, temperature}`
  - On success: hide spinner, show 3-column comparison area with all 3 responses
  - On error: show error message
- Copy button: copies response text to clipboard, changes button text to "Copied!" for 2 seconds

---

## 🔐 Environment Setup Instructions

Tell me to create a file called `.env` inside the `backend/` folder with this content:
```
GROQ_API_KEY=paste_your_groq_key_here
```

And tell me to get the Groq API key from: https://console.groq.com/keys (free signup, no credit card)

---

## ▶️ Run Instructions

After building everything, tell me to:

1. Open terminal, go to `backend/` folder
2. Run: `pip install -r requirements.txt`
3. Run: `uvicorn main:app --reload --port 8000`
4. Open a new terminal, go to `frontend/` folder
5. Run: `python -m http.server 3000`
6. Open browser at: `http://localhost:3000`

---

## ⚠️ Important Rules

- Do NOT skip any file
- Do NOT merge files together — keep the folder structure exactly as specified
- Add comments in EVERY file explaining what each section does
- Make sure CORS is enabled so the frontend can talk to the backend
- Handle errors gracefully — never let the app crash silently

---

Build everything now, one file at a time, in the order listed above.
