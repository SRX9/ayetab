"use client";

import type { ReactNode } from "react";

/**
 * Light-only product. AppearanceSync used to reconcile a stored theme into the
 * provider; with dark mode removed there is nothing to sync. Kept so existing
 * layouts don't change shape.
 */
export function AppearanceSync({ children }: { children?: ReactNode }) {
  return children ?? null;
}
