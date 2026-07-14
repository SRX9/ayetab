export interface UserPreferences {
  favorites: string[];
  recents: string[];
  home: import("./home-layout").HomeLayout;
}

import {
  DEFAULT_HOME_LAYOUT,
  normalizeHomeLayout,
  type HomeLayout,
} from "./home-layout";

const STORAGE_KEY = "ayetab-prefs";
const ONBOARDING_KEY = "ayetab-onboarded";
const MAX_RECENTS = 8;

const DEFAULT_PREFS: UserPreferences = {
  favorites: [],
  recents: [],
  home: structuredClone(DEFAULT_HOME_LAYOUT),
};

export function exportPreferences(prefs: UserPreferences): string {
  return JSON.stringify(prefs, null, 2);
}

export function importPreferences(json: string): UserPreferences {
  const parsed = JSON.parse(json) as Partial<UserPreferences>;
  return {
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    home: normalizeHomeLayout(parsed.home),
  };
}

type ChromeStorage = {
  get: (keys: string[], cb: (result: Record<string, string | UserPreferences | boolean>) => void) => void;
  set: (items: Record<string, UserPreferences | boolean>, cb?: () => void) => void;
};

function getChromeStorage(): ChromeStorage | null {
  const g = globalThis as unknown as { chrome?: { storage?: { local?: ChromeStorage } } };
  return g.chrome?.storage?.local ?? null;
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
  const raw = await storageGet<Partial<UserPreferences>>(STORAGE_KEY, DEFAULT_PREFS);
  return {
    favorites: Array.isArray(raw.favorites) ? raw.favorites : [],
    recents: Array.isArray(raw.recents) ? raw.recents : [],
    home: normalizeHomeLayout(raw.home),
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  return storageSet(STORAGE_KEY, prefs);
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

export function updateHome(prefs: UserPreferences, home: HomeLayout): UserPreferences {
  return { ...prefs, home: normalizeHomeLayout(home) };
}

export { DEFAULT_HOME_LAYOUT, normalizeHomeLayout };
export type { HomeLayout };
