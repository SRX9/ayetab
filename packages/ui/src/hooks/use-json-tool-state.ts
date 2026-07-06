"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useToolState } from "./use-tool-state";

export function parseJsonState<T>(input: string, fallback: T): T {
  if (!input.trim()) return fallback;
  try {
    const data = JSON.parse(input) as T;
    if (data === null || typeof data !== "object") return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export function useJsonToolState<T extends object>(
  toolId: string,
  fallback: T,
  onRecent?: (toolId: string) => void
) {
  const { input, setInput, reset, isHydrated } = useToolState(toolId);

  useEffect(() => {
    onRecent?.(toolId);
  }, [toolId, onRecent]);

  const state = useMemo(() => parseJsonState(input, fallback), [input, fallback]);

  const saveState = useCallback(
    (next: T) => {
      setInput(JSON.stringify(next));
    },
    [setInput]
  );

  const clearState = useCallback(() => {
    reset();
  }, [reset]);

  return { state, saveState, clearState, isHydrated };
}
