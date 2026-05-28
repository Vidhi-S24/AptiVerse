import * as confetti from "canvas-confetti";

export const fireSideConfetti = () => {
  const fire = (confetti as any).default || confetti;
  fire({
    particleCount: 250,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.5 },
    colors: ["#22c55e", "#facc15", "#ef4444", "#3b82f6", "#720c4e", "#af1db7"],
  });
  fire({
    particleCount: 250,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.5 },
    colors: ["#22c55e", "#facc15", "#ef4444", "#3b82f6", "#720c4e", "#af1db7"],
  });
};
