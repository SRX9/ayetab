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
import { loadToolSession, saveToolOptions } from "../lib/tool-storage";

const MINIFY_TOOLS = new Set([
  "json-formatter",
  "html-formatter",
  "css-formatter",
  "js-formatter",
  "xml-formatter",
  "erb-formatter",
  "less-formatter",
  "scss-formatter",
]);

const GENERATE_TOOLS = new Set([
  "uuid-generator",
  "random-string",
  "lorem-ipsum",
  "ulid-generator",
  "qr-code",
]);

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
    case "curl-code":
      return 'curl -X POST "https://api.example.com" -H "Content-Type: application/json" -d \'{"key":"value"}\'';
    case "cert-decoder":
      return "Paste PEM-encoded certificate (-----BEGIN CERTIFICATE-----...)";
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
  const { input, setInput, output, error, result, setResult, reset, isHydrated } = useToolState(
    tool.id,
    initialInput
  );
  const [pastedText, setPastedText] = useState<string | null>(null);
  const [curlLang, setCurlLang] = useState<"fetch" | "python">("fetch");
  const [codeLang, setCodeLang] = useState<"typescript" | "go">("typescript");
  const [optionsHydrated, setOptionsHydrated] = useState(tool.id !== "curl-code" && tool.id !== "json-to-code");

  useEffect(() => {
    onRecent?.(tool.id);
  }, [tool.id, onRecent]);

  useEffect(() => {
    let cancelled = false;
    const hasOptions = tool.id === "curl-code" || tool.id === "json-to-code";
    if (hasOptions) setOptionsHydrated(false);

    void loadToolSession(tool.id).then((session) => {
      if (cancelled) return;
      if (session?.options) {
        if (session.options.curlLang === "fetch" || session.options.curlLang === "python") {
          setCurlLang(session.options.curlLang);
        }
        if (session.options.codeLang === "typescript" || session.options.codeLang === "go") {
          setCodeLang(session.options.codeLang);
        }
      }
      if (hasOptions) setOptionsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [tool.id]);

  useEffect(() => {
    if (!isHydrated || !optionsHydrated) return;
    if (tool.id !== "curl-code" && tool.id !== "json-to-code") return;

    const options: Record<string, unknown> = {};
    if (tool.id === "curl-code") options.curlLang = curlLang;
    if (tool.id === "json-to-code") options.codeLang = codeLang;
    void saveToolOptions(tool.id, options);
  }, [tool.id, curlLang, codeLang, isHydrated, optionsHydrated]);

  const run = useCallback(async () => {
    if (!input.trim() && !GENERATE_TOOLS.has(tool.id)) return;
    const options: Record<string, unknown> = {};
    if (tool.id === "curl-code") options.lang = curlLang;
    if (tool.id === "json-to-code") options.lang = codeLang;
    try {
      setResult(await executeTool(tool.id, input, options));
    } catch (e) {
      setResult({ output: "", error: (e as Error).message });
    }
  }, [tool.id, input, setResult, curlLang, codeLang]);

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
      {onToggleFavorite && <FavoriteButton active={!!isFavorite} onClick={onToggleFavorite} />}
      {tool.id === "curl-code" && (
        <>
          <button
            onClick={() => setCurlLang("fetch")}
            className={`text-xs px-2 py-1 rounded border ${curlLang === "fetch" ? "bg-accent" : "border-border"}`}
          >
            fetch
          </button>
          <button
            onClick={() => setCurlLang("python")}
            className={`text-xs px-2 py-1 rounded border ${curlLang === "python" ? "bg-accent" : "border-border"}`}
          >
            Python
          </button>
        </>
      )}
      {tool.id === "json-to-code" && (
        <>
          <button
            onClick={() => setCodeLang("typescript")}
            className={`text-xs px-2 py-1 rounded border ${codeLang === "typescript" ? "bg-accent" : "border-border"}`}
          >
            TS
          </button>
          <button
            onClick={() => setCodeLang("go")}
            className={`text-xs px-2 py-1 rounded border ${codeLang === "go" ? "bg-accent" : "border-border"}`}
          >
            Go
          </button>
        </>
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
      {(tool.id === "random-string" || tool.id === "ulid-generator") && (
        <button
          onClick={async () =>
            setResult(
              await executeTool(tool.id, "", tool.id === "ulid-generator" ? { action: "generate" } : { length: 32 })
            )
          }
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
      {tool.id === "qr-code" && (
        <button
          onClick={async () => setResult(await executeTool(tool.id, input || "https://ayetab.dev"))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Generate QR
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
            if (detectedTool.id !== tool.id) onNavigate(detectedTool, text);
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
        allowUpload={tool.id !== "qr-code"}
        autoFocus={isHydrated}
        focusKey={tool.id}
      />
      <OutputPanel value={output} error={error} rows={rows} result={result} />
    </ToolShell>
  );
}
