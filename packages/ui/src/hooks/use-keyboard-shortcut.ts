"use client";

import { useEffect, useEffectEvent } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { meta?: boolean; ctrl?: boolean; shift?: boolean } = { meta: true }
) {
  const onShortcut = useEffectEvent(callback);
  const meta = options.meta ?? true;
  const shift = options.shift;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const metaMatch = meta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
      const shiftMatch = shift === undefined ? true : shift ? e.shiftKey : !e.shiftKey;

      if (e.key.toLowerCase() === key.toLowerCase() && metaMatch && shiftMatch) {
        e.preventDefault();
        onShortcut();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, meta, shift]);
}
