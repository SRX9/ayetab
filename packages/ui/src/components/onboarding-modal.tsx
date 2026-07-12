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
      <div className="overflow-hidden rounded-[24px] material-hud p-7">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-selection text-[22px] font-bold text-selection-foreground shadow-[inset_0_1px_0_hsl(var(--specular)/0.3),0_8px_24px_-8px_hsl(var(--selection)/0.45)]">
          A
        </div>
        <h2 id="onboarding-title" className="text-[26px] font-semibold tracking-tight">
          AyeTab
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          A local developer toolbox that feels like a native macOS app — search, open, and run utilities offline.
        </p>
        <ul className="mt-6 flex flex-col gap-3 text-[13px]">
          <li className="flex items-center gap-3">
            <kbd className="shrink-0">⌘K</kbd>
            <span className="text-muted-foreground">Search any tool instantly</span>
          </li>
          <li className="flex items-center gap-3">
            <kbd className="shrink-0">↑↓</kbd>
            <span className="text-muted-foreground">Move through the list, ↵ to open</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-favorite">★</span>
            <span className="text-muted-foreground">Star favorites for quick access</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] material-chip text-[10px] font-bold text-selection">
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
          className="mt-7 w-full"
        >
          Get started
        </Button>
      </div>
    </Dialog>
  );
}
