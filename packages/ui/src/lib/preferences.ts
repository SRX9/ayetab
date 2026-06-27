export interface UserPreferences {
  favorites: string[];
  recents: string[];
}

const STORAGE_KEY = "ayetab-prefs";
const MAX_RECENTS = 8;

const DEFAULT_PREFS: UserPreferences = { favorites: [], recents: [] };

type ChromeStorage = {
  get: (keys: string[], cb: (result: Record<string, UserPreferences>) => void) => void;
  set: (items: Record<string, UserPreferences>, cb?: () => void) => void;
};

function getChromeStorage(): ChromeStorage | null {
  const g = globalThis as unknown as { chrome?: { storage?: { local?: ChromeStorage } } };
  return g.chrome?.storage?.local ?? null;
}

export async function loadPreferences(): Promise<UserPreferences> {
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    return new Promise((resolve) => {
      chromeStorage.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] ?? DEFAULT_PREFS);
      });
    });
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserPreferences) : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  const chromeStorage = getChromeStorage();
  if (chromeStorage) {
    return new Promise((resolve) => {
      chromeStorage.set({ [STORAGE_KEY]: prefs }, resolve);
    });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
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
