"use client";

import { useCallback, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  TOOL_REGISTRY,
  getToolById,
  type ToolDefinition,
} from "@ayetab/utils";
import { Check, LayoutGrid, Pencil, Plus } from "lucide-react";
import {
  addWidgetToLayout,
  bentoSpanClass,
  canAddWidget,
  cycleWidgetSize,
  removeWidgetFromLayout,
  reorderPins,
  reorderWidgets,
  setHomePins,
  toggleHomePin,
  updateWidgetSize,
  WIDGET_CATALOG,
  type BentoSize,
  type HomeWidget,
  type HomeWidgetType,
} from "../../lib/home-layout";
import { usePreferences } from "../../hooks/use-preferences";
import { cn } from "../../lib/utils";
import { Dialog } from "../dialog";
import { Button } from "../button";
import { SearchBar } from "../search-bar";
import { ThemeToggle } from "../theme-toggle";
import { ToolIcon } from "../tool-icon";
import { OnboardingModal } from "../onboarding-modal";
import { HomeWidgetFrame } from "./home-widget-frame";
import { AppIcon, AddAppIcon } from "./app-icon";
import { QuickNoteWidget } from "./quick-note-widget";
import { TodoWidget } from "./todo-widget";
import { ToolStrip } from "./tool-strip";
import { ClockWidget } from "./clock-widget";

interface HomeScreenProps {
  onOpenTool: (tool: ToolDefinition) => void;
  libraryHref?: string;
  libraryLink?: ReactNode;
}

type DragPayload =
  | { kind: "widget"; index: number }
  | { kind: "pin"; index: number };

