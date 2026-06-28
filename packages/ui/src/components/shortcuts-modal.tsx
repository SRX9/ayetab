"use client";

import { useEffect, useState } from "react";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";
import { cn } from "../lib/utils";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: "⌘K / Ctrl+K", description: "Open command palette" },
  { keys: "?", description: "Show keyboard shortcuts" },
  { keys: "↑ ↓ Enter", description: "Navigate command palette" },
  { keys: "Esc", description: "Close modal / palette" },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-label="Keyboard shortcuts">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative w-full max-w-sm rounded-lg border border-border bg-popover p-4 shadow-2xl")}>
        <h2 className="text-sm font-semibold mb-3">Keyboard Shortcuts</h2>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="px-1.5 py-0.5 rounded border border-border font-mono text-[10px]">{s.keys}</kbd>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="mt-4 w-full text-xs py-1.5 rounded border border-border hover:bg-accent">
          Close
        </button>
      </div>
    </div>
  );
}

export function useShortcutsModal() {
  const [open, setOpen] = useState(false);
  useKeyboardShortcut("?", () => setOpen((o) => !o), { meta: false });
  return { open, setOpen, close: () => setOpen(false) };
}
