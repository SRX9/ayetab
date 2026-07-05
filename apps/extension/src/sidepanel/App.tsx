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
} from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode"];

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
        <div className="h-screen flex flex-col bg-background text-foreground">
        <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
        <header className="border-b border-border px-3 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSelectedTool(null);
              setInitialInput("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <span className="text-xs font-medium truncate flex-1">{selectedTool.name}</span>
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
      <div className="h-screen flex flex-col bg-background text-foreground">
      <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
      <header className="border-b border-border px-3 py-3 shrink-0 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-sm font-bold tracking-tight">AyeTab</h1>
          <p className="text-[10px] text-muted-foreground">Developer Utilities</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="px-3 pb-2">
        <SettingsMenu prefs={prefs} onImport={importPrefs} compact />
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="p-3 border-b border-border">
          <SearchBar tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} placeholder="Search tools..." />
        </div>

        {prefs.favorites.length > 0 && (
          <div className="p-2 border-b border-border">
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
          <nav className="w-32 shrink-0 border-r border-border p-2 overflow-auto flex flex-col gap-1">
            <button
              onClick={() => setActiveCategory("favorites")}
              className={`rounded-md px-2 py-1.5 text-xs text-left ${
                activeCategory === "favorites" ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50"
              }`}
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
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[9px] text-muted-foreground uppercase px-2 mb-1">Recent</p>
                {prefs.recents.slice(0, 4).map((id) => {
                  const tool = TOOL_REGISTRY.find((t) => t.id === id);
                  if (!tool) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => openTool(tool)}
                      className="w-full rounded-md px-2 py-1 text-[10px] text-left text-muted-foreground hover:bg-accent truncate"
                    >
                      {tool.name}
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          <div className="flex-1 overflow-auto p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">
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
                  className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent transition-colors"
                >
                  <button
                    onClick={() => openTool(tool)}
                    className="flex-1 flex flex-col gap-0.5 text-left min-w-0"
                  >
                    <span className="text-xs font-medium">{tool.name}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{tool.description}</span>
                  </button>
                  <button
                    onClick={() => handleToggleFavorite(tool)}
                    className={`text-xs shrink-0 ${isFavorite(tool.id) ? "text-amber-500" : "text-muted-foreground"}`}
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
