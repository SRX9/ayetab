"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { fuzzySearchTools, CATEGORY_LABELS } from "@ayetab/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "../lib/utils";
import { useKeyboardShortcut } from "../hooks/use-keyboard-shortcut";
import { Dialog } from "./dialog";
import { ToolIcon } from "./tool-icon";

interface CommandPaletteProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentIds?: string[];
}

const EMPTY_RECENT_IDS: string[] = [];

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
  const segments: Array<{ start: number; text: string; highlight: boolean }> = [];
  let start = 0;
  let highlight = indexSet.has(0);

  for (let i = 1; i <= text.length; i++) {
    const nextHighlight = i < text.length ? indexSet.has(i) : !highlight;
    if (i === text.length || nextHighlight !== highlight) {
      segments.push({ start, text: text.slice(start, i), highlight });
      start = i;
      highlight = nextHighlight;
    }
  }

  return (
    <>
      {segments.map((seg) =>
        seg.highlight ? (
          <span
            key={`h-${seg.start}-${seg.text}`}
            className={cn(
              "font-semibold",
              inverted ? "text-white underline decoration-white/50 underline-offset-2" : "text-selection"
            )}
          >
            {seg.text}
          </span>
        ) : (
          <span key={`t-${seg.start}-${seg.text}`}>{seg.text}</span>
        )
      )}
    </>
  );
}

export function CommandPalette({
  tools,
  onSelect,
  open: controlledOpen,
  onOpenChange,
  recentIds = EMPTY_RECENT_IDS,
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
      return recentIds
        .flatMap((id) => {
          const tool = tools.find((t) => t.id === id);
          return tool ? [{ tool, score: 0, nameIndices: [] as number[] }] : [];
        })
        .slice(0, 6);
    }
    if (!trimmed) {
      return tools.slice(0, 8).map((tool) => ({ tool, score: 0, nameIndices: [] as number[] }));
    }
    return fuzzySearchTools(trimmed, tools).slice(0, 12);
  }, [query, tools, recentIds]);

  const showRecents = !query.trim() && recentIds.length > 0;
  const showSuggestions = !query.trim() && recentIds.length === 0;

  // Instant — Raycast/Emil: never animate ⌘K
  const togglePalette = useCallback(() => setOpen((current) => !current), [setOpen]);
  useKeyboardShortcut("k", togglePalette);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const scrollActiveIntoView = () => {
    requestAnimationFrame(() => {
      listRef.current?.querySelector("[data-active='true']")?.scrollIntoView({ block: "nearest" });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      scrollActiveIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      scrollActiveIntoView();
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
      <div className="overflow-hidden rounded-[22px] material-hud">
        <div className="flex items-center gap-3 border-b border-white/15 px-4 py-3.5 dark:border-white/10">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.75}
            color="currentColor"
            className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className="w-full bg-transparent text-[17px] tracking-tight outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div ref={listRef} className="max-h-[min(420px,60vh)] overflow-auto p-1.5" role="listbox">
          {showRecents && (
            <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Recent
            </p>
          )}
          {showSuggestions && (
            <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Suggested
            </p>
          )}
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No tools found</p>
          ) : (
            results.map(({ tool, nameIndices }, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active || undefined}
                  onClick={() => {
                    onSelect(tool);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left",
                    "transition-[background-color,color] duration-75 ease-out-strong motion-reduce:transition-none",
                    active ? "bg-selection text-selection-foreground" : "text-foreground"
                  )}
                >
                  <ToolIcon
                    name={tool.icon}
                    className={cn("h-[18px] w-[18px]", active ? "text-white" : "text-muted-foreground")}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium tracking-tight">
                      <HighlightedText text={tool.name} indices={nameIndices} inverted={active} />
                    </p>
                    <p
                      className={cn(
                        "truncate text-[12px]",
                        active ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      {CATEGORY_LABELS[tool.category]}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
