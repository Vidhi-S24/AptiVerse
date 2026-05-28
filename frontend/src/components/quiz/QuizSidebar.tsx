import "../../styles/QuizSidebar.css";
import { AnimatedBee } from "../../ui/AnimatedBee";

interface Props {
  progressPercentage: number;
  questionsCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentQuestion: number;
  getQuestionStatus: (n: number) => string;
  onNavClick: (n: number) => void;
  onNext: () => void;
  onSubmitTest: () => void;
}

export const QuizSidebar = ({
  progressPercentage,
  questionsCompleted,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  currentQuestion,
  getQuestionStatus,
  onNavClick,
  onNext,
  onSubmitTest,
}: Props) => {

  const handleSubmitClick = () => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit the test?"
    );
    if (confirmSubmit) {
      onSubmitTest();
    }
  };

  return (
    <div className="progress-section">
      <div className="bee-wrapper wrapper-progress">
        <div
          style={{
            position: "absolute",
            bottom: "65px",
            right: "5px",
            scale: "0.7",
            zIndex: "2",
            transform: "rotate(30deg)",
          }}
          className="bee"
        >
          <AnimatedBee />
        </div>

        <div className="progress-header">Test Progress</div>

        <div className="progress-circle-container ">
          <svg className="progress-circle-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
              transform="rotate(-90 60 60)"
            />
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d8dce4"
              fontSize="24"
              fontWeight="700"
            >
              {progressPercentage}%
            </text>
          </svg>
        </div>
      </div>

      <div className="progress-stats">
        <p>Questions Completed: {questionsCompleted}/{totalQuestions}</p>
        <p>Correct Answers: {correctAnswers}</p>
        <p>Wrong Answers: {wrongAnswers}</p>
      </div>

      <div className="question-navigation">
        {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`question-nav-btn ${getQuestionStatus(num)} ${num === currentQuestion + 1 ? "current" : ""}`}
            onClick={() => onNavClick(num)}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        {currentQuestion !== totalQuestions - 1 && (
          <button className="next-question-btn" onClick={onNext}>
            Next Question
          </button>
        )}

        <button className="submit-test-btn" onClick={handleSubmitClick}>
          Submit Test
        </button>
      </div>

    </div>
  );
};