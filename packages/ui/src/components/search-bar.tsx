"use client";

import { useState, useMemo, useCallback } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { fuzzySearchTools } from "@ayetab/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { useCommandPaletteOptional } from "../hooks/use-command-palette";

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
  const [active, setActive] = useState(0);

  const results = useMemo(() => fuzzySearchTools(query, tools).slice(0, 8), [query, tools]);
  const isOpen = open && query.length > 0 && results.length > 0;

  const choose = useCallback(
    (tool: ToolDefinition) => {
      onSelect(tool);
      setQuery("");
      setOpen(false);
      setActive(0);
    },
    [onSelect]
  );

  if (palette) {
    return (
      <button
        type="button"
        onClick={palette.open}
        className={cn(
          "field group flex w-full items-center gap-2 px-3 py-2 text-start transition-colors",
          "hover:bg-[hsl(var(--hover-fill))]",
          FOCUS_RING,
          className
        )}
      >
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          strokeWidth={1.75}
          color="currentColor"
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="flex-1 text-ui text-muted-foreground">
          {placeholder.replace(" (⌘K)", "")}
        </span>
        <kbd className="hidden sm:inline-flex">⌘K</kbd>
      </button>
    );
  }

  const listboxId = "tool-search-results";

  return (
    <div className={cn("relative", className)}>
      <div className="field flex items-center gap-2 px-3 py-2">
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          strokeWidth={1.75}
          color="currentColor"
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!isOpen) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              const hit = results[active];
              if (!hit) return;
              e.preventDefault();
              choose(hit.tool);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen ? `${listboxId}-${active}` : undefined}
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-ui"
        />
      </div>
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="menu-surface absolute inset-x-0 top-full z-50 mt-1 overflow-hidden p-1"
        >
          {results.map(({ tool }, i) => (
            <button
              key={tool.id}
              id={`${listboxId}-${i}`}
              role="option"
              aria-selected={i === active}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseDown={() => choose(tool)}
              className={cn(
                "flex w-full flex-col gap-0.5 rounded px-2.5 py-1.5 text-start transition-colors duration-100",
                i === active && "row-selected"
              )}
            >
              <span className="text-ui-md font-medium">{tool.name}</span>
              <span className="text-caption text-muted-foreground">{tool.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
