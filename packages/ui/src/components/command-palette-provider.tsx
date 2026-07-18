"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { CommandPalette } from "./command-palette";
import { CommandPaletteContext } from "./command-palette-context";

const EMPTY_RECENT_IDS: string[] = [];

interface CommandPaletteProviderProps {
  children: ReactNode;
  tools: ToolDefinition[];
  onSelect: (tool: ToolDefinition) => void;
  recentIds?: string[];
}

export function CommandPaletteProvider({
  children,
  tools,
  onSelect,
  recentIds = EMPTY_RECENT_IDS,
}: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo(
    () => ({ open: openPalette, close: closePalette, toggle: togglePalette }),
    [openPalette, closePalette, togglePalette]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette
        tools={tools}
        onSelect={onSelect}
        open={open}
        onOpenChange={setOpen}
        recentIds={recentIds}
      />
    </CommandPaletteContext.Provider>
  );
}
