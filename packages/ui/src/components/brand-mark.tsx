"use client";

import { cn } from "../lib/utils";

/**
 * AyeTab glass mark (A + Aye orb).
 * Served from `/logo-icon.png` in both the web app and extension public roots
 * so chrome always matches the marketing master asset.
 */
export function BrandMark({
  className,
  title = "AyeTab",
  size = 24,
  src = "/logo-icon.png",
}: {
  className?: string;
  title?: string;
  size?: number;
  /** Override when the host app serves the mark from another path. */
  src?: string;
}) {
  return (
    <img
      src={src}
      alt={title}
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      className={cn("shrink-0 object-contain select-none", className)}
    />
  );
}
