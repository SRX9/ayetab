"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { getToolById } from "@ayetab/utils";
import { ToolCard } from "./tool-card";

interface ToolListSectionProps {
  title: string;
  toolIds: string[];
  onSelect: (tool: ToolDefinition) => void;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (tool: ToolDefinition) => void;
  compact?: boolean;
}

export function ToolListSection({
  title,
  toolIds,
  onSelect,
  isFavorite,
  onToggleFavorite,
  compact,
}: ToolListSectionProps) {
  const tools = toolIds.map((id) => getToolById(id)).filter(Boolean) as ToolDefinition[];
  if (tools.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className={compact ? "flex flex-col gap-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={onSelect}
            isFavorite={isFavorite?.(tool.id)}
            onToggleFavorite={onToggleFavorite}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}
