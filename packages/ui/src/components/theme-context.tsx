"use client";

import { createContext } from "react";

/** Light-only product: theme is pinned. */
export interface ThemeContextValue {
  theme: "light";
  resolvedTheme: "light";
  setTheme: (theme: "light") => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
