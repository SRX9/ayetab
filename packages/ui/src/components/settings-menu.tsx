"use client";

import { useRef } from "react";
import type { UserPreferences } from "../lib/preferences";
import { exportPreferences, importPreferences } from "../lib/preferences";
import { cn } from "../lib/utils";

interface SettingsMenuProps {
  prefs: UserPreferences;
  onImport: (prefs: UserPreferences) => void;
  className?: string;
  compact?: boolean;
}

export function SettingsMenu({ prefs, onImport, className, compact }: SettingsMenuProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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
        onImport(imported);
      } catch {
        alert("Invalid preferences file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className={cn("flex gap-1.5", className)}>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <button
        onClick={handleExport}
        className={cn(
          "rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className={cn(
          "rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
          compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
        )}
      >
        Import
      </button>
    </div>
  );
}
