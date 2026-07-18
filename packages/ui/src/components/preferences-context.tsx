"use client";

import { createContext } from "react";
import type { UserPreferences } from "../lib/preferences";
import type { AppearancePreferences } from "../lib/appearance";
import type { HomeLayout } from "../lib/home-layout";

export interface PreferencesContextValue {
  prefs: UserPreferences;
  loaded: boolean;
  toggleFavorite: (toolId: string) => Promise<void>;
  addRecent: (toolId: string) => Promise<void>;
  setHome: (home: HomeLayout) => Promise<void>;
  updateHome: (updater: (home: HomeLayout) => HomeLayout) => Promise<void>;
  setAppearance: (appearance: AppearancePreferences) => Promise<void>;
  updateAppearance: (
    updater: (appearance: AppearancePreferences) => AppearancePreferences
  ) => Promise<void>;
  importPrefs: (imported: UserPreferences) => Promise<void>;
  isFavorite: (toolId: string) => boolean;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