export function HomeScreen({
  onOpenTool,
  libraryHref = "/library",
  libraryLink,
}: HomeScreenProps) {
  const { prefs, loaded, updateHome } = usePreferences();
  const [editing, setEditing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [addPinOpen, setAddPinOpen] = useState(false);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);

  const home = prefs.home;

  const pinnedTools = useMemo(
    () => home.pins.map((id) => getToolById(id)).filter(Boolean) as ToolDefinition[],
    [home.pins]
  );

  const dockTools = useMemo(
    () =>
      (home.dock?.length ? home.dock : home.pins.slice(0, 5))
        .map((id) => getToolById(id))
        .filter(Boolean) as ToolDefinition[],
    [home.dock, home.pins]
  );

  const recentTools = useMemo(
    () => prefs.recents.map((id) => getToolById(id)).filter(Boolean).slice(0, 5) as ToolDefinition[],
    [prefs.recents]
  );

  const favoriteTools = useMemo(
    () => prefs.favorites.map((id) => getToolById(id)).filter(Boolean).slice(0, 6) as ToolDefinition[],
    [prefs.favorites]
  );

  const availablePins = useMemo(
    () => TOOL_REGISTRY.filter((t) => !home.pins.includes(t.id)),
    [home.pins]
  );

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      void updateHome((h) => removeWidgetFromLayout(h, widgetId));
    },
    [updateHome]
  );

  const handleCycleSize = useCallback(
    (widget: HomeWidget) => {
      void updateHome((h) =>
        updateWidgetSize(h, widget.id, cycleWidgetSize(widget.size as BentoSize))
      );
    },
    [updateHome]
  );

  const handleAddWidget = useCallback(
    (type: HomeWidgetType) => {
      void updateHome((h) => addWidgetToLayout(h, type));
      setAddWidgetOpen(false);
    },
    [updateHome]
  );

  const handleRemovePin = useCallback(
    (toolId: string) => {
      void updateHome((h) => toggleHomePin(h, toolId));
    },
    [updateHome]
  );

  const handleAddPin = useCallback(
    (toolId: string) => {
      void updateHome((h) => setHomePins(h, [...h.pins, toolId]));
      setAddPinOpen(false);
    },
    [updateHome]
  );

  const startDrag = (payload: DragPayload) => (e: DragEvent) => {
    setDragPayload(payload);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const dropOnWidget = (toIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    let payload = dragPayload;
    try {
      payload = payload ?? (JSON.parse(e.dataTransfer.getData("text/plain")) as DragPayload);
    } catch {
      /* ignore */
    }
    if (payload?.kind === "widget") {
      void updateHome((h) => reorderWidgets(h, payload.index, toIndex));
    }
    setDragPayload(null);
  };

  const dropOnPin = (toIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    let payload = dragPayload;
    try {
      payload = payload ?? (JSON.parse(e.dataTransfer.getData("text/plain")) as DragPayload);
    } catch {
      /* ignore */
    }
    if (payload?.kind === "pin") {
      void updateHome((h) => reorderPins(h, payload.index, toIndex));
    }
    setDragPayload(null);
  };

  const renderWidgetBody = (widget: HomeWidget) => {
    switch (widget.type) {
      case "clock":
        return <ClockWidget />;
      case "search":
        return (
          <div className="flex h-full items-center">
            <SearchBar tools={TOOL_REGISTRY} onSelect={onOpenTool} className="w-full" />
          </div>
        );
      case "quick-note":
        return (
          <QuickNoteWidget
            rows={widget.size === "4x4" || widget.size === "2x4" ? 8 : 4}
            className="h-full min-h-[6rem] border-0 bg-transparent shadow-none"
          />
        );
      case "todo":
        return <TodoWidget maxItems={widget.size === "4x4" || widget.size === "2x4" ? 8 : 4} />;
      case "recents":
        return (
          <ToolStrip
            tools={recentTools}
            emptyLabel="Open tools to see them here"
            onOpen={onOpenTool}
            testId="home-recents"
          />
        );
      case "favorites":
        return (
          <ToolStrip
            tools={favoriteTools}
            emptyLabel="Star tools to see them here"
            onOpen={onOpenTool}
            testId="home-favorites"
          />
        );
      default:
        return null;
    }
  };

  const widgetTitle = (type: HomeWidgetType) => {
    if (type === "clock" || type === "search") return undefined;
    return WIDGET_CATALOG.find((c) => c.type === type)?.name;
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" data-testid="home-screen">
      <div className="home-wallpaper" aria-hidden />
      <OnboardingModal />

      {/* Top chrome */}
      <header className="relative z-20 flex items-center gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8 md:pt-5">
        <div className="min-w-0 flex-1">
          {!editing && (
            <p className="text-[13px] font-medium text-foreground/70 drop-shadow-sm">AyeTab</p>
          )}
          {editing && (
            <p className="text-[15px] font-semibold tracking-tight text-foreground">Customize Home</p>
          )}
        </div>
        {libraryLink ?? (
          <a
            href={libraryHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-[13px] font-medium text-foreground backdrop-blur-md dark:bg-white/10"
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
            Library
          </a>
        )}
        <ThemeToggle className="rounded-full bg-white/25 backdrop-blur-md dark:bg-white/10" />
        <Button
          variant={editing ? "primary" : "ghost"}
          size="sm"
          onClick={() => setEditing((v) => !v)}
          data-testid="home-edit-toggle"
          className={cn(
            "gap-1.5 rounded-full",
            !editing && "bg-white/25 text-foreground backdrop-blur-md dark:bg-white/10"
          )}
        >
          {editing ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Done
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
              Edit
            </>
          )}
        </Button>
      </header>

      {/* SpringBoard bento grid — fills the screen */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-28 md:px-6 lg:px-10">
        {!loaded ? (
          <div className="home-bento-grid h-full opacity-40">
            <div className="col-span-2 row-span-2 rounded-[28px] bg-white/30" />
            <div className="col-span-2 row-span-2 rounded-[28px] bg-white/30 sm:col-span-4" />
            <div className="col-span-2 row-span-2 rounded-[28px] bg-white/30" />
            <div className="col-span-2 row-span-2 rounded-[28px] bg-white/30" />
          </div>
        ) : (
          <div className="home-bento-grid min-h-full flex-1" data-testid="home-bento-grid">
            {home.widgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(bentoSpanClass(widget.size as BentoSize), "min-h-0")}
                onDragOver={editing ? onDragOver : undefined}
                onDrop={editing ? dropOnWidget(index) : undefined}
              >
                <HomeWidgetFrame
                  size={widget.size}
                  editing={editing}
                  title={widgetTitle(widget.type)}
                  onRemove={() => handleRemoveWidget(widget.id)}
                  onCycleSize={() => handleCycleSize(widget)}
                  dragHandleProps={
                    editing
                      ? {
                          draggable: true,
                          onDragStart: startDrag({ kind: "widget", index }),
                          onDragEnd: () => setDragPayload(null),
                        }
                      : undefined
                  }
                  testId={`home-widget-${widget.type}`}
                >
                  {renderWidgetBody(widget)}
                </HomeWidgetFrame>
              </div>
            ))}

            {/* App icons auto-flow into remaining bento cells */}
            {pinnedTools.map((tool, index) => (
              <div
                key={`pin-${tool.id}`}
                className="app-icon-tile"
                draggable={editing}
                onDragStart={editing ? startDrag({ kind: "pin", index }) : undefined}
                onDragEnd={() => setDragPayload(null)}
                onDragOver={editing ? onDragOver : undefined}
                onDrop={editing ? dropOnPin(index) : undefined}
              >
                <AppIcon
                  tool={tool}
                  editing={editing}
                  onOpen={onOpenTool}
                  onRemove={() => handleRemovePin(tool.id)}
                  size="md"
                />
              </div>
            ))}

            {editing && (
              <div className="app-icon-tile">
                <AddAppIcon onClick={() => setAddPinOpen(true)} />
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => setAddWidgetOpen(true)}
              data-testid="home-add-widget"
              className="gap-2 rounded-full border-white/40 bg-white/30 backdrop-blur-md dark:bg-white/10"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Add Widget
            </Button>
          </div>
        )}
      </main>

      {/* iPad-style dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5">
        <nav
          className="home-dock pointer-events-auto flex items-center gap-3 rounded-[28px] px-4 py-3 md:gap-4 md:px-5 md:py-3.5"
          data-testid="home-dock"
          aria-label="Dock"
        >
          {dockTools.map((tool) => (
            <AppIcon
              key={tool.id}
              tool={tool}
              onOpen={onOpenTool}
              label={false}
              size="sm"
            />
          ))}
        </nav>
      </div>

      {/* Add Widget gallery */}
      <Dialog
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        labelledBy="add-widget-title"
        panelClassName="max-w-md"
      >
        <div className="overflow-hidden rounded-[24px] material-hud p-5" data-testid="home-widget-gallery">
          <h2 id="add-widget-title" className="text-[17px] font-semibold tracking-tight">
            Add Widget
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Bento tiles for your home screen</p>
          <ul className="mt-4 flex flex-col gap-1">
            {WIDGET_CATALOG.map((item) => {
              const disabled = !canAddWidget(home, item.type);
              return (
                <li key={item.type}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleAddWidget(item.type)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                      disabled
                        ? "opacity-40"
                        : "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-selection/10 text-selection">
                      <ToolIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{item.name}</span>
                      <span className="block text-[12px] text-muted-foreground">{item.description}</span>
                    </span>
                    {disabled ? (
                      <span className="text-[11px] text-muted-foreground">Added</span>
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <Button variant="outline" size="md" onClick={() => setAddWidgetOpen(false)} className="mt-4 w-full">
            Close
          </Button>
        </div>
      </Dialog>

      {/* Add app picker */}
      <Dialog
        open={addPinOpen}
        onClose={() => setAddPinOpen(false)}
        labelledBy="add-pin-title"
        panelClassName="max-w-md"
        placement="top"
      >
        <div className="overflow-hidden rounded-[24px] material-hud" data-testid="home-pin-picker">
          <div className="border-b border-border/40 px-5 py-4">
            <h2 id="add-pin-title" className="text-[17px] font-semibold tracking-tight">
              Add App
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Place a tool icon on your home screen</p>
          </div>
          <div className="max-h-[min(420px,55vh)] overflow-auto p-2">
            {availablePins.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">All tools are pinned</p>
            ) : (
              availablePins.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleAddPin(tool.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection-soft"
                >
                  <ToolIcon name={tool.icon} className="h-[18px] w-[18px] text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{tool.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{tool.description}</span>
                  </span>
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                </button>
              ))
            )}
          </div>
          <div className="border-t border-border/40 p-3">
            <Button variant="outline" size="md" onClick={() => setAddPinOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
