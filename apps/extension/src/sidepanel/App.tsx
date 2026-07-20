"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, StarIcon } from "@hugeicons/core-free-icons";
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
  ToolCard,
  ToolListSection,
  usePreferences,
  PreferencesProvider,
  OnboardingModal,
  useShortcutsModal,
  SettingsButton,
  AppearanceSync,
  ShortcutsProvider,
  cn,
} from "@ayetab/ui";

/** Tools that rely on CSP-unsafe libraries (e.g. Excalidraw) — web app only. */
const EXTENSION_EXCLUDED_TOOL_IDS = new Set(["excalidraw"]);

const EXTENSION_TOOLS = TOOL_REGISTRY.filter((t) => !EXTENSION_EXCLUDED_TOOL_IDS.has(t.id));

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode", "productivity"];

const SESSION_TOOL_KEY = "ayetab-active-tool";

const modals = <OnboardingModal />;

function readSessionTool(): { id: string; input: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_TOOL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; input?: string };
    if (!parsed.id) return null;
    return { id: parsed.id, input: parsed.input ?? "" };
  } catch {
    return null;
  }
}

function writeSessionTool(tool: ToolDefinition | null, input: string) {
  try {
    if (!tool) {
      sessionStorage.removeItem(SESSION_TOOL_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_TOOL_KEY, JSON.stringify({ id: tool.id, input }));
  } catch {
    // Ignore quota / private-mode failures
  }
}

function AppContent() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all" | "favorites">("all");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [initialInput, setInitialInput] = useState("");
  const [sessionRestored, setSessionRestored] = useState(false);
  const { prefs, toggleFavorite, isFavorite, addRecent } = usePreferences();
  const { setOpen: setShortcutsOpen } = useShortcutsModal();

  useEffect(() => {
    const saved = readSessionTool();
    if (saved) {
      const tool = EXTENSION_TOOLS.find((t) => t.id === saved.id);
      if (tool) {
        setSelectedTool(tool);
        setInitialInput(saved.input);
      }
    }
    setSessionRestored(true);
  }, []);

  useEffect(() => {
    if (!sessionRestored) return;
    writeSessionTool(selectedTool, initialInput);
  }, [selectedTool, initialInput, sessionRestored]);

  const filteredTools = useMemo(() => {
    if (activeCategory === "favorites") {
      return EXTENSION_TOOLS.filter((t) => prefs.favorites.includes(t.id));
    }
    if (activeCategory === "all") return EXTENSION_TOOLS;
    return EXTENSION_TOOLS.filter((t) => t.category === activeCategory);
  }, [activeCategory, prefs.favorites]);

  const counts = useMemo(() => {
    const c: Record<ToolCategory | "all", number> = {
      all: EXTENSION_TOOLS.length,
      format: 0,
      convert: 0,
      inspect: 0,
      generate: 0,
      encode: 0,
      productivity: 0,
    };
    for (const t of EXTENSION_TOOLS) c[t.category]++;
    return c;
  }, []);

  const openTool = useCallback((tool: ToolDefinition, input = "") => {
    if (EXTENSION_EXCLUDED_TOOL_IDS.has(tool.id)) return;
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

  if (selectedTool) {
    return (
      <>
        {modals}
        <div className="flex h-screen flex-col text-foreground">
          <CommandPalette tools={EXTENSION_TOOLS} onSelect={(t) => openTool(t)} recentIds={prefs.recents} />
          <header className="material-sidebar flex shrink-0 items-center gap-2 border-b-0 px-3 py-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedTool(null);
                setInitialInput("");
              }}
              className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-xs text-muted-foreground transition-[transform,color,background-color] duration-100 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
            >
              <HugeiconsIcon icon={ChevronLeftIcon} size={14} strokeWidth={1.75} color="currentColor" aria-hidden />
              Back
            </button>
            <span className="flex-1 truncate text-xs font-medium tracking-tight">{selectedTool.name}</span>
            <SettingsButton hideWallpaper />
            <ThemeToggle />
          </header>
          <div className="flex-1 overflow-auto p-3">
            <div className="material-window rounded-[16px] p-3">
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
      <div className="flex h-screen flex-col text-foreground">
        <CommandPalette tools={EXTENSION_TOOLS} onSelect={(t) => openTool(t)} recentIds={prefs.recents} />
        <header className="material-sidebar flex shrink-0 items-start justify-between gap-2 border-b-0 px-3 py-3">
          <div>
            <h1 className="text-sm font-semibold tracking-tight">AyeTab</h1>
            <p className="text-[10px] text-muted-foreground">Quick tools · offline</p>
          </div>
          <div className="flex items-center gap-1">
            <SettingsButton compact hideWallpaper />
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="border-b border-border/40 px-3 pb-3">
            <SearchBar tools={EXTENSION_TOOLS} onSelect={(t) => openTool(t)} placeholder="Search tools..." />
          </div>

          {prefs.favorites.length > 0 && (
            <div className="border-b border-border/40 p-2">
              <ToolListSection
                title="Favorites"
                toolIds={prefs.favorites.filter((id) => !EXTENSION_EXCLUDED_TOOL_IDS.has(id))}
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
                  "flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-left text-xs transition-[transform,background-color,color] duration-100 ease-out-strong active:scale-[0.98]",
                  activeCategory === "favorites"
                    ? "nav-active"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                )}
              >
                <HugeiconsIcon
                  icon={StarIcon}
                  size={12}
                  strokeWidth={1.75}
                  color="currentColor"
                  className="shrink-0"
                  fill={activeCategory === "favorites" ? "currentColor" : "none"}
                  aria-hidden
                />
                Fav ({prefs.favorites.filter((id) => !EXTENSION_EXCLUDED_TOOL_IDS.has(id)).length})
              </button>
              <CategoryNav
                categories={CATEGORIES}
                active={activeCategory === "favorites" ? "all" : activeCategory}
                onSelect={(c) => setActiveCategory(c)}
                counts={counts}
              />
              {prefs.recents.length > 0 && (
                <div className="mt-2 border-t border-border/40 pt-2">
                  <p className="mb-1 px-2 text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Recent</p>
                  {prefs.recents.slice(0, 4).map((id) => {
                    const tool = EXTENSION_TOOLS.find((t) => t.id === id);
                    if (!tool) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => openTool(tool)}
                        className="w-full truncate rounded-[10px] px-2 py-1 text-left text-[10px] text-muted-foreground transition-colors duration-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
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
              <div className="material-window flex flex-col rounded-[16px] p-1">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onClick={(t) => openTool(t)}
                    isFavorite={isFavorite(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    compact
                  />
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
      <PreferencesProvider>
        <AppearanceSync>
          <ShortcutsProvider>
            <AppContent />
          </ShortcutsProvider>
        </AppearanceSync>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
