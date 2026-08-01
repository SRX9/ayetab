"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type ToolDefinition,
} from "@ayetab/utils";
import { usePreferences } from "../hooks/use-preferences";
import { BrandMark } from "./brand-mark";
import { ShellContent } from "./app-shell";
import { ToolCard } from "./tool-card";

interface ToolIndexProps {
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  title?: string;
  description?: string;
  /** Extra sections appended below the index — e.g. tools that open elsewhere. */
  footer?: ReactNode;
}

/**
 * The content pane's default view: every tool, grouped, with descriptions. The
 * sidebar is for jumping to a tool you can already name; this is for finding
 * one you can't.
 */
export function ToolIndex({ tools, onSelect, title = "All tools", description, footer }: ToolIndexProps) {
  const { prefs, isFavorite, toggleFavorite } = usePreferences();

  const handleToggleFavorite = useCallback(
    (tool: ToolDefinition) => toggleFavorite(tool.id),
    [toggleFavorite]
  );

  const favoriteTools = useMemo(
    () => prefs.favorites.flatMap((id) => tools.filter((t) => t.id === id)),
    [prefs.favorites, tools]
  );

  const groups = useMemo(() => {
    const out: Array<{ id: string; label: string; tools: ToolDefinition[] }> = [];
    if (favoriteTools.length > 0) {
      out.push({ id: "favorites", label: "Favorites", tools: favoriteTools });
    }
    for (const category of ALL_CATEGORIES) {
      const list = tools.filter((t) => t.category === category);
      if (list.length > 0) {
        out.push({ id: category, label: CATEGORY_LABELS[category], tools: list });
      }
    }
    return out;
  }, [tools, favoriteTools]);

  return (
    <ShellContent>
      <header>
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" size={32} />
          <h1 className="text-display font-semibold text-balance">{title}</h1>
        </div>
        <p className="mt-1.5 text-ui text-muted-foreground">
          {description ?? (
            <>
              <span className="tabular-nums">{tools.length}</span> tools, all running on your device.
              Press <kbd>⌘</kbd> <kbd>K</kbd> to search.
            </>
          )}
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-7" data-testid="tool-index">
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="border-b border-border px-2 pb-1.5 text-label font-medium uppercase text-muted-foreground">
              {group.label}
            </h2>
            <ul className="mt-1">
              {group.tools.map((tool) => (
                <li key={`${group.id}-${tool.id}`}>
                  <ToolCard
                    tool={tool}
                    onClick={onSelect}
                    isFavorite={isFavorite(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
        {footer}
      </div>
    </ShellContent>
  );
}
