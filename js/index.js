import Quiz from "./quiz.js";
import Question from "./question.js";


const quizOptionsForm = document.getElementById("quizOptions");
const playerNameInput = document.getElementById("playerName");
const categoryInput = document.getElementById("categoryMenu");
const difficultyOptions = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.querySelector(".questions-container");


let currentQuiz = null;

function showLoading() {
  questionsContainer.innerHTML = `
        <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>
    `;
}


function hideLoading() {
  const loading = document.querySelector(".loading-overlay");
  if (loading) {
    loading.remove();
  }
}

function showError(message) {
  questionsContainer.innerHTML = `
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">${message || "Failed to load questions. Please try again."}</p>
      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>
  `;

  const retryBtn = document.querySelector(".retry-btn");
  retryBtn.addEventListener("click", resetToStart);
}


function validateForm() {
  const num = Number(questionsNumber.value);

  if (!num) {
    return { isValid: false, error: "Please enter number of questions" };
  }

  if (num < 1) {
    return { isValid: false, error: "Minimum questions is 1" };
  }

  if (num > 50) {
    return { isValid: false, error: "Maximum questions is 50" };
  }

  return { isValid: true, error: null };
}

function showFormError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

  quizOptionsForm.insertBefore(errorDiv, startQuizBtn);

  setTimeout(() => {
    errorDiv.style.opacity = "0";
    setTimeout(() => errorDiv.remove(), 500);
  }, 3000);
}

function resetToStart() {
  questionsContainer.innerHTML = "";
  quizOptionsForm.reset();
  quizOptionsForm.classList.remove("hidden");
  currentQuiz = null;
}

async function startQuiz() {
  const validation = validateForm();

  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  const playerName = playerNameInput.value.trim() || "Player";
  const category = categoryInput.value;
  const difficulty = difficultyOptions.value;
  const numberOfQuestions = questionsNumber.value;

  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);
  quizOptionsForm.classList.add("hidden");

  showLoading();

  try {
    await currentQuiz.getQuestions();

    hideLoading();

    if (!currentQuiz.questions.length) {
      showError("No questions found");
      return;
    }

    const question = new Question(
      currentQuiz,
      questionsContainer,
      resetToStart,
    );

    question.displayQuestion();
  } catch (error) {
    hideLoading();
    showError("Failed to load questions. Please try again.");
  }
}


startQuizBtn.addEventListener("click", startQuiz);

questionsNumber.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    startQuiz();
  }
});
