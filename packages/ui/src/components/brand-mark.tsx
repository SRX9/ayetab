"use client";

import { useId } from "react";

/** Inline AyeTab mark — glass A with the Aye/eye orb. Works in web + extension. */
export function BrandMark({
  className,
  title = "AyeTab",
}: {
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const tile = `ayetab-tile-${uid}`;
  const mark = `ayetab-mark-${uid}`;
  const orb = `ayetab-orb-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={tile} x1="18" y1="8" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F7FBFF" />
          <stop offset="0.45" stopColor="#E8F2FC" />
          <stop offset="1" stopColor="#D5E8F8" />
        </linearGradient>
        <linearGradient id={mark} x1="40" y1="28" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B9FE8" />
          <stop offset="1" stopColor="#007AFF" />
        </linearGradient>
        <linearGradient id={orb} x1="58" y1="54" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9DD0FF" />
          <stop offset="1" stopColor="#2F8CFF" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="112"
        height="112"
        rx="28"
        fill={`url(#${tile})`}
        stroke="#C9DCEC"
        strokeWidth="1"
      />
      <path
        d="M64 30 L92 98 H80.5 L73.2 76 H54.8 L47.5 98 H36 L64 30 Z M58.6 64 H69.4 L64 48 Z"
        fill={`url(#${mark})`}
        fillRule="evenodd"
      />
      <circle cx="64" cy="58" r="7.5" fill={`url(#${orb})`} />
      <circle cx="61.5" cy="55.5" r="2.4" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}
