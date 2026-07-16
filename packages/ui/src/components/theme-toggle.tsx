"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "./theme-provider";
import { Button } from "./button";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      className={cn("h-8 w-8 text-muted-foreground", className)}
      title={`Switch to ${next} mode`}
    >
      {resolvedTheme === "dark" ? (
        <HugeiconsIcon icon={Sun03Icon} size={16} strokeWidth={1.75} color="currentColor" />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={16} strokeWidth={1.75} color="currentColor" />
      )}
    </Button>
  );
}
