"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { cn } from "../../lib/utils";
import { ToolIcon } from "../tool-icon";

interface ToolStripProps {
  tools: ToolDefinition[];
  emptyLabel: string;
  onOpen: (tool: ToolDefinition) => void;
  testId?: string;
}

export function ToolStrip({ tools, emptyLabel, onOpen, testId }: ToolStripProps) {
  if (tools.length === 0) {
    return (
      <p className="px-1 py-4 text-center text-[12px] text-muted-foreground" data-testid={testId}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5" data-testid={testId}>
      {tools.map((tool) => (
        <li key={tool.id}>
          <button
            type="button"
            onClick={() => onOpen(tool)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left",
              "transition-[background-color,transform] duration-100 ease-out-strong active:scale-[0.99]",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            )}
          >
            <ToolIcon name={tool.icon} className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium tracking-tight">{tool.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{tool.description}</span>
            </span>
            <HugeiconsIcon icon={ChevronRightIcon} size={16} strokeWidth={1.75} color="currentColor" className="shrink-0 text-muted-foreground/50" />
          </button>
        </li>
      ))}
    </ul>
  );
}
