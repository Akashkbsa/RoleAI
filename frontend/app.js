/* ============================================================
   app.js — Frontend Application Logic
   Handles role selection, temperature control, API calls,
   response rendering, and copy-to-clipboard functionality.
   ============================================================ */

// --- Configuration ---
const API_BASE = "http://localhost:8000";

// --- State ---
let selectedRole = "ceo";
let temperature = 0.7;

// --- DOM Elements ---
const questionInput = document.getElementById("question-input");
const charCount = document.getElementById("char-count");
const roleCards = document.querySelectorAll(".role-card");
const tempSlider = document.getElementById("temp-slider");
const tempValue = document.getElementById("temp-value");
const tempLabel = document.getElementById("temp-label");
const btnGenerate = document.getElementById("btn-generate");
const btnCompare = document.getElementById("btn-compare");
const loadingSection = document.getElementById("loading-section");
const responseSection = document.getElementById("response-section");
const compareSection = document.getElementById("compare-section");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

// Response area elements
const responseIcon = document.getElementById("response-icon");
const responseRoleName = document.getElementById("response-role-name");
const responseBody = document.getElementById("response-body");
const responseMeta = document.getElementById("response-meta");
const btnCopy = document.getElementById("btn-copy");

// Compare area elements
const compareCeoBody = document.getElementById("compare-ceo-body");
const compareEngineerBody = document.getElementById("compare-engineer-body");
const compareStudentBody = document.getElementById("compare-student-body");

// --- Role Metadata ---
const ROLE_META = {
  ceo: { icon: '<i class="fa-solid fa-briefcase"></i>', name: "CEO" },
  engineer: { icon: '<i class="fa-solid fa-gear"></i>', name: "Engineer" },
  student: { icon: '<i class="fa-solid fa-graduation-cap"></i>', name: "Student" },
};

// ============================================================
// Character Counter — updates as user types
// ============================================================
questionInput.addEventListener("input", () => {
  const len = questionInput.value.length;
  charCount.textContent = `${len} / 2000`;
});

// ============================================================
// Role Card Selection — click to select, highlight active card
// ============================================================
roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    // Deselect all cards
    roleCards.forEach((c) => c.classList.remove("selected"));
    // Select the clicked card
    card.classList.add("selected");
    // Update state
    selectedRole = card.dataset.role;
  });
});

// ============================================================
// Temperature Slider — update value display and creativity label
// ============================================================
tempSlider.addEventListener("input", () => {
  temperature = parseFloat(tempSlider.value);
  tempValue.textContent = temperature.toFixed(1);

  // Update the label based on temperature range
  tempLabel.classList.remove("safe", "balanced", "creative");

  if (temperature <= 0.4) {
    tempLabel.textContent = "Safe";
    tempLabel.classList.add("safe");
  } else if (temperature <= 0.9) {
    tempLabel.textContent = "Balanced";
    tempLabel.classList.add("balanced");
  } else {
    tempLabel.textContent = "Creative";
    tempLabel.classList.add("creative");
  }
});

// ============================================================
// Utility Functions — show/hide sections, format text
// ============================================================

/**
 * Show the loading spinner and hide response/compare/error sections.
 */
function showLoading() {
  loadingSection.classList.remove("hidden");
  responseSection.classList.add("hidden");
  compareSection.classList.add("hidden");
  errorSection.classList.add("hidden");
}

/**
 * Hide the loading spinner.
 */
function hideLoading() {
  loadingSection.classList.add("hidden");
}

/**
 * Display an error message to the user.
 */
function showError(message) {
  hideLoading();
  errorMessage.textContent = message;
  errorSection.classList.remove("hidden");
}

/**
 * Validate that the user has entered a question.
 * Returns true if valid, false otherwise.
 */
function validateQuestion() {
  const question = questionInput.value.trim();
  if (!question) {
    showError("Please enter a question before generating a response.");
    // Shake the textarea to draw attention
    questionInput.style.animation = "none";
    questionInput.offsetHeight; // trigger reflow
    questionInput.style.animation = "shake 0.4s ease";
    questionInput.focus();
    return false;
  }
  return true;
}

/**
 * Format AI response text — handles basic markdown-like formatting.
 * Converts **bold**, bullet points, and section headers.
 */
