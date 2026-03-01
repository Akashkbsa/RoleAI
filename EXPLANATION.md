# 📖 DETAILED PROJECT EXPLANATION
## AI Role-Based Response Generator — Explained for IT Managers & HR

> This document explains every component of the project in plain English. No assumption of deep technical knowledge is made. Think of this as a "guided tour" of how everything works.

---

## 🧩 PART 1: The Big Picture — What Are We Building?

Imagine you ask a simple question: **"What is Artificial Intelligence?"**

Now imagine three people answer that same question:
- A **CEO** answers it focusing on business value, money, and strategy
- An **Engineer** answers it with technical diagrams, code, and system design
- A **Student** answers it with simple words, analogies like "it's like teaching a baby"

That's exactly what this app does — automatically. You type ONE question, select WHO should receive the answer, and the AI tailors its response for that specific audience. This is called **Role-Based Prompt Engineering**.

---

## 🗂️ PART 2: Project Structure — What Each Folder/File Does

Think of the project like a restaurant:
- The **frontend** is the dining room — what the customer (user) sees and interacts with
- The **backend** is the kitchen — where the actual cooking (AI generation) happens
- The **Groq API** is the supplier — it provides the AI "brain" that generates the responses

```
project/
├── backend/         ← The Kitchen
└── frontend/        ← The Dining Room
```

---

## 🍽️ PART 3: The Backend — How the Kitchen Works

The backend is built with **FastAPI**, a modern Python framework for building web APIs. Think of an API as a "waiter" — it takes requests from the frontend (dining room), goes to the kitchen, does something, and brings back a response.

---

### 📄 File: `backend/requirements.txt`

**What it is:** A shopping list of tools the backend needs to run.

**Why it matters:** Just like a kitchen needs specific equipment (an oven, a fridge, etc.), our Python backend needs specific software libraries. This file lists them all so they can be installed in one command.

