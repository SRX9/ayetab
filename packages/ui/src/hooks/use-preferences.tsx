"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadPreferences,
  savePreferences,
  toggleFavorite as toggleFavoriteFn,
  addRecent as addRecentFn,
  updateHome as updateHomeFn,
  type UserPreferences,
} from "../lib/preferences";
import { DEFAULT_HOME_LAYOUT, type HomeLayout } from "../lib/home-layout";

interface PreferencesContextValue {
  prefs: UserPreferences;
  loaded: boolean;
  toggleFavorite: (toolId: string) => Promise<void>;
  addRecent: (toolId: string) => Promise<void>;
  setHome: (home: HomeLayout) => Promise<void>;
  updateHome: (updater: (home: HomeLayout) => HomeLayout) => Promise<void>;
  importPrefs: (imported: UserPreferences) => Promise<void>;
  isFavorite: (toolId: string) => boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>({
    favorites: [],
    recents: [],
    home: structuredClone(DEFAULT_HOME_LAYOUT),
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefs(p);
      setLoaded(true);
    });
  }, []);

  const toggleFavorite = useCallback(async (toolId: string) => {
    setPrefs((current) => {
      const next = toggleFavoriteFn(current, toolId);
      void savePreferences(next);
      return next;
    });
  }, []);

  const addRecent = useCallback(async (toolId: string) => {
    setPrefs((current) => {
      if (current.recents[0] === toolId) return current;
      const next = addRecentFn(current, toolId);
      void savePreferences(next);
      return next;
    });
  }, []);

  const setHome = useCallback(async (home: HomeLayout) => {
    setPrefs((current) => {
      const next = updateHomeFn(current, home);
      void savePreferences(next);
      return next;
    });
  }, []);

  const updateHome = useCallback(async (updater: (home: HomeLayout) => HomeLayout) => {
    setPrefs((current) => {
      const next = updateHomeFn(current, updater(current.home));
      void savePreferences(next);
      return next;
    });
  }, []);

  const importPrefs = useCallback(async (imported: UserPreferences) => {
    await savePreferences(imported);
    setPrefs(imported);
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => prefs.favorites.includes(toolId),
    [prefs.favorites]
  );

  const value = useMemo(
    () => ({
      prefs,
      loaded,
      toggleFavorite,
      addRecent,
      setHome,
      updateHome,
      importPrefs,
      isFavorite,
    }),
    [prefs, loaded, toggleFavorite, addRecent, setHome, updateHome, importPrefs, isFavorite]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}
