import { useState, useEffect } from "react";

const STORAGE_KEY = "b2_ui_prefs";

export default function useUiPrefs() {
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          accessibilityBoost: false,
          simpleLanguage: false,
          fontScale: 1,
          reduceMotion: false,
        };
      }
    }
    return {
      accessibilityBoost: false,
      simpleLanguage: false,
      fontScale: 1,
      reduceMotion: false,
    };
  });

  // Apply prefs and save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    const root = document.documentElement;

    root.style.fontSize = `${16 * prefs.fontScale}px`;

    prefs.reduceMotion
      ? root.classList.add("reduce-motion")
      : root.classList.remove("reduce-motion");

    prefs.accessibilityBoost
      ? root.classList.add("accessibility-boost")
      : root.classList.remove("accessibility-boost");

    prefs.simpleLanguage
      ? root.classList.add("simple-language")
      : root.classList.remove("simple-language");
  }, [prefs]);

  return { prefs, setPrefs };
}