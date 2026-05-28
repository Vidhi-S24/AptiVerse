import { useEffect, useState } from "react";

export function useTheme(): boolean {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const getTheme = (): boolean => {
      const theme = document.documentElement.dataset.theme;
      return theme === "dark";
    };

    const updateTheme = () => {
      setIsDark(getTheme());
    };

    // initial check
    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}