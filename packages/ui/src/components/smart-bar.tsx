"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Globe02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { fuzzySearchTools, type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import { ToolIcon } from "./tool-icon";

interface SmartBarProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
  autoFocus?: boolean;
}

interface Engine {
  id: string;
  name: string;
  /** Query URL; `{q}` is replaced with the encoded query. */
  url: string;
  /** Brand colour for the badge glyph. */
  color: string;
  /** Single letter shown on the badge. */
  glyph: string;
}

const ENGINES: Engine[] = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q={q}", color: "#4285F4", glyph: "G" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q={q}", color: "#0C8484", glyph: "b" },
  { id: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai/search?q={q}", color: "#1FB8CD", glyph: "P" },
];

type Item =
  | { type: "tool"; tool: ToolDefinition }
  | { type: "engine"; engine: Engine };

/**
 * One smart bar for everything. Type to filter tools — arrows navigate, Enter
 * opens. Pick a search engine (or keep typing past the tools) and it locks as
 * a badge; Enter then opens a new tab with the query on that engine. Escape or
 * Backspace on an empty bar backs out of engine mode.
 */
export function SmartBar({ tools, onOpenTool, autoFocus = true }: SmartBarProps) {
  const { prefs } = usePreferences();
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState<Engine | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const trimmed = query.trim();

  const toolMatches = useMemo(() => {
    if (!trimmed) {
      return prefs.recents
        .flatMap((id) => tools.filter((t) => t.id === id))
        .slice(0, 6);
    }
    return fuzzySearchTools(trimmed, tools).map((r) => r.tool).slice(0, 8);
  }, [trimmed, tools, prefs.recents]);

  const items = useMemo<Item[]>(() => {
    if (engine) return [];
    const toolItems: Item[] = toolMatches.map((tool) => ({ type: "tool", tool }));
    if (!trimmed) return toolItems;
    const engineItems: Item[] = ENGINES.map((engine) => ({ type: "engine", engine }));
    return [...toolItems, ...engineItems];
  }, [engine, toolMatches, trimmed]);

  /* Keep the list open whenever there's something to show — typing or focus
     opens it; selecting a tool or engine, or clearing the bar, closes it. */
  const showList = open && !engine && items.length > 0;

  useEffect(() => setActive(0), [trimmed]);

  const pickEngine = useCallback((e: Engine) => {
    setEngine(e);
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  }, []);

  const launchEngine = useCallback(() => {
    if (!engine) return;
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    const url = engine.url.replace("{q}", encodeURIComponent(q));
    window.open(url, "_blank", "noopener,noreferrer");
  }, [engine, query]);

  const runItem = useCallback(
    (item: Item) => {
      if (item.type === "tool") {
        onOpenTool(item.tool);
        setQuery("");
        setOpen(false);
      } else {
        pickEngine(item.engine);
      }
    },
    [onOpenTool, pickEngine]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (engine) {
        setEngine(null);
        setQuery("");
      } else {
        setOpen(false);
        setQuery("");
      }
      return;
    }
    if (e.key === "Backspace" && engine && query === "") {
      setEngine(null);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (engine) {
        launchEngine();
      } else if (items[active]) {
        runItem(items[active]);
      }
      return;
    }
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
  };

  useEffect(() => {
    listRef.current?.querySelector("[data-active='true']")?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "field flex h-14 items-center gap-3 px-4 transition-shadow",
          showList && "border-[hsl(var(--ring))] shadow-[0_0_0_3px_hsl(var(--selection-soft))]"
        )}
      >
        {engine ? (
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
            style={{ background: engine.color }}
          >
            {engine.glyph}
          </span>
        ) : (
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.75}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={
            engine ? `Search ${engine.name}…` : "Search tools, or the web…"
          }
          aria-label={engine ? `Search ${engine.name}` : "Search tools or the web"}
          className="w-full min-w-0 bg-transparent text-ui-lg outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          spellCheck={false}
        />
        {engine && (
          <button
            type="button"
            onClick={launchEngine}
            aria-label={`Search ${engine.name}`}
            className={cn("btn-liquid-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white", FOCUS_RING)}
          >
            <HugeiconsIcon icon={ArrowRight02Icon} size={15} strokeWidth={2} color="currentColor" />
          </button>
        )}
      </div>

      {showList && (
        <div ref={listRef} className="menu-surface absolute inset-x-0 top-full z-50 mt-2 overflow-hidden p-1">
          {!trimmed && (
            <p className="px-2.5 pb-1 pt-2 text-label font-medium uppercase text-muted-foreground">
              Recent
            </p>
          )}
          {trimmed && toolMatches.length > 0 && (
            <p className="px-2.5 pb-1 pt-2 text-label font-medium uppercase text-muted-foreground">
              Tools
            </p>
          )}
          <ul role="listbox" aria-label="Suggestions">
            {items.map((item, i) => {
              const isActive = i === active;
              if (item.type === "tool") {
                const { tool } = item;
                return (
                  <li key={tool.id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      data-active={isActive || undefined}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => runItem(item)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left",
                        isActive ? "row-selected" : "text-foreground"
                      )}
                    >
                      <span className="app-icon" style={{ width: 24, height: 24 }}>
                        <ToolIcon name={tool.icon} size={13} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ui-md font-medium">{tool.name}</span>
                      <span className="shrink-0 text-caption text-muted-foreground">Open</span>
                    </button>
                  </li>
                );
              }
              const { engine: eng } = item;
              return (
                <li key={eng.id} role="option" aria-selected={isActive}>
                  {i === toolMatches.length && (
                    <p className="px-2.5 pb-1 pt-2 text-label font-medium uppercase text-muted-foreground">
                      Web
                    </p>
                  )}
                  <button
                    type="button"
                    data-active={isActive || undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left",
                      isActive ? "row-selected" : "text-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold text-white"
                      style={{ background: eng.color }}
                    >
                      {eng.glyph}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ui-md font-medium">
                      Search {eng.name}
                    </span>
                    <HugeiconsIcon
                      icon={Globe02Icon}
                      size={13}
                      strokeWidth={1.75}
                      color="currentColor"
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
