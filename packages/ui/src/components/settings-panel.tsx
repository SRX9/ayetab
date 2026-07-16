"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ComputerIcon,
  Download04Icon,
  ImageUploadIcon,
  Moon02Icon,
  PaintBoardIcon,
  Settings01Icon,
  Sun03Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import {
  fileToWallpaperDataUrl,
  WALLPAPER_PRESETS,
  type ThemeMode,
} from "../lib/appearance";
import type { UserPreferences } from "../lib/preferences";
import { exportPreferences, importPreferences } from "../lib/preferences";
import { usePreferences } from "../hooks/use-preferences";
import { useTheme } from "./theme-provider";
import { cn } from "../lib/utils";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { HomeWallpaper } from "./home/home-wallpaper";

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

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; hint: string; icon: typeof Sun03Icon }> = [
  { id: "light", label: "Light", hint: "Bright interface", icon: Sun03Icon },
  { id: "dark", label: "Dark", hint: "Dim interface", icon: Moon02Icon },
  { id: "system", label: "Auto", hint: "Match macOS", icon: ComputerIcon },
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

  // Sync theme from prefs when opening (prefs may load after ThemeProvider)
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
                        onClick={() => handleTheme(opt.id)}
                        data-testid={`theme-option-${opt.id}`}
                        className={cn(
                          "flex flex-col items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
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
            )}

            {section === "wallpaper" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight">Wallpaper</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Pick a desktop backdrop — or use your own photo, like on macOS.
                  </p>
                </div>

                {/* Live preview */}
                <div
                  className="relative h-36 overflow-hidden rounded-2xl border border-white/20 shadow-inner dark:border-white/10"
                  data-testid="wallpaper-preview"
                >
                  <HomeWallpaper
                    fixed={false}
                    className="absolute inset-0 h-full w-full"
                    wallpaperId={appearance.wallpaperId}
                    customUrl={
                      appearance.wallpaperId === "custom" ? appearance.customWallpaper : null
                    }
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 py-3">
                    <p className="text-[12px] font-medium text-white drop-shadow">
                      {appearance.wallpaperId === "custom"
                        ? "Custom Photo"
                        : WALLPAPER_PRESETS.find((w) => w.id === appearance.wallpaperId)?.name ??
                          "Wallpaper"}
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
                        onClick={() => handleWallpaper(preset.id)}
                        data-testid={`wallpaper-${preset.id}`}
                        className={cn(
                          "group flex flex-col gap-1.5 text-left",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection/40"
                        )}
                      >
                        <div
                          className={cn(
                            "relative aspect-[4/3] overflow-hidden rounded-xl border transition-all",
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

                  {/* Custom photo tile */}
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
                        "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border transition-all",
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => handleWallpaper("custom")}
                  >
                    Use custom photo
                  </Button>
                )}

                <input
                  ref={wallpaperRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomUpload}
                />
              </div>
            )}

            {section === "data" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight">Data</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Export or import your home layout, favorites, and appearance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
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
