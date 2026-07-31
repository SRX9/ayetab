"use client";

import { type RefObject } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Download04Icon,
  Moon02Icon,
  Sun03Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import { type ThemeMode } from "../lib/appearance";
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
  return (
    <div className="flex flex-col gap-4">
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
