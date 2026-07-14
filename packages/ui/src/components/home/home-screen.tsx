"use client";

import { useCallback, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  TOOL_REGISTRY,
  getToolById,
  type ToolDefinition,
} from "@ayetab/utils";
import {
  Check,
  LayoutGrid,
  Pencil,
  Plus,
  Settings2,
} from "lucide-react";
import {
  addWidgetToLayout,
  canAddWidget,
  cycleWidgetSize,
  removeWidgetFromLayout,
  reorderWidgets,
  setHomePins,
  toggleHomePin,
  updateWidgetSize,
  WIDGET_CATALOG,
  widgetSpanClass,
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
import { PinGrid } from "./pin-grid";
import { QuickNoteWidget } from "./quick-note-widget";
import { TodoWidget } from "./todo-widget";
import { ToolStrip } from "./tool-strip";

interface HomeScreenProps {
  onOpenTool: (tool: ToolDefinition) => void;
  /** Link to the full tool library (default: /library) */
  libraryHref?: string;
  /** Optional custom library control (e.g. Next.js Link) */
  libraryLink?: ReactNode;
}

export function HomeScreen({
  onOpenTool,
  libraryHref = "/library",
  libraryLink,
}: HomeScreenProps) {
  const { prefs, loaded, updateHome } = usePreferences();
  const [editing, setEditing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [addPinOpen, setAddPinOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const home = prefs.home;

  const pinnedTools = useMemo(
    () => home.pins.map((id) => getToolById(id)).filter(Boolean) as ToolDefinition[],
    [home.pins]
  );

  const recentTools = useMemo(
    () => prefs.recents.map((id) => getToolById(id)).filter(Boolean).slice(0, 6) as ToolDefinition[],
    [prefs.recents]
  );

  const favoriteTools = useMemo(
    () => prefs.favorites.map((id) => getToolById(id)).filter(Boolean).slice(0, 8) as ToolDefinition[],
    [prefs.favorites]
  );

  const availablePins = useMemo(
    () => TOOL_REGISTRY.filter((t) => !home.pins.includes(t.id)),
    [home.pins]
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      void updateHome((h) => removeWidgetFromLayout(h, widgetId));
    },
    [updateHome]
  );

  const handleCycleSize = useCallback(
    (widget: HomeWidget) => {
      void updateHome((h) => updateWidgetSize(h, widget.id, cycleWidgetSize(widget.size)));
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

  const onDragStart = (index: number) => (e: DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const onDragOver = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndex(index);
  };

  const onDrop = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    const from = dragIndex ?? Number(e.dataTransfer.getData("text/plain"));
    if (Number.isFinite(from)) {
      void updateHome((h) => reorderWidgets(h, from, index));
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const renderWidget = (widget: HomeWidget, index: number) => {
    const frameProps = {
      size: widget.size,
      editing,
      onRemove: () => handleRemoveWidget(widget.id),
      onCycleSize: () => handleCycleSize(widget),
      dragHandleProps: editing
        ? {
            draggable: true,
            onDragStart: onDragStart(index),
            onDragEnd,
          }
        : undefined,
    };

    let body: React.ReactNode = null;
    let title: string | undefined;

    switch (widget.type) {
      case "search":
        title = editing ? "Search" : undefined;
        body = <SearchBar tools={TOOL_REGISTRY} onSelect={onOpenTool} />;
        break;
      case "pins":
        title = "Apps";
        body = (
          <PinGrid
            tools={pinnedTools}
            editing={editing}
            onOpen={onOpenTool}
            onRemovePin={handleRemovePin}
            onAddPin={() => setAddPinOpen(true)}
          />
        );
        break;
      case "quick-note":
        title = "Quick Note";
        body = <QuickNoteWidget rows={widget.size === "sm" ? 3 : widget.size === "md" ? 5 : 8} />;
        break;
      case "todo":
        title = "To-Do";
        body = <TodoWidget maxItems={widget.size === "sm" ? 3 : 6} />;
        break;
      case "recents":
        title = "Recents";
        body = (
          <ToolStrip
            tools={recentTools}
            emptyLabel="Open a tool to see it here"
            onOpen={onOpenTool}
            testId="home-recents"
          />
        );
        break;
      case "favorites":
        title = "Favorites";
        body = (
          <ToolStrip
            tools={favoriteTools}
            emptyLabel="Star tools to pin them here"
            onOpen={onOpenTool}
            testId="home-favorites"
          />
        );
        break;
      default:
        return null;
    }

    return (
      <div
        key={widget.id}
        className={cn(
          widgetSpanClass(widget.size),
          dropIndex === index && editing && "opacity-80 ring-2 ring-selection/30 rounded-[22px]"
        )}
        onDragOver={editing ? onDragOver(index) : undefined}
        onDrop={editing ? onDrop(index) : undefined}
      >
        <HomeWidgetFrame
          {...frameProps}
          title={title}
          testId={`home-widget-${widget.type}`}
        >
          {body}
        </HomeWidgetFrame>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col" data-testid="home-screen">
      <OnboardingModal />

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/25 bg-background/55 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-muted-foreground">{greeting}</p>
          <h1 className="truncate text-[20px] font-semibold tracking-tight md:text-[22px]">AyeTab</h1>
        </div>
        {libraryLink ?? (
          <a
            href={libraryHref}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground",
              "transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
              "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            )}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Library
          </a>
        )}
        <ThemeToggle />
        <Button
          variant={editing ? "primary" : "ghost"}
          size="sm"
          onClick={() => setEditing((v) => !v)}
          data-testid="home-edit-toggle"
          className="gap-1.5"
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:px-8 md:py-8">
        {!loaded ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-4 h-16 rounded-[22px] bg-muted/30" />
            <div className="col-span-2 sm:col-span-4 h-40 rounded-[22px] bg-muted/30" />
            <div className="col-span-2 h-36 rounded-[22px] bg-muted/30" />
            <div className="col-span-2 h-36 rounded-[22px] bg-muted/30" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up motion-reduce:animate-none">
            {home.widgets.map((widget, index) => renderWidget(widget, index))}
          </div>
        )}

        {editing && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setAddWidgetOpen(true)}
              data-testid="home-add-widget"
              className="gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Add Widget
            </Button>
            <p className="max-w-sm text-center text-[12px] text-muted-foreground">
              Drag the handle to reorder · tap resize to change size · remove with −
            </p>
          </div>
        )}

        {!editing && (
          <p className="mt-8 text-center text-[12px] text-muted-foreground">
            <Settings2 className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.75} />
            Tap Edit to customize your home — just like your phone
          </p>
        )}
      </main>

      {/* Add Widget sheet */}
      <Dialog
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        labelledBy="add-widget-title"
        panelClassName="max-w-md"
      >
        <div className="overflow-hidden rounded-[22px] material-hud p-5" data-testid="home-widget-gallery">
          <h2 id="add-widget-title" className="text-[17px] font-semibold tracking-tight">
            Add Widget
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pick something to put on your home screen
          </p>
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
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left",
                      "transition-colors",
                      disabled
                        ? "opacity-40"
                        : "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-selection/10 text-selection">
                      <ToolIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium tracking-tight">{item.name}</span>
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

      {/* Add Pin sheet */}
      <Dialog
        open={addPinOpen}
        onClose={() => setAddPinOpen(false)}
        labelledBy="add-pin-title"
        panelClassName="max-w-md"
        placement="top"
      >
        <div className="overflow-hidden rounded-[22px] material-hud" data-testid="home-pin-picker">
          <div className="border-b border-border/40 px-5 py-4">
            <h2 id="add-pin-title" className="text-[17px] font-semibold tracking-tight">
              Add App
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Pin a tool to your home screen</p>
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
