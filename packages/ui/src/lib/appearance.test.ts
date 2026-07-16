import { describe, expect, it } from "vitest";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  resolveTheme,
} from "./appearance";

describe("normalizeAppearance", () => {
  it("returns defaults for empty input", () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(normalizeAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
  });

  it("accepts valid theme and wallpaper ids", () => {
    expect(
      normalizeAppearance({ theme: "dark", wallpaperId: "mesa", customWallpaper: null })
    ).toEqual({
      theme: "dark",
      wallpaperId: "mesa",
      customWallpaper: null,
    });
  });

  it("falls back from custom without an image", () => {
    const result = normalizeAppearance({
      theme: "light",
      wallpaperId: "custom",
      customWallpaper: null,
    });
    expect(result.wallpaperId).toBe(DEFAULT_APPEARANCE.wallpaperId);
  });

  it("keeps a custom data URL wallpaper", () => {
    const data = "data:image/jpeg;base64,abc";
    expect(
      normalizeAppearance({ theme: "system", wallpaperId: "custom", customWallpaper: data })
    ).toEqual({
      theme: "system",
      wallpaperId: "custom",
      customWallpaper: data,
    });
  });
});

describe("resolveTheme", () => {
  it("resolves system from prefers-color-scheme", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
