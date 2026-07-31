"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  fuzzySearchTools,
  type ToolDefinition,
} from "@ayetab/utils";
import {
  AppearanceSync,
  CommandPalette,
  FadeScroller,
  OnboardingModal,
  PreferencesProvider,
  SettingsButton,
  ShortcutsProvider,
  ThemeProvider,
  ThemeToggle,
  ToolCard,
  ToolHost,
  usePreferences,
} from "@ayetab/ui";
import { EXTENSION_TOOLS, openWebOnlyTool } from "../lib/extension-tools";

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
  const [query, setQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [initialInput, setInitialInput] = useState("");
  const [sessionRestored, setSessionRestored] = useState(false);
  const { prefs, toggleFavorite, isFavorite, addRecent } = usePreferences();

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

  const favoriteTools = useMemo(
    () => prefs.favorites.flatMap((id) => EXTENSION_TOOLS.filter((t) => t.id === id)),
    [prefs.favorites]
  );

  /**
   * Same grouped list as the new tab's sidebar. The panel is too narrow for two
   * panes, so the list and the tool take turns instead of sitting side by side.
   */
  const groups = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed) {
      return [
        {
          id: "results",
          label: "Results",
          tools: fuzzySearchTools(trimmed, EXTENSION_TOOLS).map((r) => r.tool),
        },
      ];
    }

    const out: Array<{ id: string; label: string; tools: ToolDefinition[] }> = [];
    if (favoriteTools.length > 0) {
      out.push({ id: "favorites", label: "Favorites", tools: favoriteTools });
    }
    for (const category of ALL_CATEGORIES) {
      const list = EXTENSION_TOOLS.filter((t) => t.category === category);
      if (list.length > 0) {
        out.push({ id: category, label: CATEGORY_LABELS[category], tools: list });
      }
    }
    return out;
  }, [query, favoriteTools]);

  const resultCount = groups.reduce((n, g) => n + g.tools.length, 0);

  const openTool = useCallback((tool: ToolDefinition, input = "") => {
    // Reachable via recents synced from the new tab / web app.
    if (openWebOnlyTool(tool, input)) return;
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
          <CommandPalette
            tools={EXTENSION_TOOLS}
            onSelect={(t) => openTool(t)}
            recentIds={prefs.recents}
          />
          <header className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedTool(null);
                setInitialInput("");
              }}
              className="inline-flex items-center gap-0.5 rounded px-1.5 py-1 text-caption text-muted-foreground transition-colors hover:bg-[hsl(var(--hover-fill))] hover:text-foreground"
            >
              <HugeiconsIcon
                icon={ChevronLeftIcon}
                size={14}
                strokeWidth={1.75}
                color="currentColor"
                aria-hidden
              />
              Back
            </button>
            <span className="flex-1 truncate text-caption font-medium">{selectedTool.name}</span>
            <SettingsButton />
            <ThemeToggle />
          </header>
          <div className="flex-1 overflow-auto p-3">
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
      <div className="flex h-screen flex-col text-foreground">
        <CommandPalette
          tools={EXTENSION_TOOLS}
          onSelect={(t) => openTool(t)}
          recentIds={prefs.recents}
        />
        <header className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
          <h1 className="flex-1 truncate ps-1 text-ui font-semibold">AyeTab</h1>
          <SettingsButton />
          <ThemeToggle />
        </header>

        <div className="shrink-0 px-2 py-2">
          <div className="field flex items-center gap-2 px-2 py-1.5">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.75}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools"
              aria-label="Search tools"
              className="w-full min-w-0 bg-transparent text-ui outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
        </div>

        <FadeScroller
          as="nav"
          aria-label="Tools"
          className="flex-1"
          scrollerClassName="px-1.5 pb-2"
          edgeHeight="1.75rem"
        >
          {resultCount === 0 ? (
            <p className="px-2 py-6 text-caption text-muted-foreground">No tools match “{query}”.</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="mb-2 last:mb-0">
                <h2 className="px-2 pb-0.5 pt-1 text-label font-medium uppercase text-muted-foreground">
                  {group.label}
                </h2>
                <ul>
                  {group.tools.map((tool) => (
                    <li key={`${group.id}-${tool.id}`}>
                      <ToolCard
                        tool={tool}
                        onClick={(t) => openTool(t)}
                        isFavorite={isFavorite(tool.id)}
                        onToggleFavorite={handleToggleFavorite}
                        compact
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </FadeScroller>
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
