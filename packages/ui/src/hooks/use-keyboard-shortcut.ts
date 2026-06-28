"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { meta?: boolean; ctrl?: boolean; shift?: boolean } = { meta: true }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const metaMatch = options.meta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
      const shiftMatch = options.shift ? e.shiftKey : !e.shiftKey;

      if (e.key.toLowerCase() === key.toLowerCase() && metaMatch && shiftMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.meta, options.shift]);
}
