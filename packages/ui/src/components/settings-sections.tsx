"use client";

import { useRef, type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Download04Icon,
  Image01Icon,
  Moon02Icon,
  Sun03Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { type ThemeMode, type Wallpaper } from "../lib/appearance";
import { ABSTRACT_WALLPAPERS } from "../lib/wallpapers";
import { usePreferences } from "../hooks/use-preferences";
import { cn } from "../lib/utils";
import { Button } from "./button";

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; hint: string; icon: typeof Sun03Icon }> = [
  { id: "light", label: "Light", hint: "Bright interface", icon: Sun03Icon },
  { id: "dark", label: "Dark", hint: "Dim interface", icon: Moon02Icon },
  { id: "system", label: "Auto", hint: "Match your system", icon: ComputerIcon },
];

interface AppearanceSectionProps {
  effectiveTheme: ThemeMode;
  onTheme: (mode: ThemeMode) => void;
}

export function AppearanceSection({ effectiveTheme, onTheme }: AppearanceSectionProps) {
  const { prefs, updateAppearance } = usePreferences();
  const imageRef = useRef<HTMLInputElement>(null);
  const wallpaper = prefs.appearance.wallpaper;

  const setWallpaper = (w: Wallpaper) =>
    void updateAppearance((a) => ({ ...a, wallpaper: w }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWallpaper({ kind: "image", value: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-ui-lg font-semibold">Appearance</h3>
        <p className="mt-0.5 text-ui text-muted-foreground">
          Choose light, dark, or automatically match your system.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((opt) => {
          const selected = effectiveTheme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onTheme(opt.id)}
              data-testid={`theme-option-${opt.id}`}
              className={cn(
                "flex flex-col items-start gap-2 rounded border p-3 text-left transition-colors",
                selected
                  ? "border-ring bg-selection-soft"
                  : "border-border hover:bg-[hsl(var(--hover-fill))]"
              )}
            >
              <HugeiconsIcon
                icon={opt.icon}
                size={18}
                strokeWidth={1.75}
                color="currentColor"
                className={cn(selected ? "text-foreground" : "text-muted-foreground")}
              />
              <div>
                <p className="text-ui font-medium">{opt.label}</p>
                <p className="text-caption text-muted-foreground">{opt.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="text-ui-lg font-semibold">Wallpaper</h3>
        <p className="mt-0.5 text-ui text-muted-foreground">
          The glass reads through whatever sits behind it. Pick an abstract, or your own image.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {ABSTRACT_WALLPAPERS.map((w) => {
          const selected = wallpaper.kind === "abstract" && wallpaper.value === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWallpaper({ kind: "abstract", value: w.id })}
              aria-pressed={selected}
              className={cn(
                "group flex flex-col gap-1.5 rounded-lg p-1 text-left transition-transform active:scale-[0.97]",
                selected && "ring-2 ring-[hsl(var(--ring))]"
              )}
            >
              <span
                aria-hidden
                className="aspect-[16/10] w-full rounded-md border border-white/60 shadow-sm"
                style={{ background: w.swatch }}
              />
              <span className={cn("text-caption", selected ? "font-medium text-foreground" : "text-muted-foreground")}>
                {w.label}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className={cn(
            "group flex flex-col gap-1.5 rounded-lg p-1 text-left transition-transform active:scale-[0.97]",
            wallpaper.kind === "image" && "ring-2 ring-[hsl(var(--ring))]"
          )}
        >
          <span
            aria-hidden
            className="flex aspect-[16/10] w-full items-center justify-center rounded-md border border-dashed border-border bg-[hsl(var(--muted))] text-muted-foreground transition-colors group-hover:text-foreground"
            style={
              wallpaper.kind === "image"
                ? {
                    backgroundImage: `url("${wallpaper.value.replace(/"/g, "%22")}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {wallpaper.kind !== "image" && (
              <HugeiconsIcon icon={Image01Icon} size={18} strokeWidth={1.75} color="currentColor" />
            )}
          </span>
          <span className={cn("text-caption", wallpaper.kind === "image" ? "font-medium text-foreground" : "text-muted-foreground")}>
            {wallpaper.kind === "image" ? "Custom" : "Your image"}
          </span>
        </button>
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>
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
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-ui-lg font-semibold">Data</h3>
        <p className="mt-0.5 text-ui text-muted-foreground">
          Export or import your favorites, recents, and appearance.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={onImport} />
        <Button variant="outline" size="sm" onClick={onExport}>
          <HugeiconsIcon icon={Download04Icon} size={14} strokeWidth={1.75} color="currentColor" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <HugeiconsIcon icon={Upload04Icon} size={14} strokeWidth={1.75} color="currentColor" />
          Import
        </Button>
      </div>
    </div>
  );
}
