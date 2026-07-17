"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { ToolDefinition } from "@ayetab/utils";
import {
  canAddWidget,
  WIDGET_CATALOG,
  type HomeLayout,
  type HomeWidgetType,
} from "../../lib/home-layout";
import { cn } from "../../lib/utils";
import { Dialog } from "../dialog";
import { Button } from "../button";
import { ToolIcon } from "../tool-icon";

interface AddWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  home: HomeLayout;
  onAdd: (type: HomeWidgetType) => void;
}

export function AddWidgetDialog({ open, onClose, home, onAdd }: AddWidgetDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                  onClick={() => onAdd(item.type)}
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
                    <HugeiconsIcon
                      icon={Add01Icon}
                      size={16}
                      strokeWidth={1.75}
                      color="currentColor"
                      className="text-muted-foreground"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <Button variant="outline" size="md" onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </Dialog>
  );
}

interface AddPinDialogProps {
  open: boolean;
  onClose: () => void;
  availablePins: ToolDefinition[];
  onAdd: (toolId: string) => void;
}

export function AddPinDialog({ open, onClose, availablePins, onAdd }: AddPinDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                onClick={() => onAdd(tool.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection-soft"
              >
                <ToolIcon name={tool.icon} className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{tool.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{tool.description}</span>
                </span>
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={16}
                  strokeWidth={1.75}
                  color="currentColor"
                  className="shrink-0 text-muted-foreground"
                />
              </button>
            ))
          )}
        </div>
        <div className="border-t border-border/40 p-3">
          <Button variant="outline" size="md" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
