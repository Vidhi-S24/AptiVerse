import { useCallback } from "react";

export const useFullscreen = () => {
  const enterFullscreen = useCallback(async () => {
    const el = document.documentElement;

    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } catch {
      console.log("Fullscreen not supported");
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  return { enterFullscreen, exitFullscreen };
};