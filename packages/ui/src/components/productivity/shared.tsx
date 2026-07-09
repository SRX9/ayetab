"use client";

import type { ToolDefinition } from "@ayetab/utils";
import { FavoriteButton } from "../favorite-button";
import { Button } from "../button";

export interface CustomToolProps {
  tool: ToolDefinition;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ToolActionsProps {
  onClear: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  extra?: React.ReactNode;
}

export function ToolActions({ onClear, isFavorite, onToggleFavorite, extra }: ToolActionsProps) {
  return (
    <>
      {onToggleFavorite && <FavoriteButton active={!!isFavorite} onClick={onToggleFavorite} />}
      {extra}
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear
      </Button>
    </>
  );
}

export function LoadingState({ label = "Loading saved data…" }: { label?: string }) {
  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand motion-reduce:animate-none"
        aria-hidden
      />
      {label}
    </div>
  );
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
  return `${seconds}.${tenths}`;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
