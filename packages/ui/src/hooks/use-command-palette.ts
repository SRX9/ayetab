"use client";

import { useContext } from "react";
import { CommandPaletteContext } from "../components/command-palette-context";

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
