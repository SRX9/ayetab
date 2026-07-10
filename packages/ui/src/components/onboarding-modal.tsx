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
      <div className="overflow-hidden rounded-[20px] material-hud p-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-selection" />
          Local · Offline · Instant
        </div>
        <h2 id="onboarding-title" className="text-[22px] font-semibold tracking-tight">
          Welcome to AyeTab
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          A Raycast-fast toolbox for developers — search, open, and run utilities without leaving your flow.
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 text-[13px]">
          <li className="flex gap-2.5">
            <kbd className="shrink-0">⌘K</kbd>
            <span className="text-muted-foreground">Search any tool instantly</span>
          </li>
          <li className="flex gap-2.5">
            <kbd className="shrink-0">↑↓</kbd>
            <span className="text-muted-foreground">Move through the list, ↵ to open</span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-favorite">★</span>
            <span className="text-muted-foreground">Star favorites for one-tap access</span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-selection/15 text-[10px] font-bold text-selection">
              A
            </span>
            <span className="text-muted-foreground">Everything stays on your device</span>
          </li>
        </ul>
        <Button
          variant="primary"
          size="lg"
          onClick={dismiss}
          data-testid="onboarding-dismiss"
          className="mt-6 w-full rounded-xl bg-selection text-selection-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection/90"
        >
          Get started
        </Button>
      </div>
    </Dialog>
  );
}
