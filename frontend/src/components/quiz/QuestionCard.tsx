import "../../styles/QuestionCard.css";
import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { renderKaTeX } from "../../utils/latexRenderer";

interface Props {
  question: any;
  selectedAnswer: number | null;
  status?: "correct" | "wrong" | "unanswered" | undefined;
  isLocked: boolean;
  showSolution: boolean;
  isAiGenerated?: boolean;
  onAnswerSelect: (index: number) => void;
  onSubmit: () => void;
  onToggleSolution: () => void;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  status,
  isLocked,
  showSolution,
  isAiGenerated,
  onAnswerSelect,
  onSubmit,
  onToggleSolution,
}: Props) => {
  if (!question) return null;

  const displayTitle = question.text || question.questionText || "";

  return (
    <div className="question-section">
      <div className="question-header">
        <div className="question-left">
          <span className="question-number">Q. {question.number}</span>
          <div className="question-text-wrapper">
            <div className="question-main-text">
              {renderKaTeX(displayTitle, false)}
            </div>
          </div>
        </div>
        <div className="year">
          <span className="question-year">
            {question.isAiGenerated ? (
              <div className="ai-badge pulse"><span>Personalized for you</span></div>
            ) : (
              <span>[Year {question.year}]</span>
            )}
          </span>
        </div>
      </div>

      {question.imageUrl && (
        <div className="question-image-container">
          <img src={question.imageUrl} alt="Question" className="question-image" />
        </div>
      )}

      <div className="options-container">
        <p className="options-label">Options:</p>
        {question.options?.map((option: string, index: number) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === question.correctOption;
          let statusClass = isLocked
            ? isCorrectOption
              ? "correct-reveal"
              : isSelected && status === "wrong"
              ? "wrong-highlight"
              : isSelected && status === "correct"
              ? "correct-highlight"
              : ""
            : "";

          return (
            <label key={index} className={`option-item ${isSelected ? "selected" : ""} ${statusClass}`}>
              <input
                type="radio"
                name={`q-${question.number}`}
                checked={isSelected}
                onChange={() => onAnswerSelect(index)}
                disabled={isLocked}
              />
              <span className="option-text">{renderKaTeX(option, false)}</span>
            </label>
          );
        })}
      </div>

      {showSolution && (
        <div className="solution-container">
          <p className="solution-label">Solution:</p>
          <div className="solution-text">
            {renderKaTeX(question.solution, true)}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          className="submit-btn"
          onClick={onSubmit}
          disabled={isLocked || selectedAnswer === null}
        >
          {isLocked ? "Submitted" : "Submit Answer"}
        </button>
        <button className="solution-btn" onClick={onToggleSolution}>
          {showSolution ? "Hide Solution" : "View Solution"}
        </button>
      </div>
    </div>
  );
};