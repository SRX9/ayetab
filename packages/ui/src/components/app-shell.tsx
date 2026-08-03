"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  fuzzySearchTools,
  type ToolDefinition,
} from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import { BrandMark } from "./brand-mark";
import { FadeScroller } from "./fade-scroller";
import { SettingsButton } from "./settings-panel";
import { ThemeToggle } from "./theme-toggle";
import { ToolIcon } from "./tool-icon";

interface AppShellProps {
  tools: ToolDefinition[];
  /** Id of the tool currently open in the content pane, if any. */
  activeToolId?: string;
  onSelectTool: (tool: ToolDefinition) => void;
  /**
   * Real href for each row. Rows render as anchors so middle-click and
   * "open in new tab" work; plain left-clicks are intercepted for in-app
   * navigation. Omit to render plain buttons.
   */
  toolHref?: (tool: ToolDefinition) => string;
  /** Title shown in the mobile top bar. */
  title?: string;
  children: ReactNode;
}

/** A left-click with no modifier — the only case we handle in-app. */
function isPlainClick(e: MouseEvent) {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0;
}

export function AppShell({
  tools,
  activeToolId,
  onSelectTool,
  toolHref,
  title = "AyeTab",
  children,
}: AppShellProps) {
  const { prefs } = usePreferences();
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /*
   * Rows are server-rendered but only navigate once React attaches their
   * handlers. The shell publishes that moment so tests (and anything else
   * driving the page) can wait for it instead of clicking into the void.
   */
  useEffect(() => setHydrated(true), []);

  const favoriteTools = useMemo(
    () => prefs.favorites.flatMap((id) => tools.filter((t) => t.id === id)),
    [prefs.favorites, tools]
  );

  /**
   * Searching replaces the grouped list with a flat result list rather than
   * filtering each group — at 40+ tools, groups that shrink to one row each
   * cost more vertical space than they save in orientation.
   */
  const groups = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed) {
      return [
        {
          id: "results",
          label: "Results",
          tools: fuzzySearchTools(trimmed, tools).map((r) => r.tool),
        },
      ];
    }

    const out: Array<{ id: string; label: string; tools: ToolDefinition[] }> = [];
    if (favoriteTools.length > 0) {
      out.push({ id: "favorites", label: "Favorites", tools: favoriteTools });
    }
    for (const category of ALL_CATEGORIES) {
      const list = tools.filter((t) => t.category === category);
      if (list.length > 0) {
        out.push({ id: category, label: CATEGORY_LABELS[category], tools: list });
      }
    }
    return out;
  }, [query, tools, favoriteTools]);

  const resultCount = groups.reduce((n, g) => n + g.tools.length, 0);

  const handleSelect = useCallback(
    (tool: ToolDefinition) => {
      onSelectTool(tool);
      setNavOpen(false);
    },
    [onSelectTool]
  );

  // Escape closes the mobile drawer and hands focus back to the control that opened it.
  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setNavOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  const sidebar = (
    <>
      <div className="flex items-center gap-1.5 px-3 pt-3">
        <BrandMark className="h-6 w-6" title={title} size={24} src="/logo-icon.png" />
        <span className="min-w-0 flex-1 truncate text-ui-md font-semibold">{title}</span>
        <SettingsButton />
        <ThemeToggle />
      </div>

      <div className="px-2 pt-2">
        <div className="field flex items-center gap-2 px-2 py-1.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.75}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.stopPropagation();
                setQuery("");
              }
              if (e.key === "Enter") {
                const first = groups[0]?.tools[0];
                if (first) handleSelect(first);
              }
            }}
            placeholder="Search tools"
            aria-label="Search tools"
            className="w-full min-w-0 bg-transparent text-ui outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className={cn("shrink-0 rounded text-muted-foreground hover:text-foreground", FOCUS_RING)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={2} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      <FadeScroller as="nav" aria-label="Tools" className="flex-1" scrollerClassName="px-2 py-2">
        {resultCount === 0 ? (
          <p className="px-2 py-6 text-caption text-muted-foreground">No tools match “{query}”.</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="mb-3 last:mb-0">
              <h2 className="px-2 pb-1 text-label font-medium uppercase text-muted-foreground">
                {group.label}
              </h2>
              <ul>
                {group.tools.map((tool) => {
                  const active = tool.id === activeToolId;
                  const rowClass = cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1 text-start text-ui transition-colors",
                    FOCUS_RING,
                    active ? "nav-active" : "row-idle"
                  );
                  const row = (
                    <>
                      <ToolIcon
                        name={tool.icon}
                        className={cn(
                          "h-[15px] w-[15px] shrink-0",
                          !active && "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{tool.name}</span>
                    </>
                  );

                  return (
                    <li key={tool.id}>
                      {toolHref ? (
                        <a
                          href={toolHref(tool)}
                          aria-current={active ? "page" : undefined}
                          onClick={(e) => {
                            if (!isPlainClick(e)) return;
                            e.preventDefault();
                            handleSelect(tool);
                          }}
                          className={rowClass}
                        >
                          {row}
                        </a>
                      ) : (
                        <button
                          type="button"
                          aria-current={active ? "page" : undefined}
                          onClick={() => handleSelect(tool)}
                          className={rowClass}
                        >
                          {row}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </FadeScroller>
    </>
  );

  return (
    <div
      className="app-shell flex h-screen overflow-hidden"
      data-testid="app-shell"
      data-hydrated={hydrated || undefined}
    >
      <aside className="app-sidebar hidden w-[15rem] shrink-0 flex-col md:flex">{sidebar}</aside>

      {navOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="overlay-backdrop absolute inset-0 border-0 bg-[rgba(10,30,55,0.35)] backdrop-blur-md"
            onClick={() => setNavOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Tools"
            className="app-sidebar absolute inset-y-0 start-0 flex w-[16rem] flex-col"
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className="content-pane flex min-w-0 flex-1 flex-col">
        <div className="app-topbar flex shrink-0 items-center gap-2 px-3 py-2 md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded text-muted-foreground row-idle",
              FOCUS_RING
            )}
          >
            <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.75} color="currentColor" />
          </button>
          <BrandMark className="h-6 w-6" title={title} size={24} src="/logo-icon.png" />
          <span className="truncate text-ui-md font-medium">{title}</span>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/**
 * Standard padding for whatever the shell frames. Kept here so the tool pane,
 * the empty state, and any future view share one measure and one gutter.
 */
export function ShellContent({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 py-8 md:px-12 md:py-12",
        wide ? "max-w-5xl" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
