"use client";

import { useEffect, useState } from "react";
import { isOnboarded, setOnboarded } from "../lib/preferences";
import { Dialog } from "./dialog";
import { Button } from "./button";

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

  return (
    <Dialog open={open} onClose={dismiss} labelledBy="onboarding-title" panelClassName="max-w-md">
      <div className="rounded-xl border border-border bg-popover p-6 shadow-2xl surface-panel">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Offline · Local-first
        </div>
        <h2 id="onboarding-title" className="text-xl font-semibold tracking-tight">
          Welcome to AyeTab
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your all-in-one developer toolbox — 50 utilities that run entirely offline in your browser.
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 text-sm">
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              Press <kbd>⌘K</kbd> to search any tool instantly
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>Star favorites for quick access</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>Paste data and we&apos;ll suggest the right tool</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>All processing stays on your device</span>
          </li>
        </ul>
        <Button
          variant="primary"
          size="lg"
          onClick={dismiss}
          data-testid="onboarding-dismiss"
          className="mt-6 w-full"
        >
          Get started
        </Button>
      </div>
    </Dialog>
  );
}
