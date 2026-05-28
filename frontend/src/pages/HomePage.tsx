import "../styles/HomePage.css";
import { useNavigate } from "react-router-dom";
import { AnimatedBee } from "../ui/AnimatedBee";
import { useEffect } from "react";
import TiltedCard from "../ui/TiltedCard";

import hexLight from "../assets/icons/light_hex.png";
import hexDark from "../assets/icons/dark_hex.png";

interface HomePageProps {}

const examData = [
  { id: 1, name: "NDA" },
  { id: 2, name: "SSC CGL" },
  { id: 3, name: "Bank PO" },
  { id: 4, name: "RRB NTPC" },
  { id: 5, name: "CAT" },
  { id: 6, name: "CLAT" },
  { id: 7, name: "GATE" },
  { id: 8, name: "CUET" },
  { id: 9, name: "Campus Placements" },
  { id: 10, name: "BITSAT" },
  { id: 11, name: "CMAT" },
];

function HomePage({}: HomePageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Home | AptiVerse";
    return () => {
      document.title = "AptiVerse";
    };
  }, []);

  const handleExamClick = (examName: string) => {
    navigate("/problem-list", { state: { examName } });
  };

  const renderTile = (exam: any) => (
    <div key={exam.id} className="hex-tile-container">
      {(exam.name === "RRB NTPC" || exam.name === "CUET") && (        
        <div
          className={`home-bee ${
            exam.name === "CUET" ? "bee-left" : "bee-right"
          }`}
        >
          <AnimatedBee />
        </div>
      )}

      <TiltedCard
        containerHeight="120px"
        containerWidth="150px"
        rotateAmplitude={20}
        scaleOnHover={1.02}
      >
        <div
          className="hex-tile"
          onClick={() => handleExamClick(exam.name)}
        >
          <img src={hexLight} alt="hex" className="hex-bg light" />
          <img src={hexDark} alt="hex" className="hex-bg dark" />

          <span className="hex-text">{exam.name}</span>
        </div>
      </TiltedCard>
    </div>
  );

  return (
    <div className="grid-container">
      <div className="row row-1">{examData.slice(0, 4).map(renderTile)}</div>
      <div className="row row-2">{examData.slice(4, 7).map(renderTile)}</div>
      <div className="row row-3">{examData.slice(7).map(renderTile)}</div>
    </div>
  );
}

export default HomePage;