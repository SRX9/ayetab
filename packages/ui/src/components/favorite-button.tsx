"use client";

import { cn } from "../lib/utils";

interface FavoriteButtonProps {
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function FavoriteButton({ active, onClick, className }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "text-sm transition-colors",
        active ? "text-amber-500" : "text-muted-foreground hover:text-amber-500",
        className
      )}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
