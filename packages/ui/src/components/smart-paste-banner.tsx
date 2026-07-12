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
        "flex items-center justify-between gap-3 rounded-[14px] border border-brand/20 bg-brand/8 px-3.5 py-2.5 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--specular)/0.35)]",
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
