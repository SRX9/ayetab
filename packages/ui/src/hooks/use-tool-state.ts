"use client";

import { useState, useCallback } from "react";

export function useToolState(initialInput = "") {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const setResult = useCallback((result: { output: string; error?: string }) => {
    setOutput(result.output);
    setError(result.error ?? null);
  }, []);

  return { input, setInput, output, setOutput, error, setError, reset, setResult };
}
