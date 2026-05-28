import '../styles/TopicDetail.css';
import { useNavigate } from "react-router-dom";


interface TopicDetailProps {
  topicName: string;
  onBack: () => void;
}

function TopicDetail({ topicName, onBack }: TopicDetailProps) {
  const navigate = useNavigate();
  const problems = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    title: 'ABC'
  }));

  return (
    <div className="topic-detail-page">
      <div className="topic-header">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <div className="topic-selector">
          <span className="topic-label">Topic</span>
          <select className="topic-dropdown" defaultValue={topicName}>
            <option>{topicName}</option>
          </select>
        </div>
        <div className="take-test">
          <button
            className="take-test-btn"
            onClick={() => navigate("/question-bank")}
          >
            Take Test
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search problems..."
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>

      <div className="problems-list">
        {problems.map((problem) => (
          <div key={problem.id} className="problem-item">
            <span className="problem-number">{problem.id}.</span>
            <span className="problem-title">{problem.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopicDetail;
