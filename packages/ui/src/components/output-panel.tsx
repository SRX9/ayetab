"use client";

import type { ToolResult } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { useClipboard } from "../hooks/use-clipboard";
import { Button } from "./button";
import { CodeOutput } from "./code-output";
import { DiffView } from "./diff-view";
import { HtmlPreview } from "./html-preview";
import { ImagePreview } from "./image-preview";

interface OutputPanelProps {
  value: string;
  error?: string | null;
  label?: string;
  className?: string;
  rows?: number;
  result?: Pick<ToolResult, "format" | "html" | "language" | "diffLines" | "imageSrc">;
}

export function OutputPanel({
  value,
  error,
  label = "Output",
  className,
  rows = 8,
  result,
}: OutputPanelProps) {
  const { copied, copy } = useClipboard();
  const copyText = result?.format === "html" ? value : value;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(copyText)}
            className={cn("h-6 px-2", copied && "text-brand")}
          >
            <span
              className={cn(
                "inline-flex transition-[filter,opacity] duration-200 ease-out-strong",
                copied && "opacity-90"
              )}
            >
              {copied ? "Copied" : "Copy"}
            </span>
          </Button>
        )}
      </div>
      {error ? (
        <div
          data-testid="tool-output-error"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive animate-fade-up motion-reduce:animate-none"
        >
          {error}
        </div>
      ) : result?.format === "html" && result.html ? (
        <HtmlPreview html={result.html} />
      ) : result?.format === "image" && result.imageSrc ? (
        <ImagePreview src={result.imageSrc} />
      ) : result?.format === "diff" && result.diffLines ? (
        <DiffView lines={result.diffLines} data-testid="tool-output-diff" />
      ) : result?.language ? (
        <CodeOutput value={value} language={result.language} rows={rows} />
      ) : (
        <textarea
          value={value}
          readOnly
          rows={rows}
          data-testid="tool-output-text"
          className="w-full resize-y rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3 text-sm font-mono focus-visible:outline-none"
          spellCheck={false}
        />
      )}
    </div>
  );
}
