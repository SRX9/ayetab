"use client";

import { type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04Icon,
  ImageUploadIcon,
  Moon02Icon,
  Sun03Icon,
  ComputerIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { WALLPAPER_PRESETS, type ThemeMode } from "../lib/appearance";
import type { AppearancePreferences } from "../lib/appearance";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { HomeWallpaper } from "./home/home-wallpaper";

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; hint: string; icon: typeof Sun03Icon }> = [
  { id: "light", label: "Light", hint: "Bright interface", icon: Sun03Icon },
  { id: "dark", label: "Dark", hint: "Dim interface", icon: Moon02Icon },
  { id: "system", label: "Auto", hint: "Match macOS", icon: ComputerIcon },
];

interface AppearanceSectionProps {
  effectiveTheme: ThemeMode;
  onTheme: (mode: ThemeMode) => void;
}

export function AppearanceSection({ effectiveTheme, onTheme }: AppearanceSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Appearance</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Choose light, dark, or automatically match your system.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const selected = effectiveTheme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTheme(opt.id)}
              data-testid={`theme-option-${opt.id}`}
              className={cn(
                "flex flex-col items-start gap-3 rounded-2xl border p-3.5 text-left",
                "transition-[border-color,background-color,box-shadow,ring-color,ring-width]",
                selected
                  ? "border-selection/50 bg-selection/10 ring-2 ring-selection/30"
                  : "border-white/20 bg-white/20 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/35 dark:border-white/10 dark:bg-white/5 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/10"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  opt.id === "light" && "bg-[#f2f4f7] text-[#1d1d1f]",
                  opt.id === "dark" && "bg-[#1c1c1e] text-[#f5f5f7]",
                  opt.id === "system" &&
                    "bg-gradient-to-br from-[#f2f4f7] to-[#1c1c1e] text-[#1d1d1f]"
                )}
              >
                <HugeiconsIcon icon={opt.icon} size={18} strokeWidth={1.75} color="currentColor" />
              </div>
              <div>
                <p className="text-[13px] font-semibold">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground">{opt.hint}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WallpaperSectionProps {
  appearance: AppearancePreferences;
  uploading: boolean;
  wallpaperRef: RefObject<HTMLInputElement | null>;
  onWallpaper: (id: string) => void;
  onCustomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WallpaperSection({
  appearance,
  uploading,
  wallpaperRef,
  onWallpaper,
  onCustomUpload,
}: WallpaperSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Wallpaper</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Pick a desktop backdrop — or use your own photo, like on macOS.
        </p>
      </div>

      <div
        className="relative h-36 overflow-hidden rounded-2xl border border-white/20 shadow-inner dark:border-white/10"
        data-testid="wallpaper-preview"
      >
        <HomeWallpaper
          fixed={false}
          className="absolute inset-0 h-full w-full"
          wallpaperId={appearance.wallpaperId}
          customUrl={appearance.wallpaperId === "custom" ? appearance.customWallpaper : null}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 py-3">
          <p className="text-[12px] font-medium text-white drop-shadow">
            {appearance.wallpaperId === "custom"
              ? "Custom Photo"
              : WALLPAPER_PRESETS.find((w) => w.id === appearance.wallpaperId)?.name ?? "Wallpaper"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {WALLPAPER_PRESETS.map((preset) => {
          const selected = appearance.wallpaperId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onWallpaper(preset.id)}
              data-testid={`wallpaper-${preset.id}`}
              className={cn(
                "group flex flex-col gap-1.5 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection/40"
              )}
            >
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-xl border",
                  "transition-[border-color,box-shadow,ring-color,ring-width]",
                  selected
                    ? "border-selection ring-2 ring-selection/40"
                    : "border-white/25 dark:border-white/10"
                )}
              >
                <HomeWallpaper
                  fixed={false}
                  wallpaperId={preset.id}
                  customUrl={null}
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <div>
                <p className="truncate text-[12px] font-medium">{preset.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{preset.caption}</p>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => wallpaperRef.current?.click()}
          disabled={uploading}
          data-testid="wallpaper-custom"
          className={cn(
            "group flex flex-col gap-1.5 text-left",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection/40"
          )}
        >
          <div
            className={cn(
              "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border",
              "transition-[border-color,box-shadow,ring-color,ring-width]",
              appearance.wallpaperId === "custom"
                ? "border-selection ring-2 ring-selection/40"
                : "border-dashed border-white/35 bg-white/15 dark:border-white/15 dark:bg-white/5"
            )}
            style={
              appearance.customWallpaper
                ? {
                    backgroundImage: `url(${appearance.customWallpaper})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!appearance.customWallpaper && (
              <HugeiconsIcon
                icon={ImageUploadIcon}
                size={22}
                strokeWidth={1.5}
                color="currentColor"
                className="text-muted-foreground"
              />
            )}
          </div>
          <div>
            <p className="truncate text-[12px] font-medium">
              {uploading ? "Uploading…" : "Custom Photo"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {appearance.customWallpaper ? "Tap to replace" : "Add from files"}
            </p>
          </div>
        </button>
      </div>

      {appearance.customWallpaper && appearance.wallpaperId !== "custom" && (
        <Button variant="outline" size="sm" className="self-start" onClick={() => onWallpaper("custom")}>
          Use custom photo
        </Button>
      )}

      <input
        ref={wallpaperRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCustomUpload}
      />
    </div>
  );
}

interface DataSectionProps {
  fileRef: RefObject<HTMLInputElement | null>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataSection({ fileRef, onExport, onImport }: DataSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Data</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Export or import your home layout, favorites, and appearance.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={onImport} />
        <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
          <HugeiconsIcon icon={Download04Icon} size={14} strokeWidth={1.75} color="currentColor" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="gap-1.5"
        >
          <HugeiconsIcon icon={Upload04Icon} size={14} strokeWidth={1.75} color="currentColor" />
          Import
        </Button>
      </div>
    </div>
  );
}
