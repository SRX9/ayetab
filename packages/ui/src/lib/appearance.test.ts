import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, normalizeAppearance, resolveTheme } from "./appearance";

describe("normalizeAppearance", () => {
  it("returns defaults for empty input", () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(normalizeAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
  });

  it("accepts a valid theme", () => {
    expect(normalizeAppearance({ theme: "dark" })).toEqual({ theme: "dark" });
    expect(normalizeAppearance({ theme: "light" })).toEqual({ theme: "light" });
  });

  it("falls back to the default for an unknown theme", () => {
    expect(normalizeAppearance({ theme: "sepia" } as never)).toEqual(DEFAULT_APPEARANCE);
  });

  /** Preferences saved before the wallpaper feature was removed. */
  it("drops fields from older stored shapes", () => {
    expect(
      normalizeAppearance({ theme: "dark", wallpaperId: "mesa", customWallpaper: null } as never)
    ).toEqual({ theme: "dark" });
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
