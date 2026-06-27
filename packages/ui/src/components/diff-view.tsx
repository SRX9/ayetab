"use client";

import { cn } from "../lib/utils";

interface DiffViewProps {
  lines: Array<{ type: "added" | "removed" | "unchanged"; value: string }>;
  className?: string;
}

export function DiffView({ lines, className }: DiffViewProps) {
  return (
    <div className={cn("rounded-md border border-input overflow-auto font-mono text-xs", className)}>
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            "px-3 py-0.5 whitespace-pre-wrap break-all",
            line.type === "added" && "bg-green-500/10 text-green-700 dark:text-green-400",
            line.type === "removed" && "bg-red-500/10 text-red-700 dark:text-red-400",
            line.type === "unchanged" && "text-muted-foreground"
          )}
        >
          <span className="inline-block w-4 select-none opacity-50">
            {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
          </span>
          {line.value || " "}
        </div>
      ))}
    </div>
  );
}
