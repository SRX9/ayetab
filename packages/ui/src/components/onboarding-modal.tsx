"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon, StickyNote01Icon } from "@hugeicons/core-free-icons";
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
          Your customizable home for developer tools — pin apps, jot notes, and rearrange widgets like your phone.
        </p>
        <ul className="mt-6 flex flex-col gap-3 text-[13px]">
          <li className="flex items-center gap-3">
            <HugeiconsIcon
              icon={CommandIcon}
              size={16}
              strokeWidth={1.75}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="text-muted-foreground">
              <kbd className="mr-1">⌘</kbd>
              <kbd>K</kbd>
              <span className="ml-1.5">Search any tool instantly</span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <kbd className="shrink-0">Edit</kbd>
            <span className="text-muted-foreground">Customize widgets, pins, and layout</span>
          </li>
          <li className="flex items-center gap-3">
            <HugeiconsIcon
              icon={StickyNote01Icon}
              size={16}
              strokeWidth={1.75}
              color="currentColor"
              className="shrink-0 text-favorite"
              aria-hidden
            />
            <span className="text-muted-foreground">Write notes and check todos right on home</span>
          </li>
        </ul>
        <Button variant="primary" size="lg" onClick={dismiss} data-testid="onboarding-dismiss" className="mt-7 w-full">
          Get started
        </Button>
      </div>
    </Dialog>
  );
}
