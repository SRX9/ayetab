"use client";

import { useState, useCallback, useRef } from "react";
import type { ToolResult } from "@ayetab/utils";

export function useToolState(initialInput = "") {
  const [input, setInput] = useState(initialInput);
  const [result, setResultState] = useState<ToolResult>({ output: "" });

  const reset = useCallback(() => {
    setInput("");
    setResultState({ output: "" });
  }, []);

  const setResult = useCallback((r: ToolResult) => {
    setResultState(r);
  }, []);

  return {
    input,
    setInput,
    output: result.output,
    error: result.error ?? null,
    result,
    setResult,
    reset,
  };
}
