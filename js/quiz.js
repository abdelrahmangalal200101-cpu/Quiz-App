export default class Quiz {
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  async getQuestions() {
    const url = this.buildApiUrl();
    console.log("Fetching from:", url);
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to get questions");

    const data = await response.json();

    if (data.response_code !== 0) {
      throw new Error(
        "API returned no questions (response_code: " + data.response_code + ")",
      );
    }

    this.questions = data.results;
    return this.questions;
  }

  buildApiUrl() {
    const baseUrl = "https://opentdb.com/api.php";
    const params = new URLSearchParams({
      amount: this.numberOfQuestions,
      type: "multiple",
    });
    if (this.difficulty) params.append("difficulty", this.difficulty);
    if (this.category) params.append("category", this.category);
    return `${baseUrl}?${params.toString()}`;
  }

  incrementScore() {
    this.score++;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }

    return this.questions[this.currentQuestionIndex];
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      return true;
    }

    return false;
  }

  isComplete() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return true;
    }
  }

  getScorePercentage() {
    const percentage = (this.score / this.numberOfQuestions) * 100;
    return Math.round(percentage);
  }

  saveHighScore() {
    const highScores = this.getHighScores();

    const percentage = this.getScorePercentage();

    const newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: percentage,
      difficulty: this.difficulty,
      date: new Date().toISOString(),
    };

    highScores.push(newScore);

    highScores.sort((a, b) => b.percentage - a.percentage);

    const topScores = highScores.slice(0, 10);

    localStorage.setItem("quizHighScores", JSON.stringify(topScores));
  }

  getHighScores() {
    try {
      const data = localStorage.getItem("quizHighScores");

      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  isHighScore() {
    const highScores = this.getHighScores();

    const percentage = this.getScorePercentage();

    if (highScores.length < 10) {
      return true;
    }

    const lowestScore = highScores[highScores.length - 1];

    return percentage > lowestScore.percentage;
  }

  endQuiz() {
    const percentage = this.getScorePercentage();

    const isHigh = this.isHighScore();

    if (isHigh) {
      this.saveHighScore();
    }

    const highScores = this.getHighScores();

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>

        ${
          isHigh
            ? `
        <div class="new-record-badge">
          <i class="fa-solid fa-star"></i> New High Score!
        </div>
        `
            : ""
        }

        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>

          <ul class="leaderboard-list">

            ${highScores
              .map(
                (s, i) => `
              <li class="leaderboard-item">
                <span class="leaderboard-rank">#${i + 1}</span>
                <span class="leaderboard-name">${s.name}</span>
                <span class="leaderboard-score">${s.percentage}%</span>
              </li>
            `,
              )
              .join("")}

          </ul>
        </div>

        <div class="action-buttons">
          <button class="btn-restart">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}
