export type ThemeMode = "light" | "dark" | "system";

/** Built-in macOS-style abstract wallpapers (procedural gradients). */
export type AbstractWallpaperId =
  | "default"
  | "sequoia"
  | "sonoma"
  | "tahoe"
  | "graphite"
  | "dune";

export interface Wallpaper {
  kind: "abstract" | "image";
  /** Abstract preset id, or a data/blob URL when kind === "image". */
  value: string;
}

export interface AppearancePreferences {
  theme: ThemeMode;
  wallpaper: Wallpaper;
}

export const DEFAULT_WALLPAPER: Wallpaper = { kind: "abstract", value: "default" };

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: "system",
  wallpaper: { ...DEFAULT_WALLPAPER },
};

const ABSTRACT_IDS: AbstractWallpaperId[] = [
  "default",
  "sequoia",
  "sonoma",
  "tahoe",
  "graphite",
  "dune",
];

function normalizeWallpaper(raw: Partial<Wallpaper> | undefined | null): Wallpaper {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_WALLPAPER };
  if (raw.kind === "image" && typeof raw.value === "string" && raw.value.length > 0) {
    return { kind: "image", value: raw.value };
  }
  if (
    raw.kind === "abstract" &&
    typeof raw.value === "string" &&
    (ABSTRACT_IDS as string[]).includes(raw.value)
  ) {
    return { kind: "abstract", value: raw.value };
  }
  return { ...DEFAULT_WALLPAPER };
}

export function normalizeAppearance(
  raw: Partial<AppearancePreferences> | undefined | null
): AppearancePreferences {
  const theme =
    raw?.theme === "light" || raw?.theme === "dark" || raw?.theme === "system"
      ? raw.theme
      : DEFAULT_APPEARANCE.theme;

  return { theme, wallpaper: normalizeWallpaper(raw?.wallpaper) };
}

/** Resolve a stored theme mode to the effective light/dark class */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}
