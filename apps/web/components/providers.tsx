"use client";

import { useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  AppearanceSync,
  CommandPaletteProvider,
  PreferencesProvider,
  ShortcutsProvider,
  ThemeProvider,
  usePreferences,
} from "@ayetab/ui";
import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";

const TOOL_PATH = "/tools/";

function AppChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { prefs } = usePreferences();

  const handleSelect = useCallback(
    (tool: ToolDefinition) => router.push(`${TOOL_PATH}${tool.id}`),
    [router]
  );

  const activeToolId = pathname?.startsWith(TOOL_PATH)
    ? decodeURIComponent(pathname.slice(TOOL_PATH.length))
    : undefined;

  const handleHome = useCallback(() => router.push("/"), [router]);

  return (
    <AppearanceSync>
      <ShortcutsProvider>
        <CommandPaletteProvider
          tools={TOOL_REGISTRY}
          onSelect={handleSelect}
          recentIds={prefs.recents}
        >
          {/*
            The shell lives above the route so the dock stays put while the
            content surface navigates between tools.
          */}
          <AppShell
            tools={TOOL_REGISTRY}
            activeToolId={activeToolId}
            onSelectTool={handleSelect}
            toolHref={(tool) => `${TOOL_PATH}${tool.id}`}
            onHome={handleHome}
          >
            {children}
          </AppShell>
        </CommandPaletteProvider>
      </ShortcutsProvider>
    </AppearanceSync>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AppChrome>{children}</AppChrome>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
