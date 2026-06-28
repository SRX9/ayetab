"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getToolById, TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";
import { ToolRunner, CommandPalette, ThemeToggle, usePreferences } from "@ayetab/ui";

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInput = searchParams.get("input") ?? "";
  const { isFavorite, toggleFavorite, addRecent } = usePreferences();

  const tool = useMemo(() => getToolById(toolId), [toolId]);

  const handleNavigate = useCallback(
    (nextTool: ToolDefinition, input: string) => {
      const params = new URLSearchParams({ input });
      router.push(`/tools/${nextTool.id}?${params.toString()}`);
    },
    [router]
  );

  const handlePaletteSelect = useCallback(
    (t: ToolDefinition) => router.push(`/tools/${t.id}`),
    [router]
  );

  const handleRecent = useCallback((id: string) => addRecent(id), [addRecent]);

  const handleToggleFavorite = useCallback(() => {
    if (tool) toggleFavorite(tool.id);
  }, [tool, toggleFavorite]);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Tool not found</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">
            ← Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CommandPalette tools={TOOL_REGISTRY} onSelect={handlePaletteSelect} />
      <header className="border-b border-border px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← All Tools
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium flex-1">{tool.name}</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <ToolRunner
            key={`${tool.id}-${initialInput}`}
            tool={tool}
            initialInput={initialInput}
            onNavigate={handleNavigate}
            onRecent={handleRecent}
            isFavorite={isFavorite(tool.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </main>
    </div>
  );
}
