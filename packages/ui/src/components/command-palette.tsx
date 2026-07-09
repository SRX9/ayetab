"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { fuzzySearchTools, CATEGORY_LABELS } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";
import { Dialog } from "./dialog";

interface CommandPaletteProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentIds?: string[];
}

function HighlightedText({ text, indices }: { text: string; indices: number[] }) {
  if (indices.length === 0) return <>{text}</>;

  const indexSet = new Set(indices);
  const parts: React.ReactNode[] = [];
  let buffer = "";

  for (let i = 0; i < text.length; i++) {
    if (indexSet.has(i)) {
      if (buffer) {
        parts.push(buffer);
        buffer = "";
      }
      parts.push(
        <span key={i} className="text-brand font-semibold">
          {text[i]}
        </span>
      );
    } else {
      buffer += text[i];
    }
  }

  if (buffer) parts.push(buffer);
  return <>{parts}</>;
}

export function CommandPalette({
  tools,
  onSelect,
  open: controlledOpen,
  onOpenChange,
  recentIds = [],
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed && recentIds.length > 0) {
      const recentTools = recentIds
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is ToolDefinition => t !== undefined)
        .slice(0, 5);
      return recentTools.map((tool) => ({ tool, score: 0, nameIndices: [] }));
    }
    return fuzzySearchTools(trimmed, tools).slice(0, 12);
  }, [query, tools, recentIds]);

  const showRecents = !query.trim() && recentIds.length > 0;

  // Instant toggle — Emil: never animate keyboard-driven surfaces used 100+/day
  useKeyboardShortcut("k", () => setOpen(!open));

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

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
      onSelect(results[activeIndex]!.tool);
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      placement="top"
      instant
      label="Search tools"
      testId="command-palette"
      panelClassName="max-w-xl mx-auto"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl surface-panel">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-auto p-2">
          {showRecents && (
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Recent
            </p>
          )}
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No tools found</p>
          ) : (
            results.map(({ tool, nameIndices }, i) => (
              <button
                key={tool.id}
                type="button"
                data-active={i === activeIndex}
                onClick={() => {
                  onSelect(tool);
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                  "transition-[background-color,color] duration-100 ease-out-strong",
                  "motion-reduce:transition-none",
                  i === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent/50"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-muted-foreground">
                  {tool.name.charAt(0)}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    <HighlightedText text={tool.name} indices={nameIndices} />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{tool.description}</span>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {CATEGORY_LABELS[tool.category]}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd>↑↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> open
            </span>
          </div>
          <span>
            <kbd>⌘K</kbd> toggle
          </span>
        </div>
      </div>
    </Dialog>
  );
}
