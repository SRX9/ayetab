"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolDefinition,
  CATEGORY_LABELS,
} from "@ayetab/utils";
import {
  ToolCard,
  SearchBar,
  CategoryNav,
  ThemeToggle,
  ToolListSection,
  usePreferences,
  OnboardingModal,
  ShortcutsModal,
  useShortcutsModal,
  SettingsMenu,
} from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode", "productivity"];

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all" | "favorites">("all");
  const { prefs, toggleFavorite, isFavorite, importPrefs } = usePreferences();
  const { open: shortcutsOpen, setOpen: setShortcutsOpen, close: closeShortcuts } = useShortcutsModal();

  const filteredTools = useMemo(() => {
    if (activeCategory === "favorites") {
      return TOOL_REGISTRY.filter((t) => prefs.favorites.includes(t.id));
    }
    if (activeCategory === "all") return TOOL_REGISTRY;
    return TOOL_REGISTRY.filter((t) => t.category === activeCategory);
  }, [activeCategory, prefs.favorites]);

  const counts = useMemo(() => {
    const c: Record<ToolCategory | "all", number> = {
      all: TOOL_REGISTRY.length,
      format: 0,
      convert: 0,
      inspect: 0,
      generate: 0,
      encode: 0,
      productivity: 0,
    };
    for (const t of TOOL_REGISTRY) c[t.category]++;
    return c;
  }, []);

  const handleSelect = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  const handleToggleFavorite = useCallback(
    (tool: ToolDefinition) => toggleFavorite(tool.id),
    [toggleFavorite]
  );

  return (
    <div className="min-h-screen flex">
      <OnboardingModal />
      <ShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />

      <aside className="w-56 shrink-0 border-r border-border p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight">AyeTab</h1>
            <p className="text-xs text-muted-foreground">Developer Utilities</p>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={() => setActiveCategory("favorites")}
          className={`flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors ${
            activeCategory === "favorites"
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          <span>★ Favorites</span>
          <span className="text-xs text-muted-foreground">{prefs.favorites.length}</span>
        </button>

        <CategoryNav
          categories={CATEGORIES}
          active={activeCategory === "favorites" ? "all" : activeCategory}
          onSelect={(c) => setActiveCategory(c)}
          counts={counts}
        />

        {prefs.recents.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-3">Recent</p>
            {prefs.recents.slice(0, 5).map((id) => {
              const tool = TOOL_REGISTRY.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <button
                  key={id}
                  onClick={() => handleSelect(tool)}
                  className="rounded-md px-3 py-1.5 text-xs text-left text-muted-foreground hover:bg-accent hover:text-foreground truncate"
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-auto">
          Press <kbd className="px-1 py-0.5 rounded border border-border text-[9px]">⌘K</kbd> to search ·{" "}
          <button onClick={() => setShortcutsOpen(true)} className="hover:text-foreground underline-offset-2 hover:underline">
            ?
          </button>{" "}
          for shortcuts
        </p>
        <SettingsMenu prefs={prefs} onImport={importPrefs} />
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {activeCategory === "favorites"
                ? "Favorites"
                : activeCategory === "all"
                  ? "All Tools"
                  : CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <SearchBar tools={TOOL_REGISTRY} onSelect={handleSelect} />

          {activeCategory === "all" && prefs.favorites.length > 0 && (
            <ToolListSection
              title="Favorites"
              toolIds={prefs.favorites}
              onSelect={handleSelect}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={handleSelect}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
