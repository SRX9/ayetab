const DB_NAME = "ayetab";
const DB_VERSION = 1;
const STORE_NAME = "tool-inputs";

export interface ToolSession {
  input: string;
  options?: Record<string, unknown>;
  updatedAt: number;
}

interface ToolSessionRecord extends ToolSession {
  toolId: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "toolId" });
        }
      };
    });
  }

  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadToolSession(toolId: string): Promise<ToolSession | null> {
  try {
    const record = await withStore<ToolSessionRecord | undefined>("readonly", (store) => store.get(toolId));
    if (!record) return null;
    return {
      input: record.input,
      options: record.options,
      updatedAt: record.updatedAt,
    };
  } catch {
    return null;
  }
}

async function writeToolSession(
  toolId: string,
  input: string,
  options?: Record<string, unknown>
): Promise<void> {
  await withStore("readwrite", (store) =>
    store.put({
      toolId,
      input,
      options,
      updatedAt: Date.now(),
    } satisfies ToolSessionRecord)
  );
}

export async function saveToolInput(toolId: string, input: string): Promise<void> {
  try {
    const existing = await loadToolSession(toolId);
    await writeToolSession(toolId, input, existing?.options);
  } catch {
    // Ignore storage failures so tools keep working offline or in restricted contexts.
  }
}

export async function saveToolOptions(toolId: string, options: Record<string, unknown>): Promise<void> {
  try {
    const existing = await loadToolSession(toolId);
    await writeToolSession(toolId, existing?.input ?? "", {
      ...existing?.options,
      ...options,
    });
  } catch {
    // Ignore storage failures.
  }
}

export async function clearToolSession(toolId: string): Promise<void> {
  try {
    await withStore("readwrite", (store) => store.delete(toolId));
  } catch {
    // Ignore storage failures.
  }
}
