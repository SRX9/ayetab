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
      <h2 className="px-2.5 pt-1 text-label font-medium uppercase text-muted-foreground">
        {title}
      </h2>
      <ul className="flex flex-col">
        {tools.map((tool) => (
          <li key={tool.id}>
            <ToolCard
              tool={tool}
              onClick={onSelect}
              isFavorite={isFavorite?.(tool.id)}
              onToggleFavorite={onToggleFavorite}
              compact={compact}
              variant="row"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
