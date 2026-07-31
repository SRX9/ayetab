"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  loadPreferences,
  savePreferences,
  savePreferencesPatch,
  subscribePreferences,
  toggleFavorite as toggleFavoriteFn,
  addRecent as addRecentFn,
  updateAppearance as updateAppearanceFn,
  type UserPreferences,
} from "../lib/preferences";
import { DEFAULT_APPEARANCE, type AppearancePreferences } from "../lib/appearance";
import { PreferencesContext } from "./preferences-context";

type PrefsField = keyof UserPreferences;

const PREFS_FIELDS: PrefsField[] = ["favorites", "recents", "appearance"];

/** Every tool open calls addRecent; batching keeps many open tabs from thrashing storage. */
const RECENTS_DEBOUNCE_MS = 500;

function fieldPatch<K extends PrefsField>(
  field: K,
  value: UserPreferences[K]
): Partial<UserPreferences> {
  return { [field]: value } as Partial<UserPreferences>;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(() => ({
    favorites: [],
    recents: [],
    appearance: { ...DEFAULT_APPEARANCE },
  }));
  const [loaded, setLoaded] = useState(false);

  /**
   * Mirrors `prefs` synchronously. Mutations read from here rather than from a
   * `setPrefs` updater so the storage write stays out of render and successive
   * calls in one tick still see each other's result.
   */
  const prefsRef = useRef(prefs);

  /** Fields with a write in flight — incoming storage events for them are our own echo. */
  const busyRef = useRef(new Map<PrefsField, number>());

  const apply = useCallback((next: UserPreferences) => {
    prefsRef.current = next;
    setPrefs(next);
  }, []);

  const markBusy = useCallback((field: PrefsField) => {
    const counts = busyRef.current;
    counts.set(field, (counts.get(field) ?? 0) + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const remaining = (counts.get(field) ?? 1) - 1;
      if (remaining > 0) counts.set(field, remaining);
      else counts.delete(field);
    };
  }, []);

  const commit = useCallback(
    <K extends PrefsField>(field: K, value: UserPreferences[K]) => {
      const release = markBusy(field);
      void savePreferencesPatch(fieldPatch(field, value)).finally(release);
    },
    [markBusy]
  );

  /** Compute the next preferences from the live snapshot, store it, persist one field. */
  const mutate = useCallback(
    <K extends PrefsField>(field: K, compute: (current: UserPreferences) => UserPreferences) => {
      const current = prefsRef.current;
      const next = compute(current);
      if (next === current) return;
      apply(next);
      commit(field, next[field]);
    },
    [apply, commit]
  );

  useEffect(() => {
    void loadPreferences().then((p) => {
      const busy = busyRef.current;
      // A mutation may already have landed before the initial read resolved.
      apply(busy.size === 0 ? p : mergeExternal(prefsRef.current, p, busy));
      setLoaded(true);
    });
  }, [apply]);

  useEffect(
    () =>
      subscribePreferences((external) => {
        apply(mergeExternal(prefsRef.current, external, busyRef.current));
      }),
    [apply]
  );

  const recentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentRelease = useRef<(() => void) | null>(null);

  const flushRecents = useCallback(() => {
    if (recentTimer.current) {
      clearTimeout(recentTimer.current);
      recentTimer.current = null;
    }
    const release = recentRelease.current;
    if (!release) return;
    recentRelease.current = null;
    commit("recents", prefsRef.current.recents);
    release();
  }, [commit]);

  // Don't lose a pending recent when the tab is closed or backgrounded.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushRecents();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushRecents);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushRecents);
      flushRecents();
    };
  }, [flushRecents]);

  const toggleFavorite = useCallback(
    async (toolId: string) => mutate("favorites", (c) => toggleFavoriteFn(c, toolId)),
    [mutate]
  );

  const addRecent = useCallback(
    async (toolId: string) => {
      const current = prefsRef.current;
      if (current.recents[0] === toolId) return;
      apply(addRecentFn(current, toolId));
      if (recentTimer.current) clearTimeout(recentTimer.current);
      recentRelease.current ??= markBusy("recents");
      recentTimer.current = setTimeout(flushRecents, RECENTS_DEBOUNCE_MS);
    },
    [apply, markBusy, flushRecents]
  );

  const setAppearance = useCallback(
    async (appearance: AppearancePreferences) =>
      mutate("appearance", (c) => updateAppearanceFn(c, appearance)),
    [mutate]
  );

  const updateAppearance = useCallback(
    async (updater: (appearance: AppearancePreferences) => AppearancePreferences) =>
      mutate("appearance", (c) => updateAppearanceFn(c, updater(c.appearance))),
    [mutate]
  );

  const importPrefs = useCallback(
    async (imported: UserPreferences) => {
      // An import replaces everything, so it writes the whole object rather than a patch.
      const releases = PREFS_FIELDS.map(markBusy);
      apply(imported);
      try {
        await savePreferences(imported);
      } finally {
        for (const release of releases) release();
      }
    },
    [apply, markBusy]
  );

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
      setAppearance,
      updateAppearance,
      importPrefs,
      isFavorite,
    }),
    [
      prefs,
      loaded,
      toggleFavorite,
      addRecent,
      setAppearance,
      updateAppearance,
      importPrefs,
      isFavorite,
    ]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/** Take the external value for every field this context isn't mid-write on. */
function mergeExternal(
  current: UserPreferences,
  external: UserPreferences,
  busy: Map<PrefsField, number>
): UserPreferences {
  return {
    favorites: busy.has("favorites") ? current.favorites : external.favorites,
    recents: busy.has("recents") ? current.recents : external.recents,
    appearance: busy.has("appearance") ? current.appearance : external.appearance,
  };
}
