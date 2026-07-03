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
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {placeholder.replace(" (⌘K)", "")}
        </span>
        <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className={cn("relative", className)}>
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
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {open && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover shadow-md">
          {results.map(({ tool }) => (
            <button
              key={tool.id}
              onMouseDown={() => {
                onSelect(tool);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
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
