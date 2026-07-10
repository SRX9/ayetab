"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolDefinition,
  CATEGORY_LABELS,
} from "@ayetab/utils";
import {
  SearchBar,
  CategoryNav,
  CommandPalette,
  ThemeProvider,
  ThemeToggle,
  ToolHost,
  ToolListSection,
  usePreferences,
  OnboardingModal,
  ShortcutsModal,
  useShortcutsModal,
  SettingsMenu,
  cn,
} from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode", "productivity"];

function AppContent() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all" | "favorites">("all");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [initialInput, setInitialInput] = useState("");
  const { prefs, toggleFavorite, isFavorite, addRecent, importPrefs } = usePreferences();
  const { open: shortcutsOpen, close: closeShortcuts, setOpen: setShortcutsOpen } = useShortcutsModal();

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

  const openTool = useCallback((tool: ToolDefinition, input = "") => {
    setSelectedTool(tool);
    setInitialInput(input);
  }, []);

  const handleNavigate = useCallback(
    (tool: ToolDefinition, input: string) => openTool(tool, input),
    [openTool]
  );

  const handleToggleFavorite = useCallback(
    (tool: ToolDefinition) => toggleFavorite(tool.id),
    [toggleFavorite]
  );

  const modals = (
    <>
      <OnboardingModal />
      <ShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />
    </>
  );

  if (selectedTool) {
    return (
      <>
        {modals}
        <div className="flex h-screen flex-col bg-background text-foreground">
          <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} recentIds={prefs.recents} />
          <header className="material-sidebar flex shrink-0 items-center gap-2 border-b-0 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTool(null);
                setInitialInput("");
              }}
              className="rounded-lg px-2 py-1 text-xs text-muted-foreground transition-[transform,color,background-color] duration-100 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            >
              ← Back
            </button>
            <span className="flex-1 truncate text-xs font-medium tracking-tight">{selectedTool.name}</span>
            <ThemeToggle />
          </header>
          <div className={`flex-1 overflow-auto p-3 ${selectedTool.id === "excalidraw" ? "flex flex-col" : ""}`}>
            <div className={selectedTool.id === "excalidraw" ? "flex flex-1 flex-col" : "material-window rounded-xl p-3"}>
              <ToolHost
                key={`${selectedTool.id}-${initialInput}`}
                tool={selectedTool}
                initialInput={initialInput}
                onNavigate={handleNavigate}
                onRecent={addRecent}
                isFavorite={isFavorite(selectedTool.id)}
                onToggleFavorite={() => toggleFavorite(selectedTool.id)}
                compact
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {modals}
      <div className="flex h-screen flex-col bg-background text-foreground">
        <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} recentIds={prefs.recents} />
        <header className="material-sidebar flex shrink-0 items-start justify-between gap-2 border-b-0 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-selection text-[10px] font-bold text-selection-foreground">
              A
            </span>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AyeTab</h1>
              <p className="text-[10px] text-muted-foreground">Quick tools</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="px-3 pb-2 pt-2">
          <SettingsMenu prefs={prefs} onImport={importPrefs} compact />
        </div>

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="border-b border-border/50 px-3 pb-3">
            <SearchBar tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} placeholder="Search tools..." />
          </div>

          {prefs.favorites.length > 0 && (
            <div className="border-b border-border/50 p-2">
              <ToolListSection
                title="Favorites"
                toolIds={prefs.favorites}
                onSelect={(t) => openTool(t)}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                compact
              />
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            <nav className="material-sidebar flex w-[7.5rem] shrink-0 flex-col gap-1 overflow-auto border-r-0 p-2">
              <button
                type="button"
                onClick={() => setActiveCategory("favorites")}
                className={cn(
                  "rounded-[8px] px-2 py-1.5 text-left text-xs transition-[transform,background-color,color] duration-100 ease-out-strong active:scale-[0.98]",
                  activeCategory === "favorites"
                    ? "bg-selection font-medium text-selection-foreground"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                )}
              >
                ★ Fav ({prefs.favorites.length})
              </button>
              <CategoryNav
                categories={CATEGORIES}
                active={activeCategory === "favorites" ? "all" : activeCategory}
                onSelect={(c) => setActiveCategory(c)}
                counts={counts}
              />
              {prefs.recents.length > 0 && (
                <div className="mt-2 border-t border-border/50 pt-2">
                  <p className="mb-1 px-2 text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Recent</p>
                  {prefs.recents.slice(0, 4).map((id) => {
                    const tool = TOOL_REGISTRY.find((t) => t.id === id);
                    if (!tool) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => openTool(tool)}
                        className="w-full truncate rounded-[8px] px-2 py-1 text-left text-[10px] text-muted-foreground transition-colors duration-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                      >
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="mt-auto px-2 py-1 text-left text-[10px] text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
              >
                Shortcuts ?
              </button>
            </nav>

            <div className="flex-1 overflow-auto p-2">
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {activeCategory === "favorites"
                  ? "Favorites"
                  : activeCategory === "all"
                    ? "All Tools"
                    : CATEGORY_LABELS[activeCategory]}
              </p>
              <div className="material-window flex flex-col rounded-xl p-1">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group flex items-center gap-1 rounded-lg px-1 transition-[background-color] duration-100 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection-soft"
                  >
                    <button
                      type="button"
                      onClick={() => openTool(tool)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-2 text-left"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border border-border/70 bg-muted/50 text-[10px] font-semibold text-muted-foreground">
                        {tool.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{tool.name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">{tool.description}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(tool)}
                      className={cn(
                        "mr-1 shrink-0 text-xs transition-[transform,color] duration-100 ease-out-strong active:scale-[0.97]",
                        isFavorite(tool.id) ? "text-favorite" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                      aria-label={isFavorite(tool.id) ? "Remove favorite" : "Add favorite"}
                    >
                      {isFavorite(tool.id) ? "★" : "☆"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
