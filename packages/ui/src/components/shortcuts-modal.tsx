"use client";

import { useState } from "react";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";
import { Dialog } from "./dialog";
import { Button } from "./button";

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
  return (
    <Dialog open={open} onClose={onClose} labelledBy="shortcuts-title" panelClassName="max-w-sm">
      <div className="rounded-xl border border-border bg-popover p-5 shadow-2xl surface-panel">
        <h2 id="shortcuts-title" className="mb-4 text-sm font-semibold tracking-tight">
          Keyboard Shortcuts
        </h2>
        <ul className="flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="shrink-0">{s.keys}</kbd>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="md" onClick={onClose} className="mt-5 w-full">
          Close
        </Button>
      </div>
    </Dialog>
  );
}

export function useShortcutsModal() {
  const [open, setOpen] = useState(false);
  useKeyboardShortcut("?", () => setOpen((o) => !o), { meta: false });
  return { open, setOpen, close: () => setOpen(false) };
}
