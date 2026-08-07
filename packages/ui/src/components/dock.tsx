import { useMemo } from "react";
import { type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import { BrandMark } from "./brand-mark";
import { SettingsButton } from "./settings-panel";
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
 * macOS-style bottom launcher. Favorites first, then recents, then top tools,
 * with a compact brand tile and settings on the edges.
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

      <SettingsButton />
    </nav>
  );
}
