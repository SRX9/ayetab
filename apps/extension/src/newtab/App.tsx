import { useCallback, useEffect, useState } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import {
  AppShell,
  AppearanceSync,
  CommandPaletteProvider,
  OnboardingModal,
  PreferencesProvider,
  ShortcutsProvider,
  ThemeProvider,
  ToolIndex,
  usePreferences,
} from "@ayetab/ui";
import { EXTENSION_TOOLS, openWebOnlyTool } from "../lib/extension-tools";
import { FirstRunNotice } from "./first-run-notice";
import { ToolView, WebOnlyToolsSection } from "./tool-view";
import { navigate, parseRoute, toolHash, type Route } from "./route";

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
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
      >
        {route.kind === "tool" ? (
          <ToolView toolId={route.toolId} initialInput={route.input} onNavigate={handleNavigate} />
        ) : (
          <>
            <FirstRunNotice />
            <ToolIndex
              tools={EXTENSION_TOOLS}
              onSelect={openTool}
              footer={<WebOnlyToolsSection />}
            />
          </>
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
