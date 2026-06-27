"use client";

import { useEffect, useCallback, useState } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { executeTool } from "@ayetab/utils";
import { ToolShell } from "./tool-shell";
import { InputPanel } from "./input-panel";
import { OutputPanel } from "./output-panel";
import { SmartPasteBanner } from "./smart-paste-banner";
import { useToolState } from "../hooks/use-tool-state";

interface ToolRunnerProps {
  tool: ToolDefinition;
  initialInput?: string;
  onNavigate?: (tool: ToolDefinition, input: string) => void;
  compact?: boolean;
}

export function ToolRunner({ tool, initialInput = "", onNavigate, compact }: ToolRunnerProps) {
  const { input, setInput, output, error, setResult, reset } = useToolState(initialInput);
  const [pastedText, setPastedText] = useState<string | null>(null);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput, setInput]);

  const run = useCallback(async () => {
    if (!input.trim() && tool.id !== "uuid-generator") return;
    const result = await executeTool(tool.id, input);
    setResult(result);
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
      {tool.id === "json-formatter" && (
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
        placeholder={
          tool.id === "regex-tester"
            ? "First line: regex pattern\nRemaining lines: test string"
            : "Paste or type your input here..."
        }
        onPaste={handlePaste}
      />
      <OutputPanel value={output} error={error} rows={rows} />
    </ToolShell>
  );
}
