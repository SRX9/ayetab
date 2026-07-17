"use client";

import { FavoriteButton } from "../favorite-button";
import { Button } from "../button";

export type { CustomToolProps } from "../../lib/custom-tool-props";
export { newId, todayKey, formatDuration, formatClock } from "../../lib/productivity-format";

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
