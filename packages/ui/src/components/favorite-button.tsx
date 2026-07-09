"use client";

import { cn } from "../lib/utils";
import { pressable } from "../lib/pressable";

interface FavoriteButtonProps {
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function FavoriteButton({ active, onClick, className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={cn(
        pressable(
          "inline-flex h-7 w-7 items-center justify-center rounded-md text-sm leading-none"
        ),
        active
          ? "text-favorite"
          : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-favorite [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
        className
      )}
    >
      <span
        className={cn(
          "inline-block transition-[transform,filter,opacity] duration-150 ease-out-strong",
          active && "scale-110"
        )}
        aria-hidden
      >
        {active ? "★" : "☆"}
      </span>
    </button>
  );
}
