"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { ShortcutsContext } from "./shortcuts-context";

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
      <div className="menu-surface overflow-hidden p-5">
        <h2 id="shortcuts-title" className="mb-3 text-subtitle font-semibold">
          Keyboard shortcuts
        </h2>
        <ul className="flex flex-col">
          {SHORTCUTS.map((s) => (
            <li
              key={s.keys}
              className="flex items-center justify-between gap-4 rounded px-2 py-1.5 text-ui row-idle"
            >
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="shrink-0">{s.keys}</kbd>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="md" onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </Dialog>
  );
}

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const toggleShortcuts = useCallback(() => setOpen((o) => !o), []);
  useKeyboardShortcut("?", toggleShortcuts, { meta: false });

  const value = useMemo(
    () => ({ open, setOpen, show, close }),
    [open, show, close]
  );

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <ShortcutsModal open={open} onClose={close} />
    </ShortcutsContext.Provider>
  );
}
