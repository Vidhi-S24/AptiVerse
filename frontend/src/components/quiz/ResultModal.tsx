import { useNavigate } from "react-router-dom";
import "../../styles/ResultModal.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Question } from "../../types/quiz.types";
import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Aurora from "../../ui/Aurora";

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

interface Props {
  correctAnswers: number;
  wrongAnswers: number;
  totalViewed: number;
  totalQuestions: number;
  questions: Question[];
  answeredQuestions: { [key: number]: "correct" | "wrong" | "unanswered" };
  correctAnswersArray: number[];
  viewedSolutions: { [key: number]: boolean };
  userAnswers: { [key: number]: number };
  viewingResults: boolean;
  onRetry: () => void;
  userId?: string;
  aiRecommendation?: {
    currentStrategy: "REMEDIAL" | "PRACTICE" | "CHALLENGE" | "MAINTENANCE";
    weakSubtopics: string[];
    nextAction: {
      topicId: string;
      subtopicId: string;
      difficulty: string;
    };
  } | null;
}

export const ResultModal = ({
  correctAnswers,
  wrongAnswers,
  totalViewed,
  totalQuestions,
  questions,
  answeredQuestions,
  correctAnswersArray,
  viewedSolutions,
  userAnswers,
  onRetry,
  aiRecommendation: initialRecommendation,
  userId,
}: Props) => {
  const navigate = useNavigate();

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  const [detailedReview, setDetailedReview] = useState<string | null>(null);
  const [animatedReview, setAnimatedReview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [localStrategy, setLocalStrategy] = useState(initialRecommendation);
  const [view, setView] = useState<"stats" | "review">("stats");
  const [cachedReview, setCachedReview] = useState<string | null>(() => {
    return localStorage.getItem("ai_review");
  });
  const hasReview = Boolean(cachedReview);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleDetailedAnalysis = () => {
    navigate("/results", {
      state: {
        questions,
        answeredQuestions,
        correctAnswersArray,
        userAnswers,
        viewedSolutions,
        correctAnswers,
        wrongAnswers,
        totalQuestions,
      },
    });
  };

  // ✨ word-by-word animation
  const animateText = (text: string) => {
    const words = text.split(" ");
    let current = "";
    setAnimatedReview("");

    words.forEach((word, i) => {
      setTimeout(() => {
        current += (i === 0 ? "" : " ") + word;
        setAnimatedReview(current);
      }, i * 35);
    });
  };

  // 🤖 AI review
  const handleRequestReview = async () => {
    if (!userId) return;

    setIsGenerating(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/users/review/${userId}`, {
        quizSessionData: {
          score: scorePercentage,
          correctAnswers,
          wrongAnswers,
          totalQuestions,
          totalViewed,
          topicsCovered: Array.from(new Set(questions.map((q) => q.topicId))),
        },
      });

      setDetailedReview(data.review);
      setCachedReview(data.review);
      localStorage.setItem("ai_review", data.review);

      animateText(data.review);
      setView("review");

      if (data.strategy) {
        setLocalStrategy({
          currentStrategy: data.strategy,
          weakSubtopics: data.weakSubtopics,
          nextAction: data.recommendations,
        });
      }
    } catch (err) {
      const fallback =
        "The AI Bee is busy right now 🐝. Please try again later.";

      setDetailedReview(fallback);
      setView("review");
      animateText(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const data = {
    labels: ["Correct", "Wrong", "Viewed"],
    datasets: [
      {
        data: [correctAnswers, wrongAnswers, totalViewed],
        backgroundColor: ["#12efa5", "#f81c1c", "#ba6fff"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  const handleStartPath = () => {
    if (localStrategy?.nextAction) {
      navigate("/quiz", {
        state: {
          mode: "personalized",
          topicId: localStrategy.nextAction.topicId,
          subtopicId: localStrategy.nextAction.subtopicId,
        },
      });
    } else {
      onRetry();
    }
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem("ai_review");
    };
  }, []);

  return (
    <div className="result-overlay aurora-wrapper">
      <div className="result-modal glass-modal">
        <div className="aurora-bg">
          <Aurora />
        </div>
        <div className="modal-header">
          <h1>Quiz Complete!</h1>
          <div className="score-badge">Score: {scorePercentage}%</div>
        </div>

        {view === "stats" && (
          <>
            <div className="result-content-layout">
              <div className="chart-container">
                <Doughnut data={data} options={options} />
              </div>

              <div className="stats-grid">
                <div className="stat-card correct">
                  <span>{correctAnswers}</span>
                  <span>Correct</span>
                </div>
                <div className="stat-card wrong">
                  <span>{wrongAnswers}</span>
                  <span>Wrong</span>
                </div>
                <div className="stat-card viewed">
                  <span>{totalViewed}</span>
                  <span>Viewed</span>
                </div>
              </div>
            </div>

            {/* AI BUTTON */}
            <div className="ai-review-container">
              <div>
                {/* AI COACH STRATEGY BANNER */}
                {localStrategy && (
                  <div
                    className={`ai-coach-banner strategy-${localStrategy.currentStrategy.toLowerCase()}`}
                  >
                    <div className="coach-text">
                      <h3>Coach's Analysis: {localStrategy.currentStrategy}</h3>
                      <p>
                        {localStrategy.currentStrategy === "REMEDIAL"
                          ? "We found some gaps. Let's focus on strengthening your foundation."
                          : localStrategy.currentStrategy === "CHALLENGE"
                            ? "Impressive! You've outgrown this level. Ready for a challenge?"
                            : "Consistent effort leads to mastery. Let's keep this momentum going!"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                className={`ai-review-btn ${isGenerating ? "loading" : ""}`}
                onClick={() => {
                  if (cachedReview) {
                    setAnimatedReview("");
                    setView("review");
                    animateText(cachedReview);
                  } else {
                    handleRequestReview();
                  }
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner" />
                    Writing Review...
                  </>
                ) : hasReview ? (
                  "View AI Review"
                ) : (
                  "Generate AI Review"
                )}
              </button>
            </div>

            {/* ACTIONS */}
            <div className="result-actions">
              <button className="analysis-btn" onClick={handleDetailedAnalysis}>
                Review Answers
              </button>

              <div className="bottom-row">
                <button className="retry-btn" onClick={handleStartPath}>
                  {localStrategy?.nextAction
                    ? ` Start Path: ${localStrategy.nextAction.subtopicId}`
                    : " Retry Quiz"}
                </button>

                <button className="retry-btn" onClick={() => navigate("/")}>
                  Home
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= REVIEW VIEW ================= */}
        {view === "review" && (
          <div className="review-page">
            <div className="review-header">
              <h3> Personalized Feedback</h3>

              <button
                className="start-btn"
                onClick={() => {
                  setView("stats");
                  setAnimatedReview("");
                }}
              >
                ← Back to Stats
              </button>
            </div>

            {/* LEFT ALIGNED REVIEW */}
            <div className="review-text-left">
              <ReactMarkdown>
                {animatedReview || "Generating review..."}
              </ReactMarkdown>
            </div>

            {/* ACTION BUTTONS */}
            <div className="review-actions">
              <button className="aimodal-retry-btn" onClick={handleStartPath}>
                {localStrategy?.nextAction
                  ? ` Start Path: ${localStrategy.nextAction.subtopicId}`
                  : " Retry Quiz"}
              </button>

              <button className="retry-btn" onClick={() => navigate("/")}>
                Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
