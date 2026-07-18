"use client";

import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";
import { type HomeWidget } from "../../lib/home-layout";
import { SearchBar } from "../search-bar";
import { ClockWidget } from "./clock-widget";
import { QuickNoteWidget } from "./quick-note-widget";
import { TodoWidget } from "./todo-widget";
import { ToolStrip } from "./tool-strip";

interface HomeWidgetBodyProps {
  widget: HomeWidget;
  onOpenTool: (tool: ToolDefinition) => void;
  recentTools: ToolDefinition[];
  favoriteTools: ToolDefinition[];
}

export function HomeWidgetBody({
  widget,
  onOpenTool,
  recentTools,
  favoriteTools,
}: HomeWidgetBodyProps) {
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
}
