"use client";

import { useMemo, type ReactNode } from "react";
import { type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { usePreferences } from "../hooks/use-preferences";
import { BrandMark } from "./brand-mark";
import { WidgetGrid } from "./widget-grid";

interface TabHomeProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
  title?: string;
  /** Extra content below the widget grid (e.g. first-run notices). */
  children?: ReactNode;
}

/**
 * The personal new-tab surface: a calm greeting, then the draggable widget
 * grid. No sidebar — the dock at the bottom of the shell handles launching.
 */
export function TabHome({ tools, onOpenTool, title = "AyeTab", children }: TabHomeProps) {
  const { prefs } = usePreferences();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const date = useMemo(
    () => new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }),
    []
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-40 pt-12 md:pt-16">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" size={40} src="/logo-icon.png" />
          <div>
            <h1 className="text-display font-semibold text-balance text-foreground">{greeting}</h1>
            <p className="mt-1 text-ui text-muted-foreground">
              {date} · <span className="tabular-nums">{tools.length}</span> tools, on your device.
            </p>
          </div>
        </div>
      </header>

      {children}

      <WidgetGrid tools={tools} onOpenTool={onOpenTool} />

      <p className="mt-10 text-center text-caption text-muted-foreground">
        Press <kbd>⌘</kbd> <kbd>K</kbd> to search every tool.
        {prefs.favorites.length === 0 && <> Star a tool to pin it here and in the dock.</>}
      </p>
    </div>
  );
}
