"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ToolResult } from "@ayetab/utils";
import { clearToolSession, loadToolSession, saveToolInput } from "../lib/tool-storage";

const SAVE_DEBOUNCE_MS = 500;

export function useToolState(toolId: string, initialInput = "") {
  const [input, setInputState] = useState(initialInput);
  const [result, setResultState] = useState<ToolResult>({ output: "" });
  const [isHydrated, setIsHydrated] = useState(false);
  const skipSaveRef = useRef(true);
  const initialInputRef = useRef(initialInput);

  useEffect(() => {
    initialInputRef.current = initialInput;
  }, [initialInput]);

  useEffect(() => {
    let cancelled = false;
    skipSaveRef.current = true;

    const hydrate = async () => {
      if (initialInputRef.current) {
        if (!cancelled) {
          setInputState(initialInputRef.current);
          setIsHydrated(true);
          skipSaveRef.current = false;
        }
        return;
      }

      const saved = await loadToolSession(toolId);
      if (!cancelled) {
        if (saved?.input) {
          setInputState(saved.input);
        }
        setIsHydrated(true);
        skipSaveRef.current = false;
      }
    };

    setIsHydrated(false);
    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [toolId]);

  useEffect(() => {
    if (!initialInput) return;
    setInputState(initialInput);
  }, [initialInput]);

  useEffect(() => {
    if (!isHydrated || skipSaveRef.current) return;

    const timer = setTimeout(() => {
      if (input.trim()) {
        void saveToolInput(toolId, input);
      } else {
        void clearToolSession(toolId);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [toolId, input, isHydrated]);

  const setInput = useCallback((value: string) => {
    setInputState(value);
  }, []);

  const reset = useCallback(() => {
    setInputState("");
    setResultState({ output: "" });
    void clearToolSession(toolId);
  }, [toolId]);

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
    isHydrated,
  };
}
