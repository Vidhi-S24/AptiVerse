import "../../styles/QuizInstructions.css";
import timerIcon from "../../assets/icons/timerIcon.png";
import questionIcon from "../../assets/icons/questionIcon.png";
import noteIcon from "../../assets/icons/noteIcon.png";
import confettiIcon from "../../assets/icons/confettiIcon.png";

interface Props {
  totalQuestions: number;
  randomImage: string | undefined;
  isDarkMode: boolean;
}

export const QuizInstructions = ({ totalQuestions, randomImage, isDarkMode }: Props) => {
  const iconStyle = { filter: isDarkMode ? "brightness(0) invert(1)" : "brightness(0)" };

  return (
    <div className="get-ready-container">
      <div className="ready-image-wrapper">
        <img src={randomImage} alt="ready" className="ready-image" />
      </div>

      <div className="quiz-instructions glass-modal">
        <h2>Test Instructions</h2>
        <ul>
          <li>
            <img src={timerIcon} alt="timer" className="icon" style={iconStyle} />
            <div>
              <strong>Test Duration: 15 Minutes</strong>
              <p>If time runs out, your test will submit automatically.</p>
            </div>
          </li>
          <li>
            <img src={questionIcon} className="icon" style={iconStyle} />
            <div>
              <strong>Questions: {totalQuestions}</strong>
              <p>You can navigate between questions using the numbers in the sidebar.</p>
            </div>
          </li>
          <li>
            <img src={noteIcon} className="icon" style={iconStyle} />
            <div>
              <strong>Note:</strong>
              <p>On small screens, if an equation looks cluttered, try rotating your device.</p>
            </div>
          </li>
          <li>
            <img src={confettiIcon} className="icon" style={iconStyle} />
            <div style={{ marginTop: "4px" }}>
              <strong>Finish the test to see your detailed results!</strong>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};