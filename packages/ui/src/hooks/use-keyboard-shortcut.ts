"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { meta?: boolean; ctrl?: boolean; shift?: boolean } = { meta: true }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in form fields (except Escape-style global shortcuts)
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const metaMatch = options.meta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
      // undefined shift = don't care (needed for "?" which is Shift+/ on US layouts)
      const shiftMatch =
        options.shift === undefined ? true : options.shift ? e.shiftKey : !e.shiftKey;

      if (e.key.toLowerCase() === key.toLowerCase() && metaMatch && shiftMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.meta, options.shift]);
}
