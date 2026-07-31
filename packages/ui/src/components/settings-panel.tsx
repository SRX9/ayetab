"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download04Icon,
  PaintBoardIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { type ThemeMode } from "../lib/appearance";
import type { UserPreferences } from "../lib/preferences";
import { exportPreferences, importPreferences } from "../lib/preferences";
import { usePreferences } from "../hooks/use-preferences";
import { useTheme } from "../hooks/use-theme";
import { cn } from "../lib/utils";
import { Dialog } from "./dialog";
import { Button } from "./button";
import { AppearanceSection, DataSection } from "./settings-sections";

type SettingsSection = "appearance" | "data";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS: Array<{ id: SettingsSection; label: string; icon: typeof Settings01Icon }> = [
  { id: "appearance", label: "Appearance", icon: PaintBoardIcon },
  { id: "data", label: "Data", icon: Download04Icon },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { prefs, updateAppearance, importPrefs } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [section, setSection] = useState<SettingsSection>("appearance");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTheme = (mode: ThemeMode) => {
    setTheme(mode);
    void updateAppearance((a) => ({ ...a, theme: mode }));
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="settings-title"
      panelClassName="max-w-[600px]"
      testId="settings-panel"
    >
      <div className="menu-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 id="settings-title" className="text-subtitle font-semibold">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-[hsl(var(--hover-fill))] hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={2} color="currentColor" />
          </button>
        </div>

        <div className="flex min-h-[280px] flex-col md:flex-row">
          <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 md:w-44 md:flex-col md:overflow-visible md:border-b-0 md:border-e">
            {SECTIONS.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded px-2 py-1 text-left text-ui transition-colors",
                    active ? "nav-active" : "row-idle"
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={15}
                    strokeWidth={1.75}
                    color="currentColor"
                    className={cn("shrink-0", !active && "text-muted-foreground")}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 p-5">
            {section === "appearance" && (
              <AppearanceSection effectiveTheme={theme} onTheme={handleTheme} />
            )}

            {section === "data" && (
              <DataSection fileRef={fileRef} onExport={handleExport} onImport={handleImport} />
            )}

            {error && (
              <p className="mt-4 text-caption text-destructive" role="alert">
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
}

/** Gear button that opens the Settings panel */
export function SettingsButton({ className }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        title="Settings"
        data-testid="settings-button"
        className={cn("shrink-0", className)}
      >
        <HugeiconsIcon icon={Settings01Icon} size={15} strokeWidth={1.75} color="currentColor" />
      </Button>
      <SettingsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Legacy compact export/import controls — kept for the extension side panel */
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
          className={cn(compact && "h-6 px-1.5 text-kbd")}
        >
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className={cn(compact && "h-6 px-1.5 text-kbd")}
        >
          Import
        </Button>
      </div>
      {error && (
        <p className="text-kbd text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
