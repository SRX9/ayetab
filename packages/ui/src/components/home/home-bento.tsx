"use client";

import { type ToolDefinition } from "@ayetab/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  bentoSpanClass,
  type BentoSize,
  type HomeWidget,
} from "../../lib/home-layout";
import { cn } from "../../lib/utils";
import { Button } from "../button";
import { HomeWidgetFrame } from "./home-widget-frame";
import { AppIcon, AddAppIcon } from "./app-icon";
import { HomeWidgetBody } from "./home-widget-body";
import { widgetTitle } from "../../lib/home-layout";
import type { DragEvent } from "react";

function onDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

interface HomeBentoProps {
  loaded: boolean;
  editing: boolean;
  widgets: HomeWidget[];
  pinnedTools: ToolDefinition[];
  dockTools: ToolDefinition[];
  recentTools: ToolDefinition[];
  favoriteTools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
  onAddPinClick: () => void;
  onAddWidgetClick: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onCycleSize: (widget: HomeWidget) => void;
  onRemovePin: (toolId: string) => void;
  onDragStart: (payload: { kind: "widget"; index: number } | { kind: "pin"; index: number }) => (e: DragEvent) => void;
  onDragEnd: () => void;
  onDropWidget: (toIndex: number) => (e: DragEvent) => void;
  onDropPin: (toIndex: number) => (e: DragEvent) => void;
}

export function HomeBento({
  loaded,
  editing,
  widgets,
  pinnedTools,
  dockTools,
  recentTools,
  favoriteTools,
  onOpenTool,
  onAddPinClick,
  onAddWidgetClick,
  onRemoveWidget,
  onCycleSize,
  onRemovePin,
  onDragStart,
  onDragEnd,
  onDropWidget,
  onDropPin,
}: HomeBentoProps) {
  return (
    <>
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
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className={cn(bentoSpanClass(widget.size as BentoSize), "min-h-0")}
                onDragOver={editing ? onDragOver : undefined}
                onDrop={editing ? onDropWidget(index) : undefined}
              >
                <HomeWidgetFrame
                  size={widget.size}
                  editing={editing}
                  title={widgetTitle(widget.type)}
                  onRemove={() => onRemoveWidget(widget.id)}
                  onCycleSize={() => onCycleSize(widget)}
                  dragHandleProps={
                    editing
                      ? {
                          draggable: true,
                          onDragStart: onDragStart({ kind: "widget", index }),
                          onDragEnd,
                        }
                      : undefined
                  }
                  testId={`home-widget-${widget.type}`}
                >
                  <HomeWidgetBody
                    widget={widget}
                    onOpenTool={onOpenTool}
                    recentTools={recentTools}
                    favoriteTools={favoriteTools}
                  />
                </HomeWidgetFrame>
              </div>
            ))}

            {pinnedTools.map((tool, index) => (
              <div
                key={`pin-${tool.id}`}
                className="app-icon-tile"
                draggable={editing}
                onDragStart={editing ? onDragStart({ kind: "pin", index }) : undefined}
                onDragEnd={onDragEnd}
                onDragOver={editing ? onDragOver : undefined}
                onDrop={editing ? onDropPin(index) : undefined}
              >
                <AppIcon
                  tool={tool}
                  editing={editing}
                  onOpen={onOpenTool}
                  onRemove={() => onRemovePin(tool.id)}
                  size="md"
                />
              </div>
            ))}

            {editing && (
              <div className="app-icon-tile">
                <AddAppIcon onClick={onAddPinClick} />
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={onAddWidgetClick}
              data-testid="home-add-widget"
              className="gap-2 rounded-full border-white/40 bg-white/30 backdrop-blur-md dark:bg-white/10"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.75} color="currentColor" />
              Add Widget
            </Button>
          </div>
        )}
      </main>

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
    </>
  );
}
