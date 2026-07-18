"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePreferences } from "../hooks/use-preferences";
import { useTheme } from "../hooks/use-theme";

/**
 * Hydrates ThemeProvider from appearance prefs once loaded,
 * and persists quick theme-toggle changes back into prefs.
 */
export function AppearanceSync({ children }: { children?: ReactNode }) {
  const { prefs, loaded, updateAppearance } = usePreferences();
  const { theme, setTheme } = useTheme();
  const hydrated = useRef(false);
  const skipPersist = useRef(false);

  useEffect(() => {
    if (!loaded || hydrated.current) return;
    hydrated.current = true;
    if (prefs.appearance.theme !== theme) {
      skipPersist.current = true;
      setTheme(prefs.appearance.theme);
    }
  }, [loaded, prefs.appearance.theme, theme, setTheme]);

  useEffect(() => {
    if (!loaded || !hydrated.current) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (prefs.appearance.theme === theme) return;
    void updateAppearance((a) => ({ ...a, theme }));
  }, [theme, loaded, prefs.appearance.theme, updateAppearance]);

  return children ?? null;
}
