"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider,
  CommandPaletteProvider,
  ShortcutsProvider,
  usePreferences,
} from "@ayetab/ui";
import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";
import type { ReactNode } from "react";

function AppChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { prefs } = usePreferences();

  const handleSelect = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  return (
    <ShortcutsProvider>
      <CommandPaletteProvider tools={TOOL_REGISTRY} onSelect={handleSelect} recentIds={prefs.recents}>
        {children}
      </CommandPaletteProvider>
    </ShortcutsProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppChrome>{children}</AppChrome>
    </ThemeProvider>
  );
}
