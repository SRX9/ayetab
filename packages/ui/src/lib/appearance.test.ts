import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, normalizeAppearance, resolveTheme } from "./appearance";

describe("normalizeAppearance", () => {
  it("returns defaults for empty input", () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(normalizeAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
  });

  it("is always light, whatever is stored", () => {
    expect(normalizeAppearance({ theme: "dark" } as never).theme).toBe("light");
    expect(normalizeAppearance({ theme: "system" } as never).theme).toBe("light");
    expect(normalizeAppearance({ theme: "light" }).theme).toBe("light");
  });

  /** Preferences saved before the current wallpaper shape. */
  it("drops fields from older stored shapes", () => {
    expect(
      normalizeAppearance({ theme: "dark", wallpaperId: "mesa", customWallpaper: null } as never)
    ).toEqual({ theme: "light", wallpaper: { kind: "abstract", value: "default" } });
  });

  it("keeps a valid wallpaper", () => {
    expect(
      normalizeAppearance({ wallpaper: { kind: "abstract", value: "tahoe" } })
    ).toEqual({ theme: "light", wallpaper: { kind: "abstract", value: "tahoe" } });
    expect(
      normalizeAppearance({ wallpaper: { kind: "image", value: "data:image/png;base64,xx" } })
    ).toEqual({
      theme: "light",
      wallpaper: { kind: "image", value: "data:image/png;base64,xx" },
    });
  });
});

describe("resolveTheme", () => {
  it("is always light", () => {
    expect(resolveTheme()).toBe("light");
  });
});
