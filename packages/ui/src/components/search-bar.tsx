"use client";

import { useState, useMemo } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { searchTools } from "@ayetab/utils";
import { cn } from "../lib/utils";

interface SearchBarProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  tools: _tools,
  onSelect,
  placeholder = "Search tools... (⌘K)",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchTools(query).slice(0, 8), [query]);

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
          {results.map((tool) => (
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
