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
          <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
          <header className="flex shrink-0 items-center gap-2 border-b border-border/80 bg-card/40 px-3 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                setSelectedTool(null);
                setInitialInput("");
              }}
              className="text-xs text-muted-foreground transition-[transform,color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground motion-reduce:transition-none"
            >
              ← Back
            </button>
            <span className="flex-1 truncate text-xs font-medium tracking-tight">{selectedTool.name}</span>
            <ThemeToggle />
          </header>
          <div className={`flex-1 overflow-auto p-3 ${selectedTool.id === "excalidraw" ? "flex flex-col" : ""}`}>
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
      </>
    );
  }

  return (
    <>
      {modals}
      <div className="flex h-screen flex-col bg-background text-foreground">
        <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
        <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border/80 bg-card/40 px-3 py-3 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-brand text-[9px] font-bold text-brand-foreground">
                A
              </span>
              <h1 className="text-sm font-bold tracking-tight">AyeTab</h1>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Developer Utilities</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="px-3 pb-2 pt-2">
          <SettingsMenu prefs={prefs} onImport={importPrefs} compact />
        </div>

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="border-b border-border p-3">
            <SearchBar tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} placeholder="Search tools..." />
          </div>

          {prefs.favorites.length > 0 && (
            <div className="border-b border-border p-2">
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
            <nav className="flex w-32 shrink-0 flex-col gap-1 overflow-auto border-r border-border p-2">
              <button
                type="button"
                onClick={() => setActiveCategory("favorites")}
                className={cn(
                  "rounded-md px-2 py-1.5 text-left text-xs transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:transition-none",
                  activeCategory === "favorites"
                    ? "bg-accent font-medium"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent/50"
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
                <div className="mt-2 border-t border-border pt-2">
                  <p className="mb-1 px-2 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Recent</p>
                  {prefs.recents.slice(0, 4).map((id) => {
                    const tool = TOOL_REGISTRY.find((t) => t.id === id);
                    if (!tool) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => openTool(tool)}
                        className="w-full truncate rounded-md px-2 py-1 text-left text-[10px] text-muted-foreground transition-[background-color,color] duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent"
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
              <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {activeCategory === "favorites"
                  ? "Favorites"
                  : activeCategory === "all"
                    ? "All Tools"
                    : CATEGORY_LABELS[activeCategory]}
              </p>
              <div className="flex flex-col gap-1">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group flex items-center gap-2 rounded-md px-2 py-2 transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.99] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent motion-reduce:transition-none"
                  >
                    <button
                      type="button"
                      onClick={() => openTool(tool)}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                    >
                      <span className="text-xs font-medium">{tool.name}</span>
                      <span className="line-clamp-1 text-[10px] text-muted-foreground">{tool.description}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(tool)}
                      className={cn(
                        "shrink-0 text-xs transition-[transform,color] duration-150 ease-out-strong active:scale-[0.97]",
                        isFavorite(tool.id) ? "text-favorite" : "text-muted-foreground"
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
