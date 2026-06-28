"use client";

import { useTheme } from "./theme-provider";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "rounded-md border border-border px-2 py-1 text-xs text-muted-foreground",
        "hover:bg-accent hover:text-foreground transition-colors",
        className
      )}
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
