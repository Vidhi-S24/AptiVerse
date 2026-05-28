import "../../styles/QuizHeader.css";
import timerIcon from "../../assets/icons/timerIcon.png";
import BeeIcon from "../../assets/icons/beeIcon.png";

interface Props {
  examName: string;
  topicName: string;
  subtopic: string;
  timeRemaining: number;
  isDarkMode: boolean;
  children?: React.ReactNode;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const QuizHeader = ({
  examName,
  topicName,
  subtopic,
  timeRemaining,
  isDarkMode,
  children,
}: Props) => (
  <div className="quiz-header">
    <div className="bee-wrapper">
      <div
        style={{
          position: "absolute",
          bottom: "90px",
          right: "10px",
          transform: "scaleX(-1)",
        }}

        className="quizheader-bee"
      >
        <img src={BeeIcon} alt="bee" className="bee" style={{ left: "-30px", top: "15px" }} />
      </div>
    </div>
    <div className="exam-selector">
      <div className="exam-display">
        <h3 className="exam-title">
          {examName ? examName : "All Exams"} &gt; {topicName} &gt; {subtopic}
        </h3>
      </div>
      {children}
    </div>
    <div className="timer">
      <img
        src={timerIcon}
        alt="timer"
        className="timer-icon"
        style={{
          filter: isDarkMode ? "brightness(0) invert(1)" : "brightness(0)",
        }}
      />
      <span className="timer-text">Time: {formatTime(timeRemaining)}</span>
    </div>
  </div>
);
