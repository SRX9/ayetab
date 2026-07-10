"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { detectTool } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { Button } from "./button";

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
        "flex items-center justify-between gap-3 rounded-lg border border-brand/25 bg-brand/5 px-3 py-2.5",
        "animate-fade-up motion-reduce:animate-none",
        className
      )}
    >
      <p className="text-xs leading-relaxed">
        <span className="text-muted-foreground">Detected </span>
        <span className="font-medium">{detection.tool.name}</span>
        <span className="ml-1 text-muted-foreground">({detection.confidence})</span>
      </p>
      <div className="flex shrink-0 gap-1.5">
        <Button variant="primary" size="sm" onClick={() => onAccept(detection.tool, pastedText)}>
          Open
        </Button>
        <Button variant="outline" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
