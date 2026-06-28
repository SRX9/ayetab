"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { searchTools } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";

interface CommandPaletteProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ tools: _tools, onSelect, open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
      if (!value) {
        setQuery("");
        setActiveIndex(0);
      }
    },
    [isControlled, onOpenChange]
  );

  const results = searchTools(query).slice(0, 10);

  useKeyboardShortcut("k", () => setOpen(!open));

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      onSelect(results[activeIndex]!);
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-popover shadow-2xl" data-testid="command-palette">
        <div className="flex items-center border-b border-border px-3">
          <span className="text-muted-foreground text-sm mr-2">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-auto p-1">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No tools found</p>
          ) : (
            results.map((tool, i) => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelect(tool);
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors",
                  i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                <span className="text-sm font-medium">{tool.name}</span>
                <span className="text-xs text-muted-foreground">{tool.description}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
