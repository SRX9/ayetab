"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ToolDefinition } from "@ayetab/utils";
import { CommandPalette } from "./command-palette";

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}

export function useCommandPaletteOptional() {
  return useContext(CommandPaletteContext);
}

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
  recentIds = [],
}: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((o) => !o), []);

  return (
    <CommandPaletteContext.Provider value={{ open: openPalette, close: closePalette, toggle: togglePalette }}>
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
