"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Clock01Icon,
  DragDropIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { fuzzySearchTools, type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import { ToolIcon } from "./tool-icon";

export interface WidgetEntry {
  /** Tool id, or a live widget id like `live:clock`. */
  id: string;
  /** Live widgets render their own surface instead of a tool launcher. */
  kind?: "tool" | "live";
}

interface WidgetGridProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
}

const MAX_WIDGETS = 12;

/**
 * Personal-tab widget surface. A loose grid of glass cards — favorites, then
 * recents, then popular tools — plus optional live widgets (clock). Cards
 * reorder by dragging their grip, or with the arrow keys for keyboard users.
 */
export function WidgetGrid({ tools, onOpenTool }: WidgetGridProps) {
  const { prefs, toggleFavorite, isFavorite } = usePreferences();
  const [layout, setLayout] = useState<WidgetEntry[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const defaultLayout = useMemo<WidgetEntry[]>(() => {
    const seen = new Set<string>();
    const out: WidgetEntry[] = [];
    const push = (id: string) => {
      if (seen.has(id) || !tools.some((t) => t.id === id)) return;
      seen.add(id);
      out.push({ id, kind: "tool" });
    };
    prefs.favorites.forEach(push);
    prefs.recents.forEach(push);
    for (const tool of tools) {
      if (out.length >= MAX_WIDGETS - 1) break;
      push(tool.id);
    }
    return [{ id: "live:clock", kind: "live" }, ...out];
  }, [tools, prefs.favorites, prefs.recents]);

  const entries = layout ?? defaultLayout;

  const resolve = useCallback(
    (entry: WidgetEntry): ToolDefinition | null =>
      entry.kind === "live" ? null : tools.find((t) => t.id === entry.id) ?? null,
    [tools]
  );

  const persist = useCallback((next: WidgetEntry[]) => setLayout(next), []);

  const move = useCallback(
    (from: string, to: string) => {
      const fromIdx = entries.findIndex((e) => e.id === from);
      const toIdx = entries.findIndex((e) => e.id === to);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
      const next = [...entries];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      persist(next);
    },
    [entries, persist]
  );

  const moveBy = useCallback(
    (id: string, dir: -1 | 1) => {
      const idx = entries.findIndex((e) => e.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= entries.length) return;
      const next = [...entries];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      persist(next);
    },
    [entries, persist]
  );

  const remove = useCallback(
    (id: string) => persist(entries.filter((e) => e.id !== id)),
    [entries, persist]
  );

  const addTool = useCallback(
    (tool: ToolDefinition) => {
      if (entries.some((e) => e.id === tool.id)) return;
      persist([...entries, { id: tool.id, kind: "tool" }]);
      setAdding(false);
      setAddQuery("");
    },
    [entries, persist]
  );

  const addResults = useMemo(
    () =>
      addQuery.trim()
        ? fuzzySearchTools(addQuery.trim(), tools)
            .map((r) => r.tool)
            .filter((t) => !entries.some((e) => e.id === t.id))
            .slice(0, 8)
        : tools.filter((t) => !entries.some((e) => e.id === t.id)).slice(0, 8),
    [addQuery, tools, entries]
  );

  const onDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== overId) setOverId(id);
  };
  const onDrop = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (dragId && dragId !== id) move(dragId, id);
    setDragId(null);
    setOverId(null);
  };
  const onDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <section aria-label="Your tools">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-subtitle text-foreground">Your space</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={cn("chip px-3 py-1.5 text-caption font-medium text-muted-foreground transition-colors hover:text-foreground", FOCUS_RING)}
            aria-pressed={editing}
          >
            {editing ? "Done" : "Arrange"}
          </button>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className={cn("chip px-3 py-1.5 text-caption font-medium text-[hsl(var(--brand))] transition-colors", FOCUS_RING)}
            aria-expanded={adding}
          >
            + Add tool
          </button>
        </div>
      </div>

      {adding && (
        <div className="menu-surface mb-4 p-2">
          <input
            type="search"
            autoFocus
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            placeholder="Add a tool to your space…"
            aria-label="Search tools to add"
            className="field w-full px-3 py-2 text-ui outline-none"
          />
          <ul className="mt-2 grid max-h-56 grid-cols-1 gap-0.5 overflow-auto ds-scroll sm:grid-cols-2">
            {addResults.map((tool) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => addTool(tool)}
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
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => {
          const tool = resolve(entry);
          const dragging = dragId === entry.id;
          const over = overId === entry.id && dragId !== entry.id;
          return (
            <li
              key={entry.id}
              onDragOver={(e) => onDragOver(e, entry.id)}
              onDrop={(e) => onDrop(e, entry.id)}
              className={cn(
                "widget group relative p-3",
                dragging && "opacity-40",
                over && "ring-2 ring-[hsl(var(--brand)/0.5)]"
              )}
            >
              {editing && (
                <div className="absolute end-2 top-2 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${tool?.name ?? "widget"} up`}
                    onClick={() => moveBy(entry.id, -1)}
                    className="chip flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} size={12} strokeWidth={2} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${tool?.name ?? "widget"} down`}
                    onClick={() => moveBy(entry.id, 1)}
                    className="chip flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={2} color="currentColor" />
                  </button>
                  {entry.kind !== "live" && (
                    <button
                      type="button"
                      aria-label={`Remove ${tool?.name}`}
                      onClick={() => remove(entry.id)}
                      className="chip flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-[hsl(var(--destructive))]"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} color="currentColor" />
                    </button>
                  )}
                </div>
              )}

              {entry.kind === "live" ? (
                <ClockWidget />
              ) : tool ? (
                <ToolWidget
                  tool={tool}
                  editing={editing}
                  isFavorite={isFavorite(tool.id)}
                  onOpen={() => onOpenTool(tool)}
                  onToggleFavorite={() => toggleFavorite(tool.id)}
                  onDragStart={(e) => onDragStart(e, entry.id)}
                  onDragEnd={onDragEnd}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ToolWidget({
  tool,
  editing,
  isFavorite,
  onOpen,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
}: {
  tool: ToolDefinition;
  editing: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div
        draggable={editing}
        onDragStart={editing ? onDragStart : undefined}
        onDragEnd={editing ? onDragEnd : undefined}
        className={cn("flex items-center gap-2", editing && "cursor-grab active:cursor-grabbing")}
        title={editing ? "Drag to reorder" : undefined}
      >
        <button
          type="button"
          onClick={onOpen}
          className={cn("flex min-w-0 flex-1 items-center gap-2 text-start outline-none", FOCUS_RING)}
        >
          <span className="app-icon" style={{ width: 34, height: 34 }}>
            <ToolIcon name={tool.icon} size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-ui font-medium text-foreground">
            {tool.name}
          </span>
        </button>
        {editing ? (
          <HugeiconsIcon icon={DragDropIcon} size={14} strokeWidth={1.75} color="currentColor" className="shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
            className={cn(
              "chip flex h-6 w-6 items-center justify-center",
              isFavorite ? "text-[hsl(var(--favorite))]" : "text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
          >
            <HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} color="currentColor" />
          </button>
        )}
      </div>
      <p className="line-clamp-2 text-caption text-muted-foreground">{tool.description}</p>
    </div>
  );
}

/** Live clock widget — one calm surface, no chrome. */
function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col justify-center gap-1 py-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={Clock01Icon} size={13} strokeWidth={1.75} color="currentColor" aria-hidden />
        <span className="text-label uppercase">Now</span>
      </div>
      <div className="text-title font-semibold tabular-nums text-foreground">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-caption text-muted-foreground">
        {now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}
