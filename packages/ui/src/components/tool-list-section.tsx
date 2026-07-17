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
  const tools = toolIds.flatMap((id) => {
    const tool = getToolById(id);
    return tool ? [tool] : [];
  });
  if (tools.length === 0) return null;

  return (
    <section className="flex flex-col gap-1">
      <h3 className="px-2.5 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={onSelect}
            isFavorite={isFavorite?.(tool.id)}
            onToggleFavorite={onToggleFavorite}
            compact={compact}
            variant="row"
          />
        ))}
      </div>
    </section>
  );
}
