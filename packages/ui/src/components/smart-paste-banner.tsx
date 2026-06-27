"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { detectTool } from "@ayetab/utils";
import { cn } from "../lib/utils";

interface SmartPasteBannerProps {
  pastedText: string;
  onAccept: (tool: ToolDefinition, text: string) => void;
  onDismiss: () => void;
  className?: string;
}

export function SmartPasteBanner({ pastedText, onAccept, onDismiss, className }: SmartPasteBannerProps) {
  const detection = detectTool(pastedText);

  if (!detection) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2",
        className
      )}
    >
      <p className="text-xs">
        <span className="text-muted-foreground">Detected: </span>
        <span className="font-medium">{detection.tool.name}</span>
        <span className="text-muted-foreground ml-1">({detection.confidence})</span>
      </p>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => onAccept(detection.tool, pastedText)}
          className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:opacity-90"
        >
          Open
        </button>
        <button
          onClick={onDismiss}
          className="text-xs px-2 py-0.5 rounded border border-border hover:bg-accent"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
