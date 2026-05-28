import { useState, useEffect, useRef } from "react";

export const useQuizTimer = (onExpire: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [timerStarted, setTimerStarted] = useState(false);
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = (duration: number = 15 * 60) => {
    clearInterval(intervalRef.current!); // 🧹 clear old timer
    setTimeRemaining(duration);
    setTimerStarted(true);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    setTimerStarted(false);
    setTimeRemaining(15 * 60);
  };

  useEffect(() => {
    if (!timerStarted) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimerStarted(false);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [timerStarted, onExpire]);

  return { timeRemaining, timerStarted, startTimer, resetTimer };
};