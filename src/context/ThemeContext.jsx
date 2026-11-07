import React, { createContext, useContext, useState, useEffect } from "react";
import { getStoredTheme, saveStoredTheme, getStoredReducedMotion, saveStoredReducedMotion } from "../utils/storage.js";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [reducedMotion, setReducedMotion] = useState(() => getStoredReducedMotion());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
      root.classList.add("reduced-motion");
    } else {
      root.removeAttribute("data-reduced-motion");
      root.classList.remove("reduced-motion");
    }
    saveStoredReducedMotion(reducedMotion);
  }, [reducedMotion]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
