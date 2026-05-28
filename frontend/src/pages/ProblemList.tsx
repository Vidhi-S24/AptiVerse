import "../styles/ProblemList.css";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { topicData } from "../constants/topics.constants";
import { useEffect } from "react";

const topics = Object.entries(topicData).map(([title, subtopics], i) => ({
  id: i + 1,
  title,
  subtopics,
}));

function ProblemList() {
  const navigate = useNavigate();
  const location = useLocation();
  const examName = location.state?.examName;

  useEffect(() => {
    document.title = `Browse ${examName ? examName : ""} Topics | AptiVerse`;
  });

  return (
    <div className="problem-list-page">
      <div className="topics-grid">
        {topics.map((category) => (
          <div key={category.id} className="topic-card">
            <h2
              className="topic-title"
              onClick={() =>
                navigate("/quiz", {
                  state: {
                    examName,
                    topicName: category.title,
                    topicId: category.title,
                  },
                })
              }
            >
              {category.title}
            </h2>

            <ul className="topic-list">
              {category.subtopics.map((topic, index) => (
                <li
                  key={index}
                  className="topic-item"
                  onClick={() =>
                    navigate("/quiz", {
                      state: {
                        examName,
                        topicName: category.title,
                        subtopic: topic,
                        topicId: category.title,
                        subtopicId: topic,
                      },
                    })
                  }
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProblemList;
