"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

/** Current theme, kept in sync with the "dark" class on <html>. */
export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true);

  const setTheme = (theme: Theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage unavailable (private mode) — theme still applies for this visit.
    }
  };

  return { theme: (dark ? "dark" : "light") as Theme, setTheme };
}
