"use client";

import type { CSSProperties } from "react";
import type { Wallpaper } from "../lib/appearance";
import { DEFAULT_WALLPAPER } from "../lib/appearance";
import { wallpaperCss } from "../lib/wallpapers";

/**
 * Full-bleed background layer behind the shell. Abstract presets render as a
 * gradient; custom images render as a cover photo with a soft cool veil so
 * glass stays readable. Sits below the grain and content.
 */
export function WallpaperLayer({ wallpaper }: { wallpaper?: Wallpaper }) {
  const resolved: Wallpaper = wallpaper ?? DEFAULT_WALLPAPER;
  const isImage = resolved.kind === "image";
  const style: CSSProperties = {
    background: wallpaperCss(resolved),
    ...(isImage
      ? { backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
      : {}),
  };
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={style} />
      {isImage && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(252,253,255,0.22),rgba(242,245,249,0.36))]"
        />
      )}
    </>
  );
}
