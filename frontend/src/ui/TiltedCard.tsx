import React, { useRef } from "react";

interface TiltedCardProps {
  containerHeight?: string;
  containerWidth?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  children: React.ReactNode;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  containerHeight = "200px",
  containerWidth = "200px",
  rotateAmplitude = 20,
  scaleOnHover = 1.02,
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateX = ((y - midY) / midY) * rotateAmplitude*1.5;
    const rotateY = ((x - midX) / midX) * rotateAmplitude*1.5;

    card.style.transform = `
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      scale(${scaleOnHover})
    `;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: "1000px",
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          height: "100%",
          width: "100%",
          transition: "transform 0.2s ease",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default TiltedCard;