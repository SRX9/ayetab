"use client";

import { createContext } from "react";
import type { BentoTile, UserPreferences } from "../lib/preferences";
import type { AppearancePreferences } from "../lib/appearance";

export interface PreferencesContextValue {
  prefs: UserPreferences;
  loaded: boolean;
  toggleFavorite: (toolId: string) => Promise<void>;
  addRecent: (toolId: string) => Promise<void>;
  setAppearance: (appearance: AppearancePreferences) => Promise<void>;
  updateAppearance: (
    updater: (appearance: AppearancePreferences) => AppearancePreferences
  ) => Promise<void>;
  updateBento: (bento: BentoTile[] | undefined) => Promise<void>;
  importPrefs: (imported: UserPreferences) => Promise<void>;
  isFavorite: (toolId: string) => boolean;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
