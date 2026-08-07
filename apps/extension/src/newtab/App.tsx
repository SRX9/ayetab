import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import {
  AppShell,
  AppearanceSync,
  CommandPaletteProvider,
  OnboardingModal,
  PreferencesProvider,
  ShortcutsProvider,
  TabHome,
  ThemeProvider,
  usePreferences,
} from "@ayetab/ui";
import { EXTENSION_TOOLS, openWebOnlyTool } from "../lib/extension-tools";
import { FirstRunNotice } from "./first-run-notice";
import { ToolView, WebOnlyToolsSection } from "./tool-view";
import { navigate, parseRoute, toolHash, homeHash, type Route } from "./route";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getHashSnapshot(): string {
  return window.location.hash;
}

function useHashRoute(): Route {
  // The raw hash string is the snapshot (a stable primitive); parsing is
  // memoized so the Route object identity only changes when the hash does.
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot);
  return useMemo(() => parseRoute(hash), [hash]);
}

function NewTab() {
  const route = useHashRoute();
  const { prefs } = usePreferences();

  const openTool = useCallback((tool: ToolDefinition, input = "") => {
    if (openWebOnlyTool(tool, input)) return;
    navigate(toolHash(tool.id, input));
  }, []);

  const handleNavigate = useCallback(
    (tool: ToolDefinition, input: string) => openTool(tool, input),
    [openTool]
  );

  return (
    // Wraps every view so ⌘K works throughout, and so `SearchBar` resolves to
    // the shared palette rather than growing a second, differently-scoped one.
    <CommandPaletteProvider
      tools={EXTENSION_TOOLS}
      onSelect={(t) => openTool(t)}
      recentIds={prefs.recents}
    >
      <OnboardingModal />
      <AppShell
        tools={EXTENSION_TOOLS}
        activeToolId={route.kind === "tool" ? route.toolId : undefined}
        onSelectTool={openTool}
        toolHref={(tool) => toolHash(tool.id)}
        onHome={() => navigate(homeHash())}
      >
        {route.kind === "tool" ? (
          <ToolView toolId={route.toolId} initialInput={route.input} onNavigate={handleNavigate} />
        ) : (
          <TabHome tools={EXTENSION_TOOLS} onOpenTool={openTool}>
            <FirstRunNotice />
            <div className="mt-8">
              <WebOnlyToolsSection />
            </div>
          </TabHome>
        )}
      </AppShell>
    </CommandPaletteProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AppearanceSync>
          <ShortcutsProvider>
            <NewTab />
          </ShortcutsProvider>
        </AppearanceSync>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
