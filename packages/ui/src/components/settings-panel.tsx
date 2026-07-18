"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download04Icon,
  ImageUploadIcon,
  PaintBoardIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { fileToWallpaperDataUrl, type ThemeMode } from "../lib/appearance";
import type { UserPreferences } from "../lib/preferences";
import { exportPreferences, importPreferences } from "../lib/preferences";
import { usePreferences } from "../hooks/use-preferences";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { AppearanceSection, DataSection, WallpaperSection } from "./settings-sections";

type SettingsSection = "appearance" | "wallpaper" | "data";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS: Array<{ id: SettingsSection; label: string; icon: typeof Settings01Icon }> = [
  { id: "appearance", label: "Appearance", icon: PaintBoardIcon },
  { id: "wallpaper", label: "Wallpaper", icon: ImageUploadIcon },
  { id: "data", label: "Data", icon: Download04Icon },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { prefs, updateAppearance, importPrefs } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState<SettingsSection>("appearance");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const wallpaperRef = useRef<HTMLInputElement>(null);

  const appearance = prefs.appearance;

  const handleTheme = (mode: ThemeMode) => {
    setTheme(mode);
    void updateAppearance((a) => ({ ...a, theme: mode }));
  };

  const handleWallpaper = (id: string) => {
    void updateAppearance((a) => ({
      ...a,
      wallpaperId: id,
    }));
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await fileToWallpaperDataUrl(file);
      await updateAppearance((a) => ({
        ...a,
        wallpaperId: "custom",
        customWallpaper: dataUrl,
      }));
      setSection("wallpaper");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that image");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    setError(null);
    const blob = new Blob([exportPreferences(prefs)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ayetab-preferences.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importPreferences(String(reader.result));
        void importPrefs(imported);
        if (imported.appearance?.theme) setTheme(imported.appearance.theme);
        setError(null);
      } catch {
        setError("Invalid preferences file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const effectiveTheme = theme;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="settings-title"
      panelClassName="max-w-[720px]"
      testId="settings-panel"
    >
      <div className="overflow-hidden rounded-[22px] material-hud shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-3.5 dark:border-white/10">
          <div>
            <h2 id="settings-title" className="text-[17px] font-semibold tracking-tight">
              Settings
            </h2>
            <p className="text-[12px] text-muted-foreground">Theme, wallpaper, and preferences</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-muted-foreground transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/10 dark:bg-white/10 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/15"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} color="currentColor" />
          </button>
        </div>

        <div className="flex min-h-[420px] flex-col md:flex-row">
          <nav className="flex gap-1 overflow-x-auto border-b border-white/10 p-3 md:w-48 md:flex-col md:overflow-visible md:border-b-0 md:border-r dark:border-white/10">
            {SECTIONS.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px]",
                    "transition-colors",
                    active
                      ? "bg-black/8 font-medium text-foreground dark:bg-white/12"
                      : "text-foreground/70 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={16}
                    strokeWidth={1.75}
                    color="currentColor"
                    className="shrink-0"
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 p-5">
            {section === "appearance" && (
              <AppearanceSection effectiveTheme={effectiveTheme} onTheme={handleTheme} />
            )}

            {section === "wallpaper" && (
              <WallpaperSection
                appearance={appearance}
                uploading={uploading}
                wallpaperRef={wallpaperRef}
                onWallpaper={handleWallpaper}
                onCustomUpload={handleCustomUpload}
              />
            )}

            {section === "data" && (
              <DataSection fileRef={fileRef} onExport={handleExport} onImport={handleImport} />
            )}

            {error && (
              <p className="mt-4 text-[12px] text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

interface SettingsButtonProps {
  className?: string;
  compact?: boolean;
}

/** Gear button that opens the Settings panel */
export function SettingsButton({ className, compact }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size={compact ? "icon" : "icon"}
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        title="Settings"
        data-testid="settings-button"
        className={cn("h-8 w-8 text-muted-foreground", className)}
      >
        <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.75} color="currentColor" />
      </Button>
      <SettingsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Legacy compact export/import controls — kept for extension sidebar */
export function SettingsMenu({
  prefs,
  onImport,
  className,
  compact,
}: {
  prefs: UserPreferences;
  onImport: (prefs: UserPreferences) => void;
  className?: string;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    const blob = new Blob([exportPreferences(prefs)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ayetab-preferences.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onImport(importPreferences(String(reader.result)));
        setError(null);
      } catch {
        setError("Invalid preferences file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex gap-1.5">
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className={cn(compact && "h-6 px-1.5 text-[10px]")}
        >
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className={cn(compact && "h-6 px-1.5 text-[10px]")}
        >
          Import
        </Button>
      </div>
      {error && (
        <p className="text-[10px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
