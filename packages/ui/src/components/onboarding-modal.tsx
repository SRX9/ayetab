"use client";

import { useEffect, useState } from "react";
import { isOnboarded, setOnboarded } from "../lib/preferences";
import { cn } from "../lib/utils";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    isOnboarded().then((done) => {
      if (!done) setOpen(true);
    });
  }, []);

  const dismiss = async () => {
    await setOnboarded();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-label="Welcome">
      <div className="fixed inset-0 bg-black/50" />
      <div className={cn("relative w-full max-w-md rounded-lg border border-border bg-popover p-5 shadow-2xl mx-4")}>
        <h2 className="text-lg font-semibold">Welcome to AyeTab</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your all-in-one developer toolbox — 40+ utilities that run entirely offline in your browser.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-sm">
          <li>Press <kbd className="px-1 py-0.5 rounded border border-border text-xs">⌘K</kbd> to search any tool instantly</li>
          <li>Star ★ your favorites for quick access</li>
          <li>Paste data and we&apos;ll suggest the right tool</li>
          <li>All processing happens locally — your data never leaves your device</li>
        </ul>
        <button
          onClick={dismiss}
          data-testid="onboarding-dismiss"
          className="mt-5 w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
