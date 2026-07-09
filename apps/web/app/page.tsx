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
import { cn } from "@ayetab/ui";

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

      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-5 border-r border-border/80 bg-card/40 px-4 py-5 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-brand-foreground">
                A
              </span>
              <h1 className="text-lg font-bold tracking-tight">AyeTab</h1>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Developer Utilities</p>
          </div>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setActiveCategory("favorites")}
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm",
            "transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.97]",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            activeCategory === "favorites"
              ? "bg-accent font-medium text-accent-foreground shadow-[inset_2px_0_0_0_hsl(var(--brand))]"
              : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent/50 [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
          )}
        >
          <span>★ Favorites</span>
          <span className="text-xs tabular-nums text-muted-foreground">{prefs.favorites.length}</span>
        </button>

        <CategoryNav
          categories={CATEGORIES}
          active={activeCategory === "favorites" ? "all" : activeCategory}
          onSelect={(c) => setActiveCategory(c)}
          counts={counts}
        />

        {prefs.recents.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="px-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recent</p>
            {prefs.recents.slice(0, 5).map((id) => {
              const tool = TOOL_REGISTRY.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(tool)}
                  className="truncate rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground motion-reduce:transition-none"
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Press <kbd>⌘K</kbd> to search ·{" "}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="underline-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
            >
              ?
            </button>{" "}
            for shortcuts
          </p>
          <SettingsMenu prefs={prefs} onImport={importPrefs} />
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-7">
          <div className="animate-fade-up motion-reduce:animate-none">
            <h2 className="text-2xl font-semibold tracking-tight">
              {activeCategory === "favorites"
                ? "Favorites"
                : activeCategory === "all"
                  ? "All Tools"
                  : CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={handleSelect}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={handleToggleFavorite}
                className="stagger-in"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
