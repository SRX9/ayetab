"use client";

import { useMemo, type ReactNode } from "react";
import { ThemeContext } from "./theme-context";

/**
 * Light-only product. ThemeProvider now pins the resolved theme to "light" and
 * never writes a `dark` class. Kept as a provider so existing consumers
 * (useTheme, AppearanceSync) keep their API while dark mode is gone.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      theme: "light" as const,
      resolvedTheme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
