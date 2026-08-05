import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadPreferences,
  normalizePreferences,
  savePreferences,
  savePreferencesPatch,
  subscribePreferences,
} from "./preferences";

type ChangeListener = (
  changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
  areaName: string
) => void;

/**
 * Stands in for chrome.storage.local, with the async round-trip that makes
 * read-modify-write races possible in the first place.
 */
function fakeChromeStorage() {
  const data = new Map<string, unknown>();
  const listeners = new Set<ChangeListener>();

  return {
    data,
    listeners,
    storage: {
      local: {
        get(keys: string[], cb: (result: Record<string, unknown>) => void) {
          setTimeout(() => {
            const result: Record<string, unknown> = {};
            for (const key of keys) {
              if (data.has(key)) result[key] = data.get(key);
            }
            cb(result);
          }, 0);
        },
        set(items: Record<string, unknown>, cb?: () => void) {
          setTimeout(() => {
            const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
            for (const [key, value] of Object.entries(items)) {
              changes[key] = { oldValue: data.get(key), newValue: value };
              data.set(key, value);
            }
            cb?.();
            for (const listener of listeners) listener(changes, "local");
          }, 0);
        },
      },
      onChanged: {
        addListener: (cb: ChangeListener) => void listeners.add(cb),
        removeListener: (cb: ChangeListener) => void listeners.delete(cb),
      },
    },
  };
}

let fake: ReturnType<typeof fakeChromeStorage>;

beforeEach(() => {
  fake = fakeChromeStorage();
  (globalThis as { chrome?: unknown }).chrome = { storage: fake.storage };
});

afterEach(() => {
  delete (globalThis as { chrome?: unknown }).chrome;
});

describe("normalizePreferences", () => {
  it("fills every field from a partial or garbage value", () => {
    const prefs = normalizePreferences({ favorites: "nope", recents: ["base64"] });
    expect(prefs.favorites).toEqual([]);
    expect(prefs.recents).toEqual(["base64"]);
    expect(prefs.appearance).toBeTruthy();
  });

  it("treats undefined as a fresh install", () => {
    const prefs = normalizePreferences(undefined);
    expect(prefs.favorites).toEqual([]);
    expect(prefs.recents).toEqual([]);
  });

  /** Preferences saved before the home screen was removed. */
  it("drops fields from older stored shapes", () => {
    const prefs = normalizePreferences({ favorites: ["base64"], home: { pins: ["uuid"] } });
    expect(prefs).toEqual({
      favorites: ["base64"],
      recents: [],
      appearance: { theme: "light", wallpaper: { kind: "abstract", value: "default" } },
    });
  });

  it("keeps a valid wallpaper and rejects a bad one", () => {
    const ok = normalizePreferences({
      appearance: { theme: "dark", wallpaper: { kind: "abstract", value: "tahoe" } },
    });
    expect(ok.appearance.wallpaper).toEqual({ kind: "abstract", value: "tahoe" });

    const bad = normalizePreferences({
      appearance: { wallpaper: { kind: "abstract", value: "nope" } },
    });
    expect(bad.appearance.wallpaper).toEqual({ kind: "abstract", value: "default" });

    const img = normalizePreferences({
      appearance: { wallpaper: { kind: "image", value: "data:image/png;base64,xx" } },
    });
    expect(img.appearance.wallpaper.kind).toBe("image");
  });
});

describe("savePreferencesPatch", () => {
  it("keeps fields another context wrote from a stale snapshot", async () => {
    // Both contexts load the same baseline.
    await savePreferences(normalizePreferences({}));
    const baseline = await loadPreferences();

    // Tab A stars a tool.
    await savePreferencesPatch({ favorites: ["jwt-debugger"] });

    // Tab B opens a tool, computed from its now-stale copy (favorites: []).
    await savePreferencesPatch({ recents: ["base64", ...baseline.recents] });

    const final = await loadPreferences();
    expect(final.favorites).toEqual(["jwt-debugger"]);
    expect(final.recents[0]).toBe("base64");
  });

  it("serializes concurrent patches within one context", async () => {
    await savePreferences(normalizePreferences({}));

    await Promise.all([
      savePreferencesPatch({ favorites: ["uuid-generator"] }),
      savePreferencesPatch({ recents: ["hash-generator"] }),
    ]);

    const final = await loadPreferences();
    expect(final.favorites).toEqual(["uuid-generator"]);
    expect(final.recents).toEqual(["hash-generator"]);
  });

  it("returns the merged result", async () => {
    await savePreferences(normalizePreferences({ recents: ["base64"] }));
    const merged = await savePreferencesPatch({ favorites: ["qr-code"] });
    expect(merged.favorites).toEqual(["qr-code"]);
    expect(merged.recents).toEqual(["base64"]);
  });
});

describe("subscribePreferences", () => {
  it("reports external writes and stops after unsubscribe", async () => {
    const seen: string[][] = [];
    const unsubscribe = subscribePreferences((p) => seen.push(p.favorites));

    await savePreferencesPatch({ favorites: ["color-converter"] });
    expect(seen).toEqual([["color-converter"]]);

    unsubscribe();
    await savePreferencesPatch({ favorites: [] });
    expect(seen).toEqual([["color-converter"]]);
  });

  it("normalizes the incoming value", async () => {
    let received: unknown = null;
    const unsubscribe = subscribePreferences((p) => {
      received = p;
    });

    // Another context writing an older/partial shape must not produce holes.
    fake.storage.local.set({ "ayetab-prefs": { favorites: ["base64"] } });
    await new Promise((r) => setTimeout(r, 5));
    unsubscribe();

    expect(received).toMatchObject({
      favorites: ["base64"],
      recents: [],
      appearance: { theme: "light", wallpaper: { kind: "abstract", value: "default" } },
    });
  });
});
