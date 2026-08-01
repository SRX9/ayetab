"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon, StarIcon, WifiDisconnected01Icon } from "@hugeicons/core-free-icons";
import { isOnboarded, setOnboarded } from "../lib/preferences";
import { BrandMark } from "./brand-mark";
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
      <div className="menu-surface overflow-hidden p-6">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-7 w-7" size={28} src="/logo-icon.png" />
          <h2 id="onboarding-title" className="text-title font-semibold">
            AyeTab
          </h2>
        </div>
        <p className="mt-1.5 text-ui-md leading-relaxed text-muted-foreground">
          Every developer tool in one list. Pick one on the left, use it on the right.
        </p>
        <ul className="mt-5 flex flex-col gap-3 text-ui">
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
              <kbd className="me-1">⌘</kbd>
              <kbd>K</kbd>
              <span className="ms-1.5">Search any tool instantly</span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <HugeiconsIcon
              icon={StarIcon}
              size={16}
              strokeWidth={1.75}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="text-muted-foreground">
              Star a tool to keep it at the top of the list
            </span>
          </li>
          <li className="flex items-center gap-3">
            <HugeiconsIcon
              icon={WifiDisconnected01Icon}
              size={16}
              strokeWidth={1.75}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="text-muted-foreground">
              Everything runs on your device, offline
            </span>
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
