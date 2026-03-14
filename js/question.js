import {
  playCorrectSound,
  playWrongSound,
  playTimeUpSound,
  playGameEndSound,
} from "./sound.js";

export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = this.quiz.getCurrentQuestion();
    this.index = this.quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    this.wrongAnswers = this.questionData.incorrect_answers.map((ans) =>
      this.decodeHtml(ans),
    );

    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15;
  }

  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    return doc.documentElement.textContent;
  }

  shuffleAnswers() {
    const answers = [...this.wrongAnswers, this.correctAnswer];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    return answers;
  }

  getProgress() {
    const progress = ((this.index + 1) / this.quiz.numberOfQuestions) * 100;
    return Math.round(progress);
  }

  displayQuestion() {
    const answersHTML = this.allAnswers
      .map(
        (ans, i) => `
      <button class="answer-btn" data-answer="${ans}">
        <span class="answer-key">${i + 1}</span>
        <span class="answer-text">${ans}</span>
      </button>
    `,
      )
      .join("");

    const html = `
  <div class="game-card question-card">

    <div class="xp-bar-container">
      <div class="xp-bar-header">
        <span class="xp-label">Progress</span>
        <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
      </div>

      <div class="xp-bar">
        <div class="xp-bar-fill" style="width:${this.getProgress()}%"></div>
      </div>
    </div>

    <h2 class="question-text">${this.question}</h2>

    <div class="answers-grid">
      ${answersHTML}
    </div>

    <div class="stat-badge timer">
      <span class="timer-value">${this.timeRemaining}</span>s
    </div>

  </div>
  `;

    this.container.innerHTML = html;

    this.addEventListeners();

    this.startTimer();
  }

  addEventListeners() {
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.checkAnswer(btn));
    });

    this.keyHandler = (e) => {
      const keys = ["1", "2", "3", "4"];

      if (keys.includes(e.key)) {
        const index = Number(e.key) - 1;

        const buttons = document.querySelectorAll(".answer-btn");

        if (buttons[index]) {
          this.checkAnswer(buttons[index]);
        }
      }
    };

    document.addEventListener("keydown", this.keyHandler);
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.keyHandler);
  }

  startTimer() {
    const timerDisplay = document.querySelector(".timer-value");

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;

      timerDisplay.textContent = this.timeRemaining;

      if (this.timeRemaining <= 5) {
        timerDisplay.parentElement.classList.add("warning");
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();

        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  handleTimeUp() {
    this.answered = true;

    this.removeEventListeners();

    playTimeUpSound();

    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((btn) => {
      if (btn.dataset.answer === this.correctAnswer) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("disabled");
      }
    });

    const message = document.createElement("div");
    message.className = "time-up-message";
    message.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;

    const card = document.querySelector(".question-card");

    card.appendChild(message);

    this.animateQuestion(300);
  }

  checkAnswer(choiceElement) {
    if (this.answered) return;

    this.answered = true;

    this.stopTimer();

    const selected = choiceElement.dataset.answer;

    const buttons = document.querySelectorAll(".answer-btn");

    if (selected.toLowerCase() === this.correctAnswer.toLowerCase()) {
      choiceElement.classList.add("correct");

      playCorrectSound();

      this.quiz.incrementScore();
    } else {
      choiceElement.classList.add("wrong");

      playWrongSound();

      this.highlightCorrectAnswer();
    }

    buttons.forEach((btn) => {
      if (btn !== choiceElement) {
        btn.classList.add("disabled");
      }
    });

    this.animateQuestion(300);
  }

  highlightCorrectAnswer() {
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((btn) => {
      if (btn.dataset.answer === this.correctAnswer) {
        btn.classList.add("correct-reveal");
      }
    });
  }

  getNextQuestion() {
    const hasNext = this.quiz.nextQuestion();

    if (hasNext) {
      const next = new Question(this.quiz, this.container, this.onQuizEnd);

      next.displayQuestion();
    } else {
      playGameEndSound();

      this.container.innerHTML = this.quiz.endQuiz();
      const btn = document.querySelector(".btn-restart");

      btn.addEventListener("click", this.onQuizEnd);
    }
  }

  animateQuestion(duration = 300) {
    setTimeout(() => {
      const card = document.querySelector(".question-card");

      card.classList.add("exit");

      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}
