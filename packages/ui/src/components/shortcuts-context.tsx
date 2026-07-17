"use client";

import { createContext } from "react";

export interface ShortcutsContextValue {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  show: () => void;
  close: () => void;
}

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);
