"use client";

import { useCallback, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  TOOL_REGISTRY,
  getToolById,
  type ToolDefinition,
} from "@ayetab/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutGridIcon,
  PencilEdit02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import {
  addWidgetToLayout,
  cycleWidgetSize,
  removeWidgetFromLayout,
  reorderPins,
  reorderWidgets,
  setHomePins,
  toggleHomePin,
  updateWidgetSize,
  type BentoSize,
  type HomeWidget,
  type HomeWidgetType,
} from "../../lib/home-layout";
import { usePreferences } from "../../hooks/use-preferences";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { ThemeToggle } from "../theme-toggle";
import { SettingsButton } from "../settings-panel";
import { OnboardingModal } from "../onboarding-modal";
import { HomeWallpaper } from "./home-wallpaper";
import { AddPinDialog, AddWidgetDialog } from "./home-add-dialogs";
import { HomeBento } from "./home-bento";

interface HomeScreenProps {
  onOpenTool: (tool: ToolDefinition) => void;
  libraryHref?: string;
  libraryLink?: ReactNode;
}

type DragPayload =
  | { kind: "widget"; index: number }
  | { kind: "pin"; index: number };

function readDragPayload(e: DragEvent, fallback: DragPayload | null): DragPayload | null {
  try {
    return fallback ?? (JSON.parse(e.dataTransfer.getData("text/plain")) as DragPayload);
  } catch {
    return fallback;
  }
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
  const dragPayloadRef = useRef<DragPayload | null>(null);

  const home = prefs.home;

  const pinnedTools = useMemo(
    () =>
      home.pins.flatMap((id) => {
        const tool = getToolById(id);
        return tool ? [tool] : [];
      }),
    [home.pins]
  );

  const dockTools = useMemo(
    () =>
      (home.dock?.length ? home.dock : home.pins.slice(0, 5)).flatMap((id) => {
        const tool = getToolById(id);
        return tool ? [tool] : [];
      }),
    [home.dock, home.pins]
  );

  const recentTools = useMemo(
    () =>
      prefs.recents.flatMap((id) => {
        const tool = getToolById(id);
        return tool ? [tool] : [];
      }).slice(0, 5),
    [prefs.recents]
  );

  const favoriteTools = useMemo(
    () =>
      prefs.favorites.flatMap((id) => {
        const tool = getToolById(id);
        return tool ? [tool] : [];
      }).slice(0, 6),
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
    dragPayloadRef.current = payload;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
  };

  const handleDragEnd = useCallback(() => {
    dragPayloadRef.current = null;
  }, []);

  const dropOnWidget = (toIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    let payload = dragPayloadRef.current;
    payload = readDragPayload(e, payload);
    if (payload?.kind === "widget") {
      void updateHome((h) => reorderWidgets(h, payload.index, toIndex));
    }
    dragPayloadRef.current = null;
  };

  const dropOnPin = (toIndex: number) => (e: DragEvent) => {
    e.preventDefault();
    let payload = dragPayloadRef.current;
    payload = readDragPayload(e, payload);
    if (payload?.kind === "pin") {
      void updateHome((h) => reorderPins(h, payload.index, toIndex));
    }
    dragPayloadRef.current = null;
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" data-testid="home-screen">
      <HomeWallpaper />
      <OnboardingModal />

      <header className="relative z-20 flex items-center gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8 md:pt-5">
        <div className="min-w-0 flex-1">
          {!editing ? (
            <p className="text-[13px] font-medium text-foreground/70 drop-shadow-sm">AyeTab</p>
          ) : (
            <p className="text-[15px] font-semibold tracking-tight text-foreground">Customize Home</p>
          )}
        </div>
        {libraryLink ?? (
          <a
            href={libraryHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-[13px] font-medium text-foreground backdrop-blur-md dark:bg-white/10"
          >
            <HugeiconsIcon icon={LayoutGridIcon} size={14} strokeWidth={1.75} color="currentColor" />
            Library
          </a>
        )}
        <SettingsButton className="rounded-full bg-white/25 backdrop-blur-md dark:bg-white/10" />
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
              <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} color="currentColor" />
              Done
            </>
          ) : (
            <>
              <HugeiconsIcon icon={PencilEdit02Icon} size={14} strokeWidth={1.75} color="currentColor" />
              Edit
            </>
          )}
        </Button>
      </header>

      <HomeBento
        loaded={loaded}
        editing={editing}
        widgets={home.widgets}
        pinnedTools={pinnedTools}
        dockTools={dockTools}
        recentTools={recentTools}
        favoriteTools={favoriteTools}
        onOpenTool={onOpenTool}
        onAddPinClick={() => setAddPinOpen(true)}
        onAddWidgetClick={() => setAddWidgetOpen(true)}
        onRemoveWidget={handleRemoveWidget}
        onCycleSize={handleCycleSize}
        onRemovePin={handleRemovePin}
        onDragStart={startDrag}
        onDragEnd={handleDragEnd}
        onDropWidget={dropOnWidget}
        onDropPin={dropOnPin}
      />

      <AddWidgetDialog
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        home={home}
        onAdd={handleAddWidget}
      />

      <AddPinDialog
        open={addPinOpen}
        onClose={() => setAddPinOpen(false)}
        availablePins={availablePins}
        onAdd={handleAddPin}
      />
    </div>
  );
}
