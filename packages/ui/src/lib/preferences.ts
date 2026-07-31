import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type AppearancePreferences,
} from "./appearance";

export interface UserPreferences {
  favorites: string[];
  recents: string[];
  appearance: AppearancePreferences;
}

const STORAGE_KEY = "ayetab-prefs";
const ONBOARDING_KEY = "ayetab-onboarded";
const MAX_RECENTS = 8;

const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  recents: [],
  appearance: { ...DEFAULT_APPEARANCE },
};

export function exportPreferences(prefs: UserPreferences): string {
  return JSON.stringify(prefs, null, 2);
}

/**
 * Coerce any stored/imported shape into a complete, valid preferences object.
 * Building a fresh object also drops fields from older versions (the home
 * layout, wallpaper choice) rather than carrying them forward forever.
 */
export function normalizePreferences(raw: unknown): UserPreferences {
  const parsed = (raw ?? {}) as Partial<UserPreferences>;
  return {
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    appearance: normalizeAppearance(parsed.appearance),
  };
}

export function importPreferences(json: string): UserPreferences {
  return normalizePreferences(JSON.parse(json));
}

type StorageChange = { oldValue?: unknown; newValue?: unknown };
type ChangeListener = (changes: Record<string, StorageChange>, areaName: string) => void;

type ChromeStorage = {
  get: (keys: string[], cb: (result: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, cb?: () => void) => void;
};

type ChromeStorageRoot = {
  local?: ChromeStorage;
  onChanged?: {
    addListener: (cb: ChangeListener) => void;
    removeListener: (cb: ChangeListener) => void;
  };
};

function getChromeStorageRoot(): ChromeStorageRoot | null {
  const g = globalThis as unknown as { chrome?: { storage?: ChromeStorageRoot } };
  return g.chrome?.storage ?? null;
}

function getChromeStorage(): ChromeStorage | null {
  return getChromeStorageRoot()?.local ?? null;
}

async function storageGet<T>(key: string, fallback: T): Promise<T> {
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    return new Promise((resolve) => {
      chromeStorage.get([key], (result) => {
        resolve((result[key] as T) ?? fallback);
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function storageSet(key: string, value: unknown): Promise<void> {
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    return new Promise((resolve) => {
      chromeStorage.set({ [key]: value as UserPreferences }, resolve);
    });
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function loadPreferences(): Promise<UserPreferences> {
  return normalizePreferences(await storageGet<Partial<UserPreferences>>(STORAGE_KEY, DEFAULT_PREFS));
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  return enqueueWrite(() => storageSet(STORAGE_KEY, prefs));
}

/**
 * Serializes writes within this context so two read-merge-write cycles can't
 * interleave. Cross-context races stay possible but shrink to the storage
 * round-trip, which `subscribePreferences` then reconciles.
 */
let writeChain: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(op: () => Promise<T>): Promise<T> {
  const run = writeChain.then(op, op);
  writeChain = run.catch(() => undefined);
  return run;
}

/**
 * Merge a subset of preferences into whatever is currently stored.
 *
 * Multiple contexts (new tab pages, the side panel) each hold their own
 * in-memory snapshot. Writing the whole object from a stale snapshot silently
 * discards fields another context changed; patching only the field that
 * actually changed keeps those edits intact.
 */
export async function savePreferencesPatch(
  patch: Partial<UserPreferences>
): Promise<UserPreferences> {
  return enqueueWrite(async () => {
    const stored = await storageGet<Partial<UserPreferences>>(STORAGE_KEY, DEFAULT_PREFS);
    const merged = normalizePreferences({ ...stored, ...patch });
    await storageSet(STORAGE_KEY, merged);
    return merged;
  });
}

/** Notifies when another context (or browser sync) rewrites the stored preferences. */
export function subscribePreferences(onChange: (prefs: UserPreferences) => void): () => void {
  const events = getChromeStorageRoot()?.onChanged;
  if (events) {
    const listener: ChangeListener = (changes, areaName) => {
      if (areaName !== "local") return;
      const change = changes[STORAGE_KEY];
      if (!change) return;
      onChange(normalizePreferences(change.newValue));
    };
    events.addListener(listener);
    return () => events.removeListener(listener);
  }

  if (typeof window === "undefined") return () => {};
  const listener = (e: StorageEvent) => {
    // key === null means storage.clear() — re-read rather than guess.
    if (e.key !== null && e.key !== STORAGE_KEY) return;
    void loadPreferences().then(onChange);
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

export async function isOnboarded(): Promise<boolean> {
  return storageGet(ONBOARDING_KEY, false);
}

export async function setOnboarded(): Promise<void> {
  return storageSet(ONBOARDING_KEY, true);
}

export function toggleFavorite(prefs: UserPreferences, toolId: string): UserPreferences {
  const favorites = prefs.favorites.includes(toolId)
    ? prefs.favorites.filter((id) => id !== toolId)
    : [...prefs.favorites, toolId];
  return { ...prefs, favorites };
}

export function addRecent(prefs: UserPreferences, toolId: string): UserPreferences {
  const recents = [toolId, ...prefs.recents.filter((id) => id !== toolId)].slice(0, MAX_RECENTS);
  return { ...prefs, recents };
}

export function updateAppearance(
  prefs: UserPreferences,
  appearance: AppearancePreferences
): UserPreferences {
  return { ...prefs, appearance: normalizeAppearance(appearance) };
}

export { DEFAULT_APPEARANCE, normalizeAppearance };
export type { AppearancePreferences };
