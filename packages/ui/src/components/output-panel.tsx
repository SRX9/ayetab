"use client";

import type { ToolResult } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { useClipboard } from "../hooks/use-clipboard";
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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
        {value && (
          <button
            onClick={() => copy(copyText)}
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
      ) : result?.format === "html" && result.html ? (
        <HtmlPreview html={result.html} />
      ) : result?.format === "image" && result.imageSrc ? (
        <ImagePreview src={result.imageSrc} />
      ) : result?.format === "diff" && result.diffLines ? (
        <DiffView lines={result.diffLines} />
      ) : result?.language ? (
        <CodeOutput value={value} language={result.language} rows={rows} />
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
