"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadPreferences,
  savePreferences,
  toggleFavorite as toggleFavoriteFn,
  addRecent as addRecentFn,
  type UserPreferences,
} from "../lib/preferences";

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>({ favorites: [], recents: [] });
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

  const isFavorite = useCallback((toolId: string) => prefs.favorites.includes(toolId), [prefs.favorites]);

  return { prefs, loaded, toggleFavorite, addRecent, isFavorite };
}
