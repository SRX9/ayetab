/** Light-only product. ThemeMode is pinned to "light". */
export type ThemeMode = "light";

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
  theme: "light",
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
  return { theme: "light", wallpaper: normalizeWallpaper(raw?.wallpaper) };
}

/** Light-only: always resolves to "light". */
export function resolveTheme(): "light" {
  return "light";
}
