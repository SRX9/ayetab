"use client";

import { useState, useMemo } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { fuzzySearchTools } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { useCommandPaletteOptional } from "./command-palette-provider";

interface SearchBarProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  tools,
  onSelect,
  placeholder = "Search tools... (⌘K)",
  className,
}: SearchBarProps) {
  const palette = useCommandPaletteOptional();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => fuzzySearchTools(query, tools).slice(0, 8), [query, tools]);

  if (palette) {
    return (
      <button
        type="button"
        onClick={palette.open}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3.5 text-left",
          "shadow-[0_1px_0_hsl(var(--hairline)),0_8px_24px_-12px_hsl(var(--shadow-color)/0.2)]",
          "transition-[transform,box-shadow,background-color,border-color] duration-150 ease-out-strong",
          "active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:border-selection/30 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-card",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection",
          className
        )}
      >
        <svg
          className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-[15px] text-muted-foreground tracking-tight">
          {placeholder.replace(" (⌘K)", "")}
        </span>
        <kbd className="hidden sm:inline-flex text-[11px]">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
        <svg
          className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl material-hud p-1.5">
          {results.map(({ tool }) => (
            <button
              key={tool.id}
              type="button"
              onMouseDown={() => {
                onSelect(tool);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-100 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection-soft"
            >
              <span className="text-sm font-medium">{tool.name}</span>
              <span className="text-xs text-muted-foreground">{tool.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
