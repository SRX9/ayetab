"use client";

import { useEffect, type RefObject } from "react";

/** How long the thumb lingers after scrolling stops. */
const LINGER_MS = 500;

/**
 * Ink in a `.ds-scroll` thumb while the element is scrolling, then hide it.
 * Sets `data-scrolling` on the target — CSS does the rest.
 *
 * Pass `enabled` (or any remount signal) when the scrollable node is
 * conditionally rendered — a stable ref object alone won't re-run the effect
 * when the DOM node appears later.
 */
export function useAutoHideScrollbar(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let hideTimer = 0;
    const onScroll = () => {
      el.dataset.scrolling = "true";
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        el.dataset.scrolling = "false";
      }, LINGER_MS);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(hideTimer);
      el.removeEventListener("scroll", onScroll);
    };
  }, [ref, enabled]);
}
