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
  { keys: "⌘K", description: "Open command palette" },
  { keys: "↑ ↓", description: "Move through tool list" },
  { keys: "↵", description: "Open selected tool" },
  { keys: "?", description: "Show keyboard shortcuts" },
  { keys: "Esc", description: "Close palette / modal" },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="shortcuts-title" panelClassName="max-w-sm">
      <div className="overflow-hidden rounded-[18px] material-hud p-5">
        <h2 id="shortcuts-title" className="mb-4 text-[15px] font-semibold tracking-tight">
          Keyboard Shortcuts
        </h2>
        <ul className="flex flex-col gap-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.keys}
              className="flex items-center justify-between gap-4 rounded-[10px] px-2 py-1.5 text-[13px]"
            >
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="shrink-0">{s.keys}</kbd>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="md" onClick={onClose} className="mt-5 w-full rounded-xl">
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
