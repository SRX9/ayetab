"use client";

import { useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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
  const uid = useId();
  const outputId = `tool-output-${uid}`;

  // Only the plain-textarea branch renders an element the label can point at.
  const isPlainText =
    !error &&
    !(result?.format === "html" && result.html) &&
    !(result?.format === "image" && result.imageSrc) &&
    !(result?.format === "diff" && result.diffLines) &&
    !result?.language;

  const heading = isPlainText ? (
    <label htmlFor={outputId} className="text-label font-medium uppercase text-muted-foreground">
      {label}
    </label>
  ) : (
    <span className="text-label font-medium uppercase text-muted-foreground">{label}</span>
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        {heading}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copy(value)}
            className={cn("h-6 px-2", copied && "text-brand")}
          >
            {/* Motion is never the only channel — the icon and label both change. */}
            <span className="icon-swap h-3.5 w-3.5">
              <HugeiconsIcon
                icon={Tick02Icon}
                size={14}
                strokeWidth={2}
                color="currentColor"
                aria-hidden
                data-state={copied ? "shown" : "hidden"}
              />
              <HugeiconsIcon
                icon={Copy01Icon}
                size={14}
                strokeWidth={1.75}
                color="currentColor"
                aria-hidden
                data-state={copied ? "hidden" : "shown"}
              />
            </span>
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      {/* Output is recomputed on a 300ms debounce; without this it changes silently. */}
      <p aria-live="polite" className="sr-only">
        {error ? "" : value ? `${label} updated` : ""}
      </p>
      {error ? (
        <div
          role="alert"
          data-testid="tool-output-error"
          className="rounded border border-destructive/35 bg-destructive/[0.07] px-3 py-2 text-sm text-destructive"
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
          id={outputId}
          value={value}
          readOnly
          rows={rows}
          data-testid="tool-output-text"
          aria-label={label}
          className="field w-full resize-y px-3 py-2.5 font-mono text-base/[1.5] focus-visible:outline-none sm:text-sm/[1.5]"
          spellCheck={false}
        />
      )}
    </div>
  );
}