**What's in it:**
- `fastapi` — The framework that creates our API server (like the restaurant's operating system)
- `uvicorn` — The server that "runs" FastAPI (like the manager who opens the restaurant every morning)
- `groq` — The official Groq library that lets us talk to the AI (like a phone to call the supplier)
- `python-dotenv` — A tool that reads secret keys from a file (like a safe for passwords)
- `pydantic` — A tool that validates incoming data (like a bouncer checking orders before they reach the kitchen)

---

### 📄 File: `backend/models/schemas.py`

**What it is:** The rulebook that defines exactly what kind of data can come in and go out of the API.

**Why it matters:** Imagine a waiter who accepts orders in ANY format — someone might order "give me some food" with no details. That would cause chaos. Schemas prevent that by defining exactly what fields are required and what type they must be.

**What's in it:**

- `GenerateRequest` — Defines what the frontend must send when asking for ONE role's response:
  - `question`: The user's question (must be text)
  - `role`: Which role — must be "ceo", "engineer", or "student"
  - `temperature`: A number between 0 and 1.5 controlling how creative the AI is (default: 0.7)

- `GenerateResponse` — Defines what the backend sends back:
  - `role`: Which role responded
  - `response`: The actual AI-generated text
  - `tokens_used`: How many words/tokens the AI used (for monitoring usage)
  - `model`: Which AI model was used

- `CompareRequest` — What to send when asking all 3 roles at once (just the question + temperature)

- `CompareResponse` — What comes back: three separate responses labeled `ceo`, `engineer`, `student`

---

### 📄 File: `backend/prompts/role_prompts.py`

**What it is:** The "personality scripts" for each AI role. This is the HEART of the entire project.

**Why it matters:** The AI (Groq/LLaMA) is incredibly versatile — it can sound like anyone if you tell it how. These prompts are the instructions we give the AI BEFORE it sees the user's question. It's like briefing an actor before they go on stage: "You are playing a CEO. Here's how a CEO speaks..."

**What's in it (in plain English):**

**CEO Prompt tells the AI:**
> "Pretend you are answering a busy C-Suite executive. They don't have time for technical details. Focus on money, strategy, and risk. Use bullet points. Never go deep into how things work — only WHY it matters to the business. Always end with a 'Bottom Line' that wraps up in one sentence."

**Engineer Prompt tells the AI:**
> "Pretend you are answering a senior software engineer. They love details. Use technical terms freely. Structure your answer with headers like 'How It Works', 'Key Components', and 'Technical Considerations'. If relevant, include code snippets. Assume they have a computer science background."

**Student Prompt tells the AI:**
> "Pretend you are answering a first-year university student. Keep it simple and fun. Never use jargon without explaining it. Always use a real-world analogy — like comparing a computer's CPU to a human brain. Walk through things step by step. End with something fun or a challenge to try."

---

### 📄 File: `backend/services/groq_service.py`

**What it is:** The actual code that TALKS to the Groq AI API and gets responses.

**Why it matters:** This is where the real work happens. Like a chef who takes the order and actually cooks the meal, this file takes the question, the role, and the temperature — and communicates with Groq to get an AI response.

**How it works step by step:**

1. **Load the API Key** — It reads the secret Groq API key from the `.env` file. This key is like a password that proves to Groq "yes, we are authorized to use their AI service."

2. **`generate_response()` function:**
   - Takes the question, role, and temperature as inputs
   - Looks up the correct system prompt from `role_prompts.py` based on the role
   - Sends two messages to Groq:
     - A **system message** (the role prompt — "You are responding to a CEO...")
     - A **user message** (the actual question — "What is blockchain?")
   - Sets the **temperature** — a number that controls randomness:
     - 0.0 = very predictable, safe, repetitive
     - 0.7 = balanced — good mix of creativity and accuracy
     - 1.5 = very creative, sometimes unpredictable
   - Gets back the AI's response and returns it

3. **`generate_all_roles()` function:**
   - Simply calls `generate_response()` three times — once for CEO, once for Engineer, once for Student
   - Bundles all three responses together and returns them
   - This powers the "Compare All" feature

---

### 📄 File: `backend/routes/generate.py`

**What it is:** The "menu" of API endpoints — defining WHAT URLs exist and what they do.

**Why it matters:** When the frontend wants to communicate with the backend, it needs to know WHERE to send the request. Routes define those addresses, like different departments in a company having different phone extensions.

**What's in it:**

- **`GET /api/health`** — A simple "are you alive?" check. The frontend can call this to verify the server is running. Returns `{"status": "ok"}`. Used for debugging.

- **`POST /api/generate`** — The main endpoint for generating a single-role response.
  - Receives: question + role + temperature
  - Does: Calls `generate_response()` from groq_service
  - Returns: The AI's response for that specific role

- **`POST /api/compare`** — The endpoint for side-by-side comparison.
  - Receives: question + temperature
  - Does: Calls `generate_all_roles()` from groq_service
  - Returns: Three responses (ceo, engineer, student) all at once

---

### 📄 File: `backend/main.py`

**What it is:** The main entry point of the backend — the "front door" of the kitchen.

**Why it matters:** This is the first file that runs when we start the server. It sets everything up, registers all the routes, and starts listening for requests.

**What it does:**
1. Creates the FastAPI application instance
2. Enables **CORS** (Cross-Origin Resource Sharing) — This is a security policy that by default prevents a web page from talking to a server on a different address. Since our frontend runs on `localhost:3000` and backend on `localhost:8000`, we must explicitly allow this. Without CORS, the browser would block all API calls.
3. Loads environment variables (reads the `.env` file with the API key)
4. Registers the routes from `generate.py` so FastAPI knows what endpoints exist

---

## 🖥️ PART 4: The Frontend — What the User Sees

The frontend is three files: HTML (structure), CSS (design), and JavaScript (behavior). Together they create the user interface.

---

### 📄 File: `frontend/index.html`

**What it is:** The skeleton of the web page — defines what elements exist and where.

**Think of it like:** The blueprint of a building. It says "there's a door here, a window there, a room in the back." It doesn't specify the colors or what happens when you open the door — just that these elements exist.

**Key sections:**
- **Header** — App title and subtitle
- **Textarea** — Where the user types their question
- **Role Cards** — Three clickable boxes (CEO / Engineer / Student) for choosing the audience
- **Temperature Slider** — A draggable bar to control AI creativity
- **Buttons** — "Generate Response" and "Compare All Roles"
- **Response Card** — Where the AI answer appears
- **Comparison Area** — The 3-column side-by-side view (hidden by default, shown after Compare)

---

### 📄 File: `frontend/style.css`

**What it is:** The design and visual styling of every element on the page.

**Think of it like:** The interior design of the building. The blueprint said "there's a wall here" — CSS says "that wall is dark grey, has rounded corners, and glows blue when you hover over it."

**Key design choices:**
- **Dark theme** — Professional, modern, easy on the eyes
- **Electric blue accent** — Highlights selected elements and interactive components
- **Role cards** — When you click a role card, it gets a glowing blue border so you know it's selected
- **Glassmorphism on response card** — A frosted-glass look (semi-transparent + blur) for the output area — gives a premium feel
- **Responsive layout** — On a phone, the 3-column comparison stacks into a single column so it's still readable

---

### 📄 File: `frontend/app.js`

**What it is:** All the logic and interactivity — what happens when you click buttons, type text, or drag the slider.

**Think of it like:** The electrical wiring and plumbing of the building. The blueprint and interior design are done — but JS is what makes the lights turn on when you flip a switch.

**Key behaviors explained:**

1. **Role Card Click:**
   - Removes the "selected" highlight from all three cards
   - Adds the "selected" highlight to the one you clicked
   - Updates a variable `selectedRole` so the app knows which role to send to the backend

2. **Temperature Slider:**
   - As you drag, it reads the current value (0.0 to 1.5)
   - Updates the displayed number in real time
   - Changes the label: below 0.4 = "Safe", 0.4–0.9 = "Balanced", above 0.9 = "Creative"
   - Updates a variable `selectedTemperature` for use in API calls

3. **Generate Button Click:**
   - First checks: Is the question box empty? If yes, show an alert and stop.
   - Shows a spinning loading indicator (so the user knows something is happening)
   - Sends a **POST request** to `http://localhost:8000/api/generate` with the question, role, and temperature as JSON
   - Waits for the response (this is an asynchronous operation — the page doesn't freeze while waiting)
   - When the response arrives: hides the spinner, shows the response card with the AI text
   - If something goes wrong (server error, network issue): hides spinner, shows a red error message

4. **Compare All Button Click:**
   - Same validation and loading logic
   - Sends to `/api/compare` instead
   - When response arrives: populates all 3 columns (CEO, Engineer, Student) with their respective texts
   - Makes the comparison section visible

5. **Copy Button:**
   - Uses the browser's built-in clipboard API to copy the response text
   - Changes the button label from "Copy" to "Copied! ✓" for 2 seconds, then changes back
   - Gives the user clear feedback that it worked

---

## 🌡️ PART 5: Temperature — What It Really Means

Temperature is a concept from AI that controls how "random" or "creative" the model's outputs are.

**Technical explanation (simplified):**
When an AI generates text, it's essentially predicting the next word at each step. Temperature controls how strictly it follows the most likely prediction vs. sometimes picking a less likely but more interesting word.

- **Temperature = 0.0:** Always picks the most probable next word. Very consistent and safe but can feel robotic or repetitive.
- **Temperature = 0.7:** Occasionally picks slightly less probable words, making responses feel more natural and varied.
- **Temperature = 1.5:** Often picks surprising, creative word choices. Responses feel imaginative but can sometimes go off-track.

**In practice for this project:**
- A CEO answer probably wants low temperature (consistent, factual, reliable)
- A Student analogy might benefit from higher temperature (creative, engaging, surprising)
- The user has control via the slider to experiment with this

---

## 🔐 PART 6: The API Key & Security

**What is an API key?**
An API key is a unique secret string that identifies your account to an external service (in this case, Groq). Think of it like a library card — it proves you're allowed to use the service and tracks your usage.

**Why store it in `.env`?**
Hardcoding the API key directly in the Python files would be dangerous:
- If you upload your code to GitHub, anyone in the world could see your key and use your Groq account
- `.env` files are typically added to `.gitignore` — meaning they never get uploaded

**How it works:**
The `python-dotenv` library reads the `.env` file at startup and loads its contents into the system's environment variables. The code then reads it using `os.getenv("GROQ_API_KEY")` — never touching the `.env` file directly.

---

## 🔄 PART 7: How a Full Request Flows Through the System

Here's the complete journey of one user interaction, step by step:

1. **User** opens the browser at `http://localhost:3000`
2. **User** types "What is cloud computing?" in the textarea
3. **User** clicks the "Engineer" role card
4. **User** sets temperature to 0.8
5. **User** clicks "Generate Response"
6. **JavaScript** (app.js) reads the question, role, and temperature, shows a spinner
7. **JavaScript** sends an HTTP POST request to `http://localhost:8000/api/generate` with the data as JSON
8. **FastAPI** (main.py) receives the request, routes it to the `/api/generate` endpoint in `generate.py`
9. **generate.py** validates the incoming data against the `GenerateRequest` schema
10. **generate.py** calls `generate_response("What is cloud computing?", "engineer", 0.8)` in `groq_service.py`
11. **groq_service.py** looks up the Engineer system prompt from `role_prompts.py`
12. **groq_service.py** sends both the system prompt and the user's question to the Groq API over the internet
13. **Groq's servers** run the LLaMA AI model and generate a technical, structured response
14. **Groq** sends back the response text + usage stats
15. **groq_service.py** returns the data to `generate.py`
16. **generate.py** formats it into a `GenerateResponse` object and sends it back to the frontend as JSON
17. **JavaScript** receives the JSON, hides the spinner, and displays the response text in the response card
18. **User** reads the AI's engineer-tailored answer

Total time for this entire journey: typically **1–3 seconds**

---

## 📊 PART 8: Evaluation Alignment

Here's how each hackathon requirement maps to the code:

| Requirement | Where It Lives | What It Does |
|-------------|----------------|--------------|
| R1: Role Prompt Templates | `prompts/role_prompts.py` | 3 distinct system prompts — CEO, Engineer, Student |
| R2: Tone Control | Inside each prompt in `role_prompts.py` | Each prompt explicitly instructs tone and vocabulary |
| R3: Structured Outputs | Inside each prompt + frontend display | CEO gets bullets, Engineer gets sections, Student gets steps |
| R4: Temperature Testing | Slider in `index.html` + `app.js` + passed to Groq in `groq_service.py` | Full pipeline from UI to AI model |
| R5: Audience Comparison | `/api/compare` endpoint + comparison section in HTML/JS | 3-column side-by-side view with all roles simultaneously |

---

## 🚀 PART 9: Getting the Groq API Key (Step-by-Step)

1. Open your browser and go to: **https://console.groq.com**
2. Click **"Sign Up"** — you can sign up with Google (free, no credit card needed)
3. Once logged in, click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Give it any name (e.g., "hackathon")
6. Copy the key — it starts with `gsk_...`
7. Open your project, go to `backend/` folder
8. Create a file named `.env` (just that — a dot followed by "env")
9. Paste this inside:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
10. Save the file. You're done.

---

## ✅ Summary

This project demonstrates a clean separation of concerns:
- **Frontend** handles user experience and display
- **Backend** handles business logic and API communication
- **Prompts** handle AI persona engineering
- **Groq** provides the AI computation

The most technically interesting part — and the core of UC #29 — is the **prompt engineering** in `role_prompts.py`. The quality of the three system prompts is what determines whether the responses are genuinely distinct and useful for each audience. That's where the most creative effort should go.
