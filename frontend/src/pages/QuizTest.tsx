import "../styles/QuizLayout.css";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// Hooks & Context
import { useAuth } from "../context/AuthContext";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { useFullscreen } from "../hooks/useFullScreen";

// Services & Utils
import { fetchQuizQuestions } from "../services/questions.service";
import { fireSideConfetti } from "../utils/confetti";
import { mockQuestions } from "../constants/quiz.constants";

// UI Components
import { QuizHeader } from "../components/quiz/QuizHeader";
import { QuizInstructions } from "../components/quiz/QuizInstructions";
import { QuestionCard } from "../components/quiz/QuestionCard";
import { QuizSidebar } from "../components/quiz/QuizSidebar";
import { ResultModal } from "../components/quiz/ResultModal";
import { AnimatedBee } from "../ui/AnimatedBee";

// Assets
import bee from "../assets/icons/beeIcon.png";
import test1 from "../assets/images/quiz-ready-image-1.png";
import test2 from "../assets/images/quiz-ready-image-2.png";
import test3 from "../assets/images/quiz-ready-image-3.png";
import test4 from "../assets/images/quiz-ready-image-4.png";
import test5 from "../assets/images/quiz-ready-image-5.png";

const studyImages = [test1, test2, test3, test4, test5];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// function QuizTest({ isDarkMode }: { isDarkMode: boolean })
function QuizTest({
  isDarkMode,
  setIsQuizMode,
}: {
  isDarkMode: boolean;
  setIsQuizMode: (val: boolean) => void;
}) {
  const { user, session, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    examName = "",
    topicName = "All Topics",
    subtopic = "Random Selection",
    topicId = null,
    subtopicId = null,
  } = location.state || {};

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now(),
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<number, "correct" | "wrong" | "unanswered">
  >({});
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [viewedSolutions, setViewedSolutions] = useState<
    Record<number, boolean>
  >({});
  const [visibleSolutions, setVisibleSolutions] = useState<
    Record<number, boolean>
  >({});
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<
    Record<number, number>
  >({});

  const lastFetchedKey = useRef<string | null>(null);

  const randomImage = useMemo(
    () => studyImages[Math.floor(Math.random() * studyImages.length)],
    [],
  );

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleTimerExpire = useCallback(() => {
    finishQuiz().catch(console.error);
    setShowResultPopup(true);
  }, []);

  const { timeRemaining, timerStarted, startTimer, resetTimer } =
    useQuizTimer(handleTimerExpire);

  const { enterFullscreen, exitFullscreen } = useFullscreen();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleStart = async () => {
    startTimer();
    setIsQuizMode(true);

    await enterFullscreen();
  };

  useEffect(() => {
    if (showResultPopup) {
      setIsQuizMode(false);
      exitFullscreen();
    }
  }, [showResultPopup]);

  const handleStartMockTest = useCallback(() => {
    const formattedMocks = mockQuestions.map((q: any, i: number) => {
      const correctOptionMap: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };
      return {
        id: q.id || `mock-${i}`,
        number: i + 1,
        text: q.questionText,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctOption: correctOptionMap[q.correctAnswer] ?? 0,
        solution: q.solution || "No solution provided",
        year: q.yearAsked || q.year || 2026,
        imageUrl: q.imageUrl || null,
        conditions: q.conditions || [],
      };
    });

    setQuestions(formattedMocks);
    setIsUnauthenticated(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSubmitting) return;

    const steps = [
      " Collecting your hive answers...",
      " Analyzing honeycomb patterns...",
      " Calculating swarm accuracy...",
      "Comparing with hive intelligence...",
      " Preparing your performance report...",
    ];

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setLoadingStep(index);
    }, 1500);

    return () => clearInterval(interval);
  }, [isSubmitting]);

  // Set tab title
  useEffect(() => {
    if (topicName) {
      document.title = `${examName ? `${examName} - ` : ""}${topicName} Quiz | AptiVerse`;
    }
    return () => {
      document.title = "AptiVerse";
    };
  }, [topicName]);

  useEffect(() => {
    const currentKey = location.state?.key || location.state?.subtopicId;

    if (authLoading || lastFetchedKey.current === currentKey) return;

    const loadData = async () => {
      resetTimer();
      setShowResultPopup(false);
      lastFetchedKey.current = currentKey;
      if (!user) {
        setIsUnauthenticated(true);
        setLoading(false);
        return;
      }
      setIsUnauthenticated(false);
      setLoading(true);
      try {
        let data;
        if (true || location.state?.mode === "personalized") {
          setCurrentQuestion(0);
          setUserAnswers({});
          setAnsweredQuestions({});
          setTimeSpentPerQuestion({});
          setViewedSolutions({});
          setVisibleSolutions({});
          setSelectedAnswer(null);
          console.log("Entering the recommended path with params:", {
            topicId,
            subtopicId,
          });
          const response = await axios.get(
            `${API_URL}/api/questions/quiz/personalized`,
            {
              headers: { Authorization: `Bearer ${session?.access_token}` },
            },
          );
          data = response.data;
        } else {
          data = await fetchQuizQuestions({
            examName,
            topicId,
            subtopicId,
          });
        }

        const normalizedData = data.map((q: any, index: number) => {
          return {
            ...q,
            isAiGenerated: !!q.isAiGenerated,
            number: index + 1,
            text: q.text || q.questionText || "",
            options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD],
            correctOption:
              typeof q.correctOption === "number"
                ? q.correctOption
                : ({ A: 0, B: 1, C: 2, D: 3 }[q.correctAnswer as string] ?? 0),
          };
        });

        setQuestions(normalizedData);
      } catch (err) {
        console.error("Quiz questions fetch failed, loading mocks:", err);
        handleStartMockTest();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, authLoading, location.state]);

  // If a user previously selected an option, keep it selected when they navigate back
  useEffect(() => {
    const qNum = currentQuestion + 1;
    if (userAnswers[qNum] !== undefined) {
      setSelectedAnswer(userAnswers[qNum]);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestion, userAnswers]);

  const handleAnswerSubmit = async () => {
    const qNum = currentQuestion + 1;
    const currentQ = questions[currentQuestion];

    const now = Date.now();
    const secondsSpent = Math.floor((now - questionStartTime) / 1000);

    setTimeSpentPerQuestion((prev) => ({
      ...prev,
      [qNum]: (prev[qNum] || 0) + secondsSpent,
    }));

    // 1. Navigation for Unanswered
    if (selectedAnswer === null) {
      if (currentQuestion === questions.length - 1)
        return setShowResultPopup(true);
      return setCurrentQuestion((prev) => prev + 1);
    }

    // 2. Metrics Calculation
    const isCorrect = selectedAnswer === currentQ.correctOption;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    setAnsweredQuestions((prev) => ({
      ...prev,
      [qNum]: isCorrect ? "correct" : "wrong",
    }));
    setUserAnswers((prev) => ({ ...prev, [qNum]: selectedAnswer }));

    // 4. Transition Animation
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        // setShowSolution(false);
      }, 400);
    } else {
      await finishQuiz();
    }

    setQuestionStartTime(Date.now());
  };

  const shouldStoreQuestion = (qNum: number, answerIndex: any) => {
    const isAnswered = answerIndex !== undefined && answerIndex !== null;
    const isViewed = !!viewedSolutions[qNum];

    return isAnswered || isViewed;
  };

  const finishQuiz = async () => {
    setIsSubmitting(true);
    setLoadingStep(0);
    const qNum = currentQuestion + 1;
    const finalUserAnswers = {
      ...userAnswers,
      ...(selectedAnswer !== null && { [qNum]: selectedAnswer }),
    };

    const finalAnsweredQuestions = {
      ...answeredQuestions,
      ...(selectedAnswer !== null && {
        [qNum]:
          selectedAnswer === questions[currentQuestion].correctOption
            ? "correct"
            : "wrong",
      }),
    };
    const totalTimeTaken = Object.values(timeSpentPerQuestion).reduce(
      (acc, time) => acc + time,
      0,
    );

    const totalCorrect = Object.values(answeredQuestions).filter(
      (v) => v === "correct",
    ).length;

    const optionMapping = ["A", "B", "C", "D"];

    const payload = {
      userId: user?.id,
      topicId: topicId || questions[0]?.topicId,
      subtopicId: subtopicId || questions[0]?.subtopicId,
      score: Object.values(finalAnsweredQuestions).filter(
        (v) => v === "correct",
      ).length,
      totalQuestions: questions.length,
      timeTaken: totalTimeTaken || 0,
      answers: questions
        .map((q, i) => {
          const qNum = i + 1;
          const answerIndex = finalUserAnswers[qNum];

          if (!shouldStoreQuestion(qNum, answerIndex)) return null;

          const isAnswered = answerIndex !== undefined && answerIndex !== null;

          return {
            questionId: q.id,
            topicId: q.topicId || topicId || "",
            subtopicId: q.subtopicId || subtopicId || "",
            isAiGenerated: !!q.isAiGenerated || false,
            isCorrect: isAnswered
              ? finalAnsweredQuestions[qNum] === "correct"
              : false,

            selectedOption: isAnswered ? optionMapping[answerIndex] : "SKIPPED",

            timeSpent: timeSpentPerQuestion[qNum] || 0,

            viewedSolution: !!viewedSolutions[qNum],

            status: isAnswered ? "answered" : "viewed",
          };
        })
        .filter(Boolean),
    };

    try {
      await axios.post(`${API_URL}/api/questions/quiz/submit`, payload, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setIsSubmitting(false);
      setShowResultPopup(true);
      fireSideConfetti();
    } catch (err) {
      console.error("Final quiz sync failed:", err);
      setIsSubmitting(false);
      setShowResultPopup(true);
    }
  };

  const handleNextQuiz = () => {
    resetTimer();
    setShowResultPopup(false);
    setCurrentQuestion(0);
    setAnsweredQuestions({});
    setUserAnswers({});
    setVisibleSolutions({});
    setViewedSolutions({});
    setQuestions([]);
    if (aiRecommendation?.nextAction) {
      const {
        topicId: nextTopic,
        subtopicId: nextSub,
        difficulty,
      } = aiRecommendation.nextAction;
      navigate("/quiz", {
        state: {
          mode: "personalized",
          examName,
          topicName: "Recommended Path",
          topicId: nextTopic,
          subtopicId: nextSub,
          difficulty,
        },
      });
    } else {
      navigate("/quiz", { state: { examName, topicId, subtopicId } });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="quiz-test-container">
        <div className="loader-content" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "-66px" }}>
            <AnimatedBee />
          </div>
          <div className="loader">Pollinating the questions...</div>
        </div>
      </div>
    );
  }

  if (isUnauthenticated) {
    return (
      <div className="quiz-test-container">
        <div className="no-questions-card glass-modal">
          <AnimatedBee />
          <h2>Join the Hive!</h2>
          <p>Please Sign In to take tests and track your progress</p>
          <div
            className="error-actions"
            style={{ display: "flex", gap: "12px", marginTop: "20px" }}
          >
            <button className="start-btn" onClick={() => navigate("/")}>
              Go Home
            </button>
            <button className="start-btn mock" onClick={handleStartMockTest}>
              Try a Mock Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-test-container">
        <div className="no-questions-card glass-modal">
          <img src={bee} alt="error" className="bee-error-icon" />
          <h2>Empty Hive!</h2>
          <p>
            No questions found for <strong>{topicName}</strong>.
          </p>
          <button className="start-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="quiz-test-container">
        <div className="loader-content bee-loader">
          <div className="bee-animation">
            <AnimatedBee />
          </div>

          {/* Loading ring */}
          <div className="loader-ring">
            <div className="ring"></div>
            <div className="ring-glow"></div>
          </div>

          <h2 className="loader-title">Hive Intelligence at Work</h2>

          <p className="loader-subtext step-fade">
            {loadingStep === 0 && " Collecting your hive answers..."}
            {loadingStep === 1 && " Analyzing honeycomb patterns..."}
            {loadingStep === 2 && " Calculating swarm accuracy..."}
            {loadingStep === 3 && "Comparing with hive intelligence..."}
            {loadingStep === 4 && " Preparing your performance report..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-test-container">
      <QuizHeader
        examName={examName}
        topicName={topicName}
        subtopic={subtopic}
        timeRemaining={timeRemaining}
        isDarkMode={isDarkMode}
      >
        {!timerStarted && (
          <button className="start-btn" onClick={handleStart}>
            Start Test
          </button>
        )}
      </QuizHeader>

      {!timerStarted ? (
        <QuizInstructions
          totalQuestions={questions.length}
          randomImage={randomImage}
          isDarkMode={isDarkMode}
        />
      ) : (
        <div className="quiz-content">
          <QuestionCard
            question={questions[currentQuestion]}
            selectedAnswer={selectedAnswer}
            status={answeredQuestions[currentQuestion + 1]}
            isLocked={
              !!(
                answeredQuestions[currentQuestion + 1] ||
                viewedSolutions[currentQuestion + 1]
              )
            }
            //
            showSolution={!!visibleSolutions[currentQuestion + 1]}
            onAnswerSelect={setSelectedAnswer}
            onSubmit={handleAnswerSubmit}
            isAiGenerated={questions[currentQuestion]?.isAiGenerated}
            onToggleSolution={() => {
              const qNum = currentQuestion + 1;

              setViewedSolutions((prev) => ({
                ...prev,
                [qNum]: true,
              }));

              setVisibleSolutions((prev) => ({
                ...prev,
                [qNum]: !prev[qNum],
              }));

              if (!answeredQuestions[qNum]) {
                setSelectedAnswer(null);
              }
            }}
          />

          <QuizSidebar
            progressPercentage={Math.round(
              (Object.keys(answeredQuestions).length / questions.length) * 100,
            )}
            questionsCompleted={Object.keys(answeredQuestions).length}
            totalQuestions={questions.length}
            correctAnswers={
              Object.values(answeredQuestions).filter((v) => v === "correct")
                .length
            }
            wrongAnswers={
              Object.values(answeredQuestions).filter((v) => v === "wrong")
                .length
            }
            currentQuestion={currentQuestion}
            getQuestionStatus={(n) =>
              answeredQuestions[n] ||
              (viewedSolutions[n] ? "viewed" : "unanswered")
            }
            onNavClick={(n) => {
              setCurrentQuestion(n - 1);
            }}
            onNext={() => {
              handleAnswerSubmit();
            }}
            onSubmitTest={finishQuiz}
          />
        </div>
      )}

      {showResultPopup && (
        <ResultModal
          userId={user?.id}
          correctAnswers={
            Object.values(answeredQuestions).filter((v) => v === "correct")
              .length
          }
          wrongAnswers={
            Object.values(answeredQuestions).filter((v) => v === "wrong").length
          }
          totalViewed={Object.keys(viewedSolutions).length}
          totalQuestions={questions.length}
          questions={questions}
          answeredQuestions={answeredQuestions}
          correctAnswersArray={questions.map((q) => q.correctOption)}
          viewedSolutions={viewedSolutions}
          userAnswers={userAnswers}
          viewingResults={false}
          onRetry={handleNextQuiz}
          aiRecommendation={aiRecommendation}
        />
      )}
    </div>
  );
}

export default QuizTest;
