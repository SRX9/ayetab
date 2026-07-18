export type ThemeMode = "light" | "dark" | "system";

export interface AppearancePreferences {
  theme: ThemeMode;
  wallpaperId: string;
  /** data: URL for a custom photo wallpaper */
  customWallpaper: string | null;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  /** Short caption shown under the thumbnail */
  caption: string;
}

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  theme: "system",
  wallpaperId: "horizon",
  customWallpaper: null,
};

/** Built-in wallpapers — applied via CSS data-wallpaper attribute */
export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  { id: "horizon", name: "Horizon", caption: "Soft sky" },
  { id: "ocean", name: "Ocean", caption: "Deep blue" },
  { id: "mesa", name: "Mesa", caption: "Warm dusk" },
  { id: "aurora", name: "Aurora", caption: "Northern lights" },
  { id: "graphite", name: "Graphite", caption: "Neutral dark" },
  { id: "mint", name: "Mint", caption: "Cool green" },
  { id: "ember", name: "Ember", caption: "Sunset glow" },
  { id: "fog", name: "Fog", caption: "Soft gray" },
];

export function normalizeAppearance(
  raw: Partial<AppearancePreferences> | undefined | null
): AppearancePreferences {
  const theme =
    raw?.theme === "light" || raw?.theme === "dark" || raw?.theme === "system"
      ? raw.theme
      : DEFAULT_APPEARANCE.theme;

  let wallpaperId =
    typeof raw?.wallpaperId === "string" && raw.wallpaperId.length > 0
      ? raw.wallpaperId
      : DEFAULT_APPEARANCE.wallpaperId;

  const known =
    WALLPAPER_PRESETS.some((w) => w.id === wallpaperId) || wallpaperId === "custom";
  if (!known) wallpaperId = DEFAULT_APPEARANCE.wallpaperId;

  const customWallpaper =
    typeof raw?.customWallpaper === "string" && raw.customWallpaper.startsWith("data:")
      ? raw.customWallpaper
      : null;

  // Fall back to a preset if "custom" is selected but no image is stored
  if (wallpaperId === "custom" && !customWallpaper) {
    wallpaperId = DEFAULT_APPEARANCE.wallpaperId;
  }

  return { theme, wallpaperId, customWallpaper };
}

/** Resolve a stored theme mode to the effective light/dark class */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

/** Max custom wallpaper payload (~1.5MB base64) to keep localStorage healthy */
export const MAX_CUSTOM_WALLPAPER_CHARS = 1_800_000;

export async function fileToWallpaperDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  const bitmap = await createImageBitmap(file);
  const maxEdge = 1920;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  if (dataUrl.length > MAX_CUSTOM_WALLPAPER_CHARS) {
    throw new Error("Image is too large — try a smaller photo");
  }
  return dataUrl;
}