function formatResponse(text) {
  // Escape HTML first
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert **bold** to <strong> tags
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="color: #FB3640;">$1</strong>',
  );

  // Convert ### headers
  formatted = formatted.replace(
    /^### (.+)$/gm,
    '<strong style="color: #FB3640; font-size: 1.05em;">$1</strong>',
  );

  // Convert ## headers
  formatted = formatted.replace(
    /^## (.+)$/gm,
    '<strong style="color: #FB3640; font-size: 1.1em; display: block; margin-top: 0.8em;">$1</strong>',
  );

  // Convert bullet points (* or -) to styled bullets
  formatted = formatted.replace(
    /^[\*\-] (.+)$/gm,
    '<span style="display: block; padding-left: 1em; text-indent: -0.7em; margin: 0.2em 0;">● $1</span>',
  );

  // Convert numbered lists
  formatted = formatted.replace(
    /^(\d+)\. (.+)$/gm,
    '<span style="display: block; padding-left: 1em; margin: 0.2em 0;"><strong style="color: #FB3640;">$1.</strong> $2</span>',
  );

  // Convert `inline code`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code style="background: rgba(251,54,64,0.1); color: #ff5a63; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">$1</code>',
  );

  return formatted;
}

// ============================================================
// Generate Response — Single Role
// ============================================================
btnGenerate.addEventListener("click", async () => {
  if (!validateQuestion()) return;

  const question = questionInput.value.trim();
  showLoading();

  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        role: selectedRole,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Server error (${response.status})`);
    }

    const data = await response.json();

    // Populate response card
    const meta = ROLE_META[data.role] || ROLE_META[selectedRole];
    responseIcon.innerHTML = meta.icon;
    responseRoleName.textContent = meta.name;
    responseBody.innerHTML = formatResponse(data.response);
    responseMeta.innerHTML = `
            <span><i class="fa-solid fa-coins"></i> Tokens: <strong>${data.tokens_used}</strong></span>
            <span><i class="fa-solid fa-microchip"></i> Model: <strong>${data.model}</strong></span>
        `;

    // Show response, hide others
    hideLoading();
    compareSection.classList.add("hidden");
    responseSection.classList.remove("hidden");
  } catch (error) {
    showError(
      error.message ||
        "Failed to generate response. Please check if the backend is running.",
    );
  }
});

// ============================================================
// Compare All Roles — Side-by-Side
// ============================================================
btnCompare.addEventListener("click", async () => {
  if (!validateQuestion()) return;

  const question = questionInput.value.trim();
  showLoading();

  try {
    const response = await fetch(`${API_BASE}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Server error (${response.status})`);
    }

    const data = await response.json();

    // Populate comparison columns
    compareCeoBody.innerHTML = formatResponse(data.ceo);
    compareEngineerBody.innerHTML = formatResponse(data.engineer);
    compareStudentBody.innerHTML = formatResponse(data.student);

    // Show comparison, hide others
    hideLoading();
    responseSection.classList.add("hidden");
    compareSection.classList.remove("hidden");
  } catch (error) {
    showError(
      error.message ||
        "Failed to compare roles. Please check if the backend is running.",
    );
  }
});

// ============================================================
// Copy to Clipboard — Single Response
// ============================================================
btnCopy.addEventListener("click", () => {
  // Get the plain text content (strip HTML)
  const text = responseBody.innerText;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      btnCopy.classList.add("copied");
      setTimeout(() => {
        btnCopy.innerHTML = '<i class="fa-regular fa-clipboard"></i> Copy';
        btnCopy.classList.remove("copied");
      }, 2000);
    })
    .catch(() => {
      btnCopy.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';
      setTimeout(() => {
        btnCopy.innerHTML = '<i class="fa-regular fa-clipboard"></i> Copy';
      }, 2000);
    });
});

// ============================================================
// Copy to Clipboard — Comparison Columns
// ============================================================
document.querySelectorAll(".btn-copy-sm").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    const text = targetEl.innerText;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
          btn.classList.remove("copied");
        }, 2000);
      })
      .catch(() => {
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
        }, 2000);
      });
  });
});

// ============================================================
// Shake Animation (added dynamically for input validation)
// ============================================================
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); }
        80% { transform: translateX(6px); }
    }
`;
document.head.appendChild(shakeStyle);
