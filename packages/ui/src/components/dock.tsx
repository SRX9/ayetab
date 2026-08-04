import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { fuzzySearchTools, type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import { BrandMark } from "./brand-mark";
import { SettingsButton } from "./settings-panel";
import { ThemeToggle } from "./theme-toggle";
import { ToolIcon } from "./tool-icon";
import { ToolIconTile } from "./tool-icon-tile";

interface DockProps {
  tools: ToolDefinition[];
  activeToolId?: string;
  onSelectTool: (tool: ToolDefinition) => void;
  /** Real hrefs so middle-click / open-in-new-tab works; plain clicks navigate in-app. */
  toolHref?: (tool: ToolDefinition) => string;
  title?: string;
  onHome?: () => void;
}

const MAX_DOCK_ITEMS = 10;

function isPlainClick(e: React.MouseEvent) {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0;
}

function DockTileButton({
  tool,
  active,
  onClick,
}: {
  tool: ToolDefinition;
  active?: boolean;
  onClick?: (tool: ToolDefinition) => void;
}) {
  return (
    <ToolIconTile tool={tool} size={44} active={active} onClick={onClick} />
  );
}

/**
 * macOS-style bottom launcher. Favorites first, then recents, then top tools.
 * A compact brand tile, search, settings, and theme sit on the trailing edge.
 */
export function Dock({
  tools,
  activeToolId,
  onSelectTool,
  toolHref,
  title = "AyeTab",
  onHome,
}: DockProps) {
  const { prefs } = usePreferences();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const seen = new Set<string>();
    const out: ToolDefinition[] = [];
    const push = (id: string) => {
      if (seen.has(id)) return;
      const tool = tools.find((t) => t.id === id);
      if (tool) {
        seen.add(id);
        out.push(tool);
      }
    };
    prefs.favorites.forEach(push);
    prefs.recents.forEach(push);
    for (const tool of tools) {
      if (out.length >= MAX_DOCK_ITEMS) break;
      push(tool.id);
    }
    return out.slice(0, MAX_DOCK_ITEMS);
  }, [tools, prefs.favorites, prefs.recents]);

  const results = useMemo(
    () =>
      query.trim()
        ? fuzzySearchTools(query.trim(), tools)
            .map((r) => r.tool)
            .slice(0, 7)
        : [],
    [query, tools]
  );

  return (
    <nav aria-label="Dock" className="dock flex items-center gap-1.5">
      <button
        type="button"
        onClick={onHome}
        className={cn("outline-none", FOCUS_RING)}
        title={`${title} home`}
        aria-label={`${title} home`}
      >
        <span className="app-icon" style={{ width: 44, height: 44 }}>
          <BrandMark className="h-6 w-6" size={24} src="/logo-icon.png" />
        </span>
      </button>

      <span className="mx-0.5 h-8 w-px bg-[hsl(var(--border))]" aria-hidden />

      <ul className="flex items-center gap-1">
        {items.map((tool) => {
          const active = tool.id === activeToolId;
          const tile = (
            <span className={cn("app-icon", active && "app-icon-active")} style={{ width: 44, height: 44 }}>
              <ToolIcon name={tool.icon} size={20} />
            </span>
          );
          return (
            <li key={tool.id} className="relative">
              {toolHref ? (
                <a
                  href={toolHref(tool)}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    if (!isPlainClick(e)) return;
                    e.preventDefault();
                    onSelectTool(tool);
                  }}
                  title={tool.name}
                  className={cn("block outline-none", FOCUS_RING)}
                >
                  {tile}
                </a>
              ) : (
                <DockTileButton tool={tool} active={active} onClick={onSelectTool} />
              )}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-[7px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[hsl(var(--brand))]"
                />
              )}
            </li>
          );
        })}
      </ul>

      <span className="mx-0.5 h-8 w-px bg-[hsl(var(--border))]" aria-hidden />

      <div className="relative">
        <div className="field flex h-10 w-44 items-center gap-2 px-2.5 max-sm:w-32">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.75}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search tools"
            className="w-full min-w-0 bg-transparent text-ui outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className={cn("shrink-0 rounded text-muted-foreground hover:text-foreground", FOCUS_RING)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} color="currentColor" />
            </button>
          )}
        </div>
        {query && (
          <div className="menu-surface absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden p-1">
            {results.length === 0 ? (
              <p className="px-2 py-3 text-caption text-muted-foreground">No tools match “{query}”.</p>
            ) : (
              <ul>
                {results.map((tool) => (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTool(tool);
                        setQuery("");
                      }}
                      className="row-idle flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-ui"
                    >
                      <span className="app-icon" style={{ width: 22, height: 22 }}>
                        <ToolIcon name={tool.icon} size={12} />
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <span className="mx-0.5 h-8 w-px bg-[hsl(var(--border))]" aria-hidden />

      <SettingsButton />
      <ThemeToggle />
    </nav>
  );
}
