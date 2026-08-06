"use client";

import { useRef, type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download04Icon, Image01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { type Wallpaper } from "../lib/appearance";
import { ABSTRACT_WALLPAPERS, IMAGE_WALLPAPERS, isBuiltInImageWallpaper } from "../lib/wallpapers";
import { usePreferences } from "../hooks/use-preferences";
import { cn } from "../lib/utils";
import { Button } from "./button";

export function AppearanceSection() {
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

  const customImage =
    wallpaper.kind === "image" && !isBuiltInImageWallpaper(wallpaper.value);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-ui-lg font-semibold">Wallpaper</h3>
        <p className="mt-0.5 text-ui text-muted-foreground">
          The glass reads through whatever sits behind it. Start with Sequoia, or pick your own.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {IMAGE_WALLPAPERS.map((w) => {
          const selected = wallpaper.kind === "image" && wallpaper.value === w.path;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWallpaper({ kind: "image", value: w.path })}
              aria-pressed={selected}
              className={cn(
                "group flex flex-col gap-1.5 rounded-lg p-1 text-left transition-transform active:scale-[0.97]",
                selected && "ring-2 ring-[hsl(var(--ring))]"
              )}
            >
              <span
                aria-hidden
                className="aspect-[16/10] w-full rounded-md border border-white/60 bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url("${w.swatch}")` }}
              />
              <span className={cn("text-caption", selected ? "font-medium text-foreground" : "text-muted-foreground")}>
                {w.label}
              </span>
            </button>
          );
        })}
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
            customImage && "ring-2 ring-[hsl(var(--ring))]"
          )}
        >
          <span
            aria-hidden
            className="flex aspect-[16/10] w-full items-center justify-center rounded-md border border-dashed border-border bg-[hsl(var(--muted))] text-muted-foreground transition-colors group-hover:text-foreground"
            style={
              customImage
                ? {
                    backgroundImage: `url("${wallpaper.value.replace(/"/g, "%22")}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!customImage && (
              <HugeiconsIcon icon={Image01Icon} size={18} strokeWidth={1.75} color="currentColor" />
            )}
          </span>
          <span className={cn("text-caption", customImage ? "font-medium text-foreground" : "text-muted-foreground")}>
            {customImage ? "Custom" : "Your image"}
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
