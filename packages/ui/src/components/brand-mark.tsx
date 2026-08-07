"use client";

import { useId } from "react";
import { cn } from "../lib/utils";

/**
 * AyeTab mark — abstract browser tab.
 * Default: tab in a macOS squircle. Pass `bare` for a background-free glyph
 * (Google-style home). Pass `src` for the photoreal glass PNG.
 */
export function BrandMark({
  className,
  title = "AyeTab",
  size = 24,
  src,
  bare = false,
}: {
  className?: string;
  title?: string;
  size?: number;
  src?: string;
  /** Background-free mark — just the tab glyph, no squircle plate. */
  bare?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const tile = `ayetab-tile-${uid}`;
  const tab = `ayetab-tab-${uid}`;
  const sheen = `ayetab-sheen-${uid}`;

  if (src && !bare) {
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

  if (bare) {
    /* Tab plate only — no tile background, for Google-style home. */
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 96 72"
        fill="none"
        width={size}
        height={Math.round(size * 0.75)}
        className={cn("shrink-0", className)}
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id={tab} x1="18" y1="8" x2="78" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4AA3FF" />
            <stop offset="1" stopColor="#007AFF" />
          </linearGradient>
          <linearGradient id={sheen} x1="24" y1="10" x2="72" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M8 44 H88"
          stroke="#7FA3C4"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />
        <rect x="18" y="12" width="60" height="32" rx="11" fill={`url(#${tab})`} />
        <rect x="18" y="12" width="60" height="12" rx="11" fill={`url(#${sheen})`} />
        <circle cx="30" cy="20" r="2.6" fill="#FFFFFF" opacity="0.55" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={tile} x1="16" y1="8" x2="112" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FBFF" />
          <stop offset="0.5" stopColor="#E8F2FC" />
          <stop offset="1" stopColor="#D4E6F8" />
        </linearGradient>
        <linearGradient id={tab} x1="34" y1="28" x2="94" y2="66" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4AA3FF" />
          <stop offset="1" stopColor="#007AFF" />
        </linearGradient>
        <linearGradient id={sheen} x1="40" y1="30" x2="88" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="112"
        height="112"
        rx="30"
        fill={`url(#${tile})`}
        stroke="#C2D6EA"
        strokeWidth="1.2"
      />
      <path d="M24 64 H104" stroke="#7FA3C4" strokeWidth="2.75" strokeLinecap="round" />
      <rect x="34" y="32" width="60" height="32" rx="11" fill={`url(#${tab})`} />
      <rect x="34" y="32" width="60" height="12" rx="11" fill={`url(#${sheen})`} />
      <circle cx="46" cy="40" r="2.8" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}
