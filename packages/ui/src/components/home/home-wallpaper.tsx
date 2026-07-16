"use client";

import { usePreferences } from "../../hooks/use-preferences";
import { cn } from "../../lib/utils";

interface HomeWallpaperProps {
  className?: string;
  /** When false, renders as a relative fill (thumbnails / previews) */
  fixed?: boolean;
  /** Override wallpaper id (for preset thumbnails) */
  wallpaperId?: string;
  /** Override custom image */
  customUrl?: string | null;
}

export function HomeWallpaper({
  className,
  fixed = true,
  wallpaperId,
  customUrl,
}: HomeWallpaperProps) {
  const { prefs } = usePreferences();
  const id = wallpaperId ?? prefs.appearance.wallpaperId;
  const custom =
    customUrl !== undefined
      ? customUrl
      : id === "custom"
        ? prefs.appearance.customWallpaper
        : null;

  return (
    <div
      className={cn(
        "home-wallpaper",
        fixed && "home-wallpaper-fixed",
        className
      )}
      data-wallpaper={id}
      style={
        custom
          ? {
              backgroundImage: `url(${custom})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#1a1a1a",
            }
          : undefined
      }
      aria-hidden
    />
  );
}
