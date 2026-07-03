"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider,
  CommandPaletteProvider,
  ShortcutsModal,
  useShortcutsModal,
  usePreferences,
} from "@ayetab/ui";
import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";
import type { ReactNode } from "react";

function AppChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { prefs } = usePreferences();
  const { open: shortcutsOpen, close: closeShortcuts } = useShortcutsModal();

  const handleSelect = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  return (
    <CommandPaletteProvider tools={TOOL_REGISTRY} onSelect={handleSelect} recentIds={prefs.recents}>
      <ShortcutsModal open={shortcutsOpen} onClose={closeShortcuts} />
      {children}
    </CommandPaletteProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppChrome>{children}</AppChrome>
    </ThemeProvider>
  );
}
