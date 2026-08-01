import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { BrandMark } from "@ayetab/ui";

const SEEN_KEY = "ayetab-newtab-notice-seen";

type StorageArea = {
  get: (keys: string[], cb: (result: Record<string, unknown>) => void) => void;
  set: (items: Record<string, unknown>, cb?: () => void) => void;
};

function chromeStorage(): StorageArea | null {
  const g = globalThis as unknown as { chrome?: { storage?: { local?: StorageArea } } };
  return g.chrome?.storage?.local ?? null;
}

function readSeen(): Promise<boolean> {
  const storage = chromeStorage();
  if (storage) {
    return new Promise((resolve) => storage.get([SEEN_KEY], (r) => resolve(r[SEEN_KEY] === true)));
  }
  try {
    return Promise.resolve(localStorage.getItem(SEEN_KEY) === "true");
  } catch {
    return Promise.resolve(true);
  }
}

function writeSeen() {
  const storage = chromeStorage();
  if (storage) {
    storage.set({ [SEEN_KEY]: true });
    return;
  }
  try {
    localStorage.setItem(SEEN_KEY, "true");
  } catch {
    // Private mode / quota — the notice just reappears next time.
  }
}

/**
 * Silently taking over the new tab is the top complaint pattern for this class
 * of extension. Say what happened once, and say how to undo it.
 */
export function FirstRunNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readSeen().then((seen) => {
      if (!cancelled && !seen) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    writeSeen();
    setVisible(false);
  };

  return (
    // A banner in the flow, not a floating card — it pushes the index down once
    // and then it's gone for good.
    <div
      role="status"
      data-testid="newtab-first-run-notice"
      className="flex items-start gap-3 border-b border-border bg-muted px-6 py-3 md:px-12"
    >
      <BrandMark className="mt-0.5 h-6 w-6" size={24} />
      <p className="flex-1 text-caption leading-relaxed text-muted-foreground">
        AyeTab is now your new tab page. Everything runs on your device — nothing is sent anywhere.
        To go back to the browser default, remove or disable AyeTab from your extensions page.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[hsl(var(--hover-fill))] hover:text-foreground"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} color="currentColor" />
      </button>
    </div>
  );
}
