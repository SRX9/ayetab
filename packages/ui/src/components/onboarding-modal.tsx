"use client";

import { useEffect, useState } from "react";
import { Star, Command } from "lucide-react";
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
      <div className="overflow-hidden rounded-[22px] material-hud p-7">
        <h2 id="onboarding-title" className="text-[26px] font-semibold tracking-tight">
          AyeTab
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          A local developer toolbox with a clean macOS feel — search, open, and run utilities offline.
        </p>
        <ul className="mt-6 flex flex-col gap-3 text-[13px]">
          <li className="flex items-center gap-3">
            <Command className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <span className="text-muted-foreground">
              <kbd className="mr-1">⌘</kbd>
              <kbd>K</kbd>
              <span className="ml-1.5">Search any tool instantly</span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <kbd className="shrink-0">↑↓</kbd>
            <span className="text-muted-foreground">Move through the list, ↵ to open</span>
          </li>
          <li className="flex items-center gap-3">
            <Star className="h-4 w-4 shrink-0 text-favorite" strokeWidth={1.75} aria-hidden />
            <span className="text-muted-foreground">Star favorites for quick access</span>
          </li>
        </ul>
        <Button variant="primary" size="lg" onClick={dismiss} data-testid="onboarding-dismiss" className="mt-7 w-full">
          Get started
        </Button>
      </div>
    </Dialog>
  );
}
