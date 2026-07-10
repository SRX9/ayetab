"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  useShortcutsModal,
  SettingsMenu,
  cn,
} from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode", "productivity"];

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all" | "favorites">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { prefs, toggleFavorite, isFavorite, importPrefs } = usePreferences();
  const { setOpen: setShortcutsOpen } = useShortcutsModal();

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

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory, filteredTools.length]);

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-list-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  /* Arrow-key list navigation — Raycast quick-access (never open on arrow) */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't steal keys while a dialog/palette is open
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, Math.max(filteredTools.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const tool = filteredTools[activeIndex];
        if (!tool) return;
        e.preventDefault();
        e.stopPropagation();
        handleSelect(tool);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [filteredTools, activeIndex, handleSelect]);

  return (
    <div className="flex min-h-screen">
      <OnboardingModal />

      <aside className="material-sidebar sticky top-0 flex h-screen w-[220px] shrink-0 flex-col gap-4 px-3 py-4">
        <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-selection text-[12px] font-bold text-selection-foreground shadow-sm">
              A
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-tight">AyeTab</h1>
              <p className="truncate text-[11px] text-muted-foreground">Quick tools</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setActiveCategory("favorites")}
          className={cn(
            "flex items-center justify-between rounded-[9px] px-2.5 py-[7px] text-left text-[13px]",
            "transition-[transform,background-color,color] duration-100 ease-out-strong active:scale-[0.98]",
            "motion-reduce:transition-none motion-reduce:active:scale-100",
            activeCategory === "favorites"
              ? "bg-selection font-medium text-selection-foreground shadow-sm"
              : "text-foreground/80 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
          )}
        >
          <span>★ Favorites</span>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              activeCategory === "favorites" ? "text-selection-foreground/75" : "text-muted-foreground"
            )}
          >
            {prefs.favorites.length}
          </span>
        </button>

        <CategoryNav
          categories={CATEGORIES}
          active={activeCategory === "favorites" ? "all" : activeCategory}
          onSelect={(c) => setActiveCategory(c)}
          counts={counts}
        />

        {prefs.recents.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Recent
            </p>
            {prefs.recents.slice(0, 5).map((id) => {
              const tool = TOOL_REGISTRY.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(tool)}
                  className="truncate rounded-[9px] px-2.5 py-1.5 text-left text-[12px] text-muted-foreground transition-[background-color,color,transform] duration-100 ease-out-strong active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                >
                  {tool.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2.5 px-1 pb-1">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <kbd className="mr-0.5">⌘</kbd>
            <kbd>K</kbd>
            <span className="mx-1">search</span>
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="text-foreground/70 underline-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
            >
              ?
            </button>
          </p>
          <SettingsMenu prefs={prefs} onImport={importPrefs} />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-7 md:px-10 md:py-9">
          <div className="animate-fade-up motion-reduce:animate-none">
            <p className="text-[12px] font-medium text-muted-foreground">
              {activeCategory === "favorites"
                ? "Favorites"
                : activeCategory === "all"
                  ? "Library"
                  : CATEGORY_LABELS[activeCategory]}
            </p>
            <h2 className="mt-1 text-[28px] font-semibold tracking-tight">
              {activeCategory === "favorites"
                ? "Favorites"
                : activeCategory === "all"
                  ? "All Tools"
                  : CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} available · ↑↓ to move · ↵ to open
            </p>
          </div>

          <SearchBar tools={TOOL_REGISTRY} onSelect={handleSelect} />

          {activeCategory === "all" && prefs.favorites.length > 0 && (
            <div className="material-window overflow-hidden rounded-2xl p-2">
              <ToolListSection
                title="Favorites"
                toolIds={prefs.favorites}
                onSelect={handleSelect}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}

          <div ref={listRef} className="material-window overflow-hidden rounded-2xl p-1.5">
            {filteredTools.length === 0 ? (
              <p className="px-3 py-12 text-center text-sm text-muted-foreground">No tools in this list</p>
            ) : (
              filteredTools.map((tool, i) => (
                <div key={tool.id} data-list-active={i === activeIndex || undefined}>
                  <ToolCard
                    tool={tool}
                    onClick={handleSelect}
                    isFavorite={isFavorite(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    selected={i === activeIndex}
                    className="stagger-in"
                    onMouseEnter={() => setActiveIndex(i)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
