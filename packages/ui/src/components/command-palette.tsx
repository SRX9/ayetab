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

function HighlightedText({
  text,
  indices,
  inverted = false,
}: {
  text: string;
  indices: number[];
  inverted?: boolean;
}) {
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
        <span
          key={i}
          className={cn(
            "font-semibold",
            inverted ? "text-white underline decoration-white/50 underline-offset-2" : "text-selection"
          )}
        >
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
        .slice(0, 6);
      return recentTools.map((tool) => ({ tool, score: 0, nameIndices: [] as number[] }));
    }
    if (!trimmed) {
      return tools.slice(0, 8).map((tool) => ({ tool, score: 0, nameIndices: [] as number[] }));
    }
    return fuzzySearchTools(trimmed, tools).slice(0, 12);
  }, [query, tools, recentIds]);

  const showRecents = !query.trim() && recentIds.length > 0;
  const showSuggestions = !query.trim() && recentIds.length === 0;

  // Instant — Raycast/Emil: never animate ⌘K
  useKeyboardShortcut("k", () => setOpen(!open));

  useEffect(() => {
    if (open) inputRef.current?.focus();
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
      panelClassName="max-w-[640px] mx-auto"
    >
      <div className="overflow-hidden rounded-[18px] material-hud">
        <div className="flex items-center gap-3 border-b border-border/50 px-4">
          <svg
            className="h-5 w-5 shrink-0 text-muted-foreground"
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
            className="flex-1 bg-transparent py-[18px] text-[17px] tracking-tight outline-none placeholder:text-muted-foreground/70"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[min(420px,52vh)] overflow-auto p-2">
          {(showRecents || showSuggestions) && (
            <p className="px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
              {showRecents ? "Recent" : "Suggested"}
            </p>
          )}
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">No tools found</p>
          ) : (
            results.map(({ tool, nameIndices }, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={tool.id}
                  type="button"
                  data-active={isActive}
                  onClick={() => {
                    onSelect(tool);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left",
                    "transition-[background-color,color] duration-75 ease-out-strong motion-reduce:transition-none",
                    isActive ? "row-selected" : "row-idle"
                  )}
                >
                  <div
                    className={cn(
                      "row-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border text-xs font-semibold",
                      isActive
                        ? "border-white/20 bg-white/15"
                        : "border-border/70 bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {tool.name.charAt(0)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[13px] font-medium tracking-tight">
                      <HighlightedText text={tool.name} indices={nameIndices} inverted={isActive} />
                    </span>
                    <span className={cn("row-desc truncate text-xs", !isActive && "text-muted-foreground")}>
                      {tool.description}
                    </span>
                  </div>
                  <span className={cn("row-meta shrink-0 text-[11px]", !isActive && "text-muted-foreground/80")}>
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                  {isActive && (
                    <kbd className="row-meta shrink-0 border-white/25 bg-white/15 text-white">↵</kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd>↵</kbd>
              <span>open</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
            <span>to toggle</span>
          </span>
        </div>
      </div>
    </Dialog>
  );
}
