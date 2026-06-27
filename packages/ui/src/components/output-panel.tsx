"use client";

import { cn } from "../lib/utils";
import { useClipboard } from "../hooks/use-clipboard";

interface OutputPanelProps {
  value: string;
  error?: string | null;
  label?: string;
  className?: string;
  rows?: number;
}

export function OutputPanel({
  value,
  error,
  label = "Output",
  className,
  rows = 8,
}: OutputPanelProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
        {value && (
          <button
            onClick={() => copy(value)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <textarea
          value={value}
          readOnly
          rows={rows}
          className="w-full resize-y rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono focus-visible:outline-none"
          spellCheck={false}
        />
      )}
    </div>
  );
}
