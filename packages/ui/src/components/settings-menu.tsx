"use client";

import { useRef, useState } from "react";
import type { UserPreferences } from "../lib/preferences";
import { exportPreferences, importPreferences } from "../lib/preferences";
import { cn } from "../lib/utils";
import { Button } from "./button";

interface SettingsMenuProps {
  prefs: UserPreferences;
  onImport: (prefs: UserPreferences) => void;
  className?: string;
  compact?: boolean;
}

export function SettingsMenu({ prefs, onImport, className, compact }: SettingsMenuProps) {
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
        const imported = importPreferences(String(reader.result));
        onImport(imported);
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
          size={compact ? "sm" : "sm"}
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
