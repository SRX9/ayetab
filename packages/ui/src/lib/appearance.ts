export type ThemeMode = "light" | "dark" | "system";

export interface AppearancePreferences {
  theme: ThemeMode;
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: "system",
};

export function normalizeAppearance(
  raw: Partial<AppearancePreferences> | undefined | null
): AppearancePreferences {
  const theme =
    raw?.theme === "light" || raw?.theme === "dark" || raw?.theme === "system"
      ? raw.theme
      : DEFAULT_APPEARANCE.theme;

  return { theme };
}

/** Resolve a stored theme mode to the effective light/dark class */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}
