"use client";

import { useEffect, useCallback } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import {
  formatJson,
  minifyJson,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  generateHashes,
  generateUuid,
  convertUnixTime,
  decodeJwt,
  testRegex,
  convertColor,
  autoDetectBase,
  convertCase,
  sortLines,
  dedupeLines,
} from "@ayetab/utils";
import { ToolShell, InputPanel, OutputPanel, useToolState } from "@ayetab/ui";

interface ToolRunnerProps {
  tool: ToolDefinition;
}

export function ToolRunner({ tool }: ToolRunnerProps) {
  const { input, setInput, output, error, setResult, reset } = useToolState();

  const run = useCallback(async () => {
    if (!input.trim()) return;

    let result;
    switch (tool.id) {
      case "json-formatter":
        result = formatJson(input);
        break;
      case "base64":
        result = input.match(/^[A-Za-z0-9+/]+=*$/) ? decodeBase64(input) : encodeBase64(input);
        break;
      case "url-encode":
        result = input.includes("%") ? decodeUrl(input) : encodeUrl(input);
        break;
      case "hash-generator":
        result = await generateHashes(input);
        break;
      case "uuid-generator":
        result = generateUuid(5);
        break;
      case "unix-time":
        result = convertUnixTime(input);
        break;
      case "jwt-debugger":
        result = decodeJwt(input);
        break;
      case "regex-tester": {
        const [pattern, ...rest] = input.split("\n");
        result = testRegex(pattern ?? "", rest.join("\n"));
        break;
      }
      case "color-converter":
        result = convertColor(input);
        break;
      case "number-base":
        result = autoDetectBase(input);
        break;
      case "case-converter":
        result = convertCase(input);
        break;
      case "line-sort":
        result = sortLines(input, { order: "asc", unique: true });
        break;
      default:
        result = { output: "", error: `Tool "${tool.id}" is not yet implemented.` };
    }
    setResult(result);
  }, [tool.id, input, setResult]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) run();
    }, 300);
    return () => clearTimeout(timer);
  }, [input, run]);

  const actions = (
    <>
      {tool.id === "json-formatter" && (
        <button
          onClick={() => setResult(minifyJson(input))}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Minify
        </button>
      )}
      {tool.id === "uuid-generator" && (
        <button
          onClick={() => setResult(generateUuid(5))}
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
      <InputPanel
        value={input}
        onChange={setInput}
        placeholder={
          tool.id === "regex-tester"
            ? "First line: regex pattern\nRemaining lines: test string"
            : "Paste or type your input here..."
        }
      />
      <OutputPanel value={output} error={error} />
    </ToolShell>
  );
}
