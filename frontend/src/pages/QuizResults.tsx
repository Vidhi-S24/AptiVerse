import { useLocation, useNavigate } from "react-router-dom";
import "../styles/QuizResults.css";
import { useEffect } from "react";
import { renderKaTeX } from "../utils/latexRenderer";

interface Question {
  number: number;
  year: number;
  text: string;
  conditions: string[];
  options: string[];
  solution: string;
}

interface LocationState {
  questions: Question[];
  answeredQuestions: { [key: number]: "correct" | "wrong" | "unanswered" };
  userAnswers: { [key: number]: number };
  correctAnswersArray: number[];
  viewedSolutions: { [key: number]: boolean };
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    document.title = "Review Quiz Answers | AptiVerse";
    return () => { document.title = "AptiVerse"; };
  }, []);

  if (!state) {
    return (
      <div className="result-page-container">
        <h2>No result data available</h2>
        <button className="back-btn-result" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const { questions, answeredQuestions, userAnswers, correctAnswersArray, viewedSolutions } = state;

  const getQuestionStatus = (qNum: number) => {
    if (answeredQuestions[qNum] === "correct") return "correct";
    if (answeredQuestions[qNum] === "wrong") return "wrong";
    if (viewedSolutions[qNum]) return "viewed";
    return "unanswered";
  };

  return (
    <div className="result-page-container">
      <h1>Review Quiz Answers</h1>
      <div className="questions-list">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(q.number);
          const correctAnswerIndex = correctAnswersArray[idx];
          const correctAnswerRaw = correctAnswerIndex !== undefined ? q.options[correctAnswerIndex] : "";
          const userAnswerIndex = userAnswers[q.number];
          const userAnswerRaw = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : null;

          return (
            <div key={q.number} className={`question-card ${status}`}>
              <div className="question-header">
                <span className="q-number">Q.{q.number}</span>
                <span className="q-text">
                  {renderKaTeX(q.text || "", false)}
                </span>
                <span className="q-year">[Year {q.year}]</span>
              </div>

              <div className="question-options">
                <div className="answer-row">
                  <strong>Your Answer: </strong>
                  {userAnswerRaw ? (
                    renderKaTeX(userAnswerRaw, false)
                  ) : (
                    <span>Not Answered</span>
                  )}
                </div>

                {(status === "wrong" || status === "viewed" || status === "unanswered") && (
                  <>
                    <div className="answer-row">
                      <strong>Correct Answer: </strong>
                      {renderKaTeX(correctAnswerRaw || "", false)}
                    </div>
                    <div className="solution-text">
                      <p className="solution-label" style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.2rem' }}>Solution:</p>
                      {renderKaTeX(q.solution || "No solution available.", true)}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button className="back-btn-result" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

export default ResultPage;