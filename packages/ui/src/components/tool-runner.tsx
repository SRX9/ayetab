"use client";

import { useEffect, useCallback, useState } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { executeTool } from "@ayetab/utils";
import { ToolShell } from "./tool-shell";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { SmartPasteBanner } from "./smart-paste-banner";
import { FavoriteButton } from "./favorite-button";
import { useToolState } from "../hooks/use-tool-state";

const MINIFY_TOOLS = new Set(["json-formatter", "html-formatter", "css-formatter", "js-formatter"]);
const GENERATE_TOOLS = new Set(["uuid-generator", "random-string", "lorem-ipsum"]);

interface ToolRunnerProps {
  tool: ToolDefinition;
  initialInput?: string;
  onNavigate?: (tool: ToolDefinition, input: string) => void;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

function getPlaceholder(toolId: string): string {
  switch (toolId) {
    case "regex-tester":
      return "First line: regex pattern\nRemaining lines: test string";
    case "text-diff":
      return "Paste original text, then --- on its own line, then modified text";
    default:
      return "Paste or type your input here...";
  }
}

export function ToolRunner({
  tool,
  initialInput = "",
  onNavigate,
  onRecent,
  isFavorite,
  onToggleFavorite,
  compact,
}: ToolRunnerProps) {
  const { input, setInput, output, error, result, setResult, reset } = useToolState(initialInput);
  const [pastedText, setPastedText] = useState<string | null>(null);

  useEffect(() => {
    onRecent?.(tool.id);
  }, [tool.id, onRecent]);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput, setInput]);

  const run = useCallback(async () => {
    if (!input.trim() && !GENERATE_TOOLS.has(tool.id)) return;
    setResult(await executeTool(tool.id, input));
  }, [tool.id, input, setResult]);

  useEffect(() => {
    const timer = setTimeout(run, 300);
    return () => clearTimeout(timer);
  }, [run]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.trim()) setPastedText(text);
  };

  const rows = compact ? 6 : 8;

  const actions = (
    <>
      {onToggleFavorite && (
        <FavoriteButton active={!!isFavorite} onClick={onToggleFavorite} />
      )}
      {MINIFY_TOOLS.has(tool.id) && (
        <button
          onClick={async () => setResult(await executeTool(tool.id, input, { action: "minify" }))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Minify
        </button>
      )}
      {tool.id === "uuid-generator" && (
        <button
          onClick={async () => setResult(await executeTool(tool.id, "", { count: 5 }))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Generate
        </button>
      )}
      {tool.id === "random-string" && (
        <button
          onClick={async () => setResult(await executeTool(tool.id, "", { length: 32 }))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Generate
        </button>
      )}
      {tool.id === "lorem-ipsum" && (
        <button
          onClick={async () => setResult(await executeTool(tool.id, "", { paragraphs: 3 }))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Generate
        </button>
      )}
      <button
        onClick={reset}
        className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
      >
        Clear
      </button>
    </>
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {pastedText && onNavigate && (
        <SmartPasteBanner
          pastedText={pastedText}
          onAccept={(detectedTool, text) => {
            setPastedText(null);
            if (detectedTool.id !== tool.id) {
              onNavigate(detectedTool, text);
            }
          }}
          onDismiss={() => setPastedText(null)}
        />
      )}
      <InputPanel
        value={input}
        onChange={setInput}
        rows={rows}
        placeholder={getPlaceholder(tool.id)}
        onPaste={handlePaste}
      />
      <OutputPanel value={output} error={error} rows={rows} result={result} />
    </ToolShell>
  );
}
