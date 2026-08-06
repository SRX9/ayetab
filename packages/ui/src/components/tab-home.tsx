import { type ReactNode } from "react";
import { type ToolDefinition } from "@ayetab/utils";
import { usePreferences } from "../hooks/use-preferences";
import { BentoCanvas } from "./bento-canvas";

interface TabHomeProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
  title?: string;
  /** Extra content below the canvas (e.g. first-run notices). */
  children?: ReactNode;
}

/**
 * The personal new-tab surface: a free-form bento canvas you drag, stretch,
 * and arrange — the macOS dashboard feel. No sidebar, no greeting chrome.
 */
export function TabHome({ tools, onOpenTool, children }: TabHomeProps) {
  const { prefs } = usePreferences();
  const hint = prefs.favorites.length === 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-40 pt-10 md:pt-14">
      {children}

      <BentoCanvas tools={tools} onOpenTool={onOpenTool} />

      <p className="mt-10 text-center text-caption text-muted-foreground">
        Press <kbd>⌘</kbd> <kbd>K</kbd> to search every tool.
        {hint && <> Star a tool to pin it here and in the dock.</>}
      </p>
    </div>
  );
}
