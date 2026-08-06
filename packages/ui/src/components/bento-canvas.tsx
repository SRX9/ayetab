"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDiagonalIcon,
  Cancel01Icon,
  Clock01Icon,
  DragDropIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { fuzzySearchTools, type ToolDefinition } from "@ayetab/utils";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";
import { usePreferences } from "../hooks/use-preferences";
import type { BentoTile } from "../lib/preferences";
import { ToolIcon } from "./tool-icon";

/* Canvas is 12 columns; row height is fixed, tiles snap to it. */
const COLS = 12;
const ROW_PX = 84;
const GAP_PX = 12;

interface BentoCanvasProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
}

/**
 * A free-form bento canvas. Tiles are glass cards laid out on a 12-col grid
 * that you drag anywhere, stretch from the corner, or collapse to a chip —
 * the macOS dashboard feel rather than a fixed grid. Layout persists.
 */
export function BentoCanvas({ tools, onOpenTool }: BentoCanvasProps) {
  const { prefs, updateBento, toggleFavorite, isFavorite } = usePreferences();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);

  const defaultTiles = useMemo<BentoTile[]>(() => {
    const seen = new Set<string>();
    const toolTiles: BentoTile[] = [];
    const push = (id: string, w = 3, h = 1) => {
      if (seen.has(id) || !tools.some((t) => t.id === id)) return;
      seen.add(id);
      toolTiles.push({ id, kind: "tool", x: 0, y: 0, w, h });
    };
    prefs.favorites.forEach((id) => push(id, 3, 1));
    prefs.recents.forEach((id) => push(id, 3, 1));
    for (const t of tools) {
      if (toolTiles.length >= 8) break;
      push(t.id, 3, 1);
    }
    return packTiles([
      { id: "live:clock", kind: "live", x: 0, y: 0, w: 6, h: 2 },
      ...toolTiles,
    ]);
  }, [tools, prefs.favorites, prefs.recents]);

  const tiles = prefs.bento ?? defaultTiles;

  const commit = useCallback(
    (next: BentoTile[]) => void updateBento(next),
    [updateBento]
  );

  const resolve = useCallback(
    (tile: BentoTile): ToolDefinition | null =>
      tile.kind === "live" ? null : tools.find((t) => t.id === tile.id) ?? null,
    [tools]
  );

  const update = useCallback(
    (id: string, patch: Partial<BentoTile>) =>
      commit(tiles.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    [tiles, commit]
  );

  const remove = useCallback((id: string) => commit(tiles.filter((t) => t.id !== id)), [tiles, commit]);

  const addTool = useCallback(
    (tool: ToolDefinition) => {
      if (tiles.some((t) => t.id === tool.id)) return;
      const spot = findSpot(tiles, 3, 1);
      commit([...tiles, { id: tool.id, kind: "tool", ...spot, w: 3, h: 1 }]);
      setAdding(false);
      setAddQuery("");
    },
    [tiles, commit]
  );

  const addResults = useMemo(() => {
    const q = addQuery.trim();
    const list = q ? fuzzySearchTools(q, tools).map((r) => r.tool) : tools;
    const out: ToolDefinition[] = [];
    const have = new Set(tiles.map((t) => t.id));
    for (const t of list) {
      if (out.length >= 8) break;
      if (!have.has(t.id)) out.push(t);
    }
    return out;
  }, [addQuery, tools, tiles]);

  /* ---- Drag-to-move + corner resize, all on Pointer Events ---- */
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);
  const [ghost, setGhost] = useState<BentoTile | null>(null);

  const cellW = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return 0;
    return (el.clientWidth - GAP_PX * (COLS - 1)) / COLS;
  }, []);

  const beginDrag = useCallback(
    (e: ReactPointerEvent, tile: BentoTile, mode: "move" | "resize") => {
      if (!editing) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        id: tile.id,
        mode,
        startX: e.clientX,
        startY: e.clientY,
        origX: tile.x,
        origY: tile.y,
        origW: tile.w,
        origH: tile.h,
      };
      setGhost(tile);
    },
    [editing]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const cw = cellW() + GAP_PX;
      const rh = ROW_PX + GAP_PX;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const current = tiles.find((t) => t.id === d.id);
      if (!current) return;
      if (d.mode === "move") {
        const nx = clamp(Math.round((d.origX * cw + dx) / cw), 0, COLS - current.w);
        const ny = Math.max(0, Math.round((d.origY * rh + dy) / rh));
        setGhost({ ...current, x: nx, y: ny });
      } else {
        const nw = clamp(d.origW + Math.round(dx / cw), 1, COLS - d.origX);
        const nh = clamp(d.origH + Math.round(dy / rh), 1, 4);
        setGhost({ ...current, w: nw, h: nh });
      }
    },
    [cellW, tiles]
  );

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && ghost) commit(tiles.map((t) => (t.id === ghost.id ? ghost : t)));
    setGhost(null);
  }, [ghost, tiles, commit]);

  const maxRow = useMemo(() => tiles.reduce((m, t) => Math.max(m, t.y + t.h), 1), [tiles]);
  const canvasH = maxRow * (ROW_PX + GAP_PX);

  return (
    <section aria-label="Your space">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-subtitle text-foreground">Your space</h2>
        <div className="flex items-center gap-1.5">
          {editing && (
            <button
              type="button"
              onClick={() => commit(packTiles(tiles))}
              className={cn("chip px-3 py-1.5 text-caption font-medium text-muted-foreground hover:text-foreground", FOCUS_RING)}
            >
              Tidy
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={cn("chip px-3 py-1.5 text-caption font-medium text-muted-foreground hover:text-foreground", FOCUS_RING)}
            aria-pressed={editing}
          >
            {editing ? "Done" : "Arrange"}
          </button>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className={cn("chip px-3 py-1.5 text-caption font-medium text-[hsl(var(--brand))]", FOCUS_RING)}
            aria-expanded={adding}
          >
            + Add
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
          <ul className="mt-2 grid max-h-56 grid-cols-2 gap-0.5 overflow-auto ds-scroll sm:grid-cols-4">
            {addResults.map((tool) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => addTool(tool)}
                  className="row-idle flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-ui"
                >
                  <span className="app-icon" style={{ width: 20, height: 20 }}>
                    <ToolIcon name={tool.icon} size={11} />
                  </span>
                  <span className="truncate">{tool.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn("relative select-none", editing && "touch-none")}
        style={{ height: canvasH }}
      >
        {tiles.map((tile) => {
          const tool = resolve(tile);
          const g = ghost?.id === tile.id ? ghost : tile;
          const left = `calc(${(g.x / COLS) * 100}% + ${(g.x * GAP_PX) / COLS}px)`;
          const width = `calc(${(g.w / COLS) * 100}% + ${((g.w - 1) * GAP_PX) / COLS}px)`;
          const top = g.y * (ROW_PX + GAP_PX);
          const height = g.h * ROW_PX + (g.h - 1) * GAP_PX;
          return (
            <div
              key={tile.id}
              className={cn(
                "widget group absolute overflow-hidden",
                ghost?.id === tile.id && "opacity-70 ring-2 ring-[hsl(var(--brand)/0.5)]"
              )}
              style={{ left, top, width, height, transition: dragRef.current ? "none" : "left 180ms, top 180ms, width 180ms, height 180ms" }}
            >
              {tile.kind === "live" ? (
                <ClockTile editing={editing} onDrag={(e) => beginDrag(e, tile, "move")} />
              ) : tool ? (
                <ToolTile
                  tool={tool}
                  tile={g}
                  editing={editing}
                  isFavorite={isFavorite(tool.id)}
                  onOpen={() => onOpenTool(tool)}
                  onToggleFavorite={() => toggleFavorite(tool.id)}
                  onToggleMini={() => update(tile.id, { mini: !tile.mini })}
                  onDrag={(e) => beginDrag(e, tile, "move")}
                />
              ) : null}

              {editing && (
                <>
                  <button
                    type="button"
                    aria-label={`Remove ${tool?.name ?? "widget"}`}
                    onClick={() => remove(tile.id)}
                    className="absolute left-1.5 top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-[hsl(var(--destructive))] group-hover:opacity-100"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} color="currentColor" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Resize ${tool?.name ?? "widget"}`}
                    onPointerDown={(e) => beginDrag(e, tile, "resize")}
                    className="absolute bottom-1.5 right-1.5 z-20 flex h-6 w-6 cursor-nwse-resize items-center justify-center rounded-full bg-white/70 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <HugeiconsIcon icon={ArrowDiagonalIcon} size={12} strokeWidth={2} color="currentColor" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ToolTile({
  tool,
  tile,
  editing,
  isFavorite,
  onOpen,
  onToggleFavorite,
  onToggleMini,
  onDrag,
}: {
  tool: ToolDefinition;
  tile: BentoTile;
  editing: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onToggleMini: () => void;
  onDrag: (e: ReactPointerEvent) => void;
}) {
  if (tile.mini) {
    return (
      <button
        type="button"
        onClick={onOpen}
        onPointerDown={editing ? onDrag : undefined}
        className={cn("flex h-full w-full items-center justify-center gap-1.5 outline-none", FOCUS_RING, editing && "cursor-grab active:cursor-grabbing")}
        title={tool.name}
      >
        <ToolIcon name={tool.icon} size={16} className="text-muted-foreground" />
        <span className="truncate text-caption font-medium text-foreground">{tool.name}</span>
      </button>
    );
  }
  return (
    <div className="flex h-full flex-col justify-between p-3">
      <div
        onPointerDown={editing ? onDrag : undefined}
        className={cn("flex items-start justify-between gap-2", editing && "cursor-grab active:cursor-grabbing")}
        title={editing ? "Drag to move" : undefined}
      >
        <button type="button" onClick={onOpen} className={cn("flex min-w-0 items-center gap-2 text-start outline-none", FOCUS_RING)}>
          <span className="app-icon" style={{ width: 32, height: 32 }}>
            <ToolIcon name={tool.icon} size={15} />
          </span>
          <span className="min-w-0 truncate text-ui font-medium text-foreground">{tool.name}</span>
        </button>
        {editing ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onToggleMini}
              aria-label={tile.mini ? `Expand ${tool.name}` : `Minify ${tool.name}`}
              className="chip flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={DragDropIcon} size={12} strokeWidth={1.75} color="currentColor" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
            className={cn("chip flex h-6 w-6 shrink-0 items-center justify-center", isFavorite ? "text-[hsl(var(--favorite))]" : "text-muted-foreground opacity-0 group-hover:opacity-100")}
          >
            <HugeiconsIcon icon={StarIcon} size={12} strokeWidth={2} color="currentColor" />
          </button>
        )}
      </div>
      {tile.h > 1 && <p className="line-clamp-3 text-caption text-muted-foreground">{tool.description}</p>}
    </div>
  );
}

function ClockTile({ editing, onDrag }: { editing: boolean; onDrag: (e: ReactPointerEvent) => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      onPointerDown={editing ? onDrag : undefined}
      className={cn("flex h-full flex-col justify-center gap-1 p-4", editing && "cursor-grab active:cursor-grabbing")}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={Clock01Icon} size={13} strokeWidth={1.75} color="currentColor" aria-hidden />
        <span className="text-label uppercase">Now</span>
      </div>
      <div className="text-display font-semibold tabular-nums text-foreground">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-ui text-muted-foreground">
        {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

/* ---- Layout helpers ---- */

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function overlaps(a: BentoTile, b: BentoTile): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** First-fit placement: find the lowest y where a w×h tile fits with no overlap. */
function findSpot(tiles: BentoTile[], w: number, h: number): { x: number; y: number } {
  for (let y = 0; y < 60; y++) {
    for (let x = 0; x <= COLS - w; x++) {
      const cand: BentoTile = { id: "_cand", kind: "tool", x, y, w, h };
      if (!tiles.some((t) => overlaps(cand, t))) return { x, y };
    }
  }
  return { x: 0, y: tiles.reduce((m, t) => Math.max(m, t.y + t.h), 0) };
}

/** Re-pack tiles top-left, preserving their sizes (a "tidy up" pass). */
function packTiles(tiles: BentoTile[]): BentoTile[] {
  const placed: BentoTile[] = [];
  const sorted = [...tiles].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const t of sorted) {
    const spot = findSpot(placed, t.w, t.h);
    placed.push({ ...t, x: spot.x, y: spot.y });
  }
  return placed;
}
