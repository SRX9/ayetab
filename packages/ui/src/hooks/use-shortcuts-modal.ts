"use client";

import { useContext } from "react";
import { ShortcutsContext } from "../components/shortcuts-context";

export function useShortcutsModal() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) {
    throw new Error("useShortcutsModal must be used within ShortcutsProvider");
  }
  return ctx;
}

export function useShortcutsModalOptional() {
  return useContext(ShortcutsContext);
}
