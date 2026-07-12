"use client";

import { Star } from "lucide-react";
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
        pressable("inline-flex h-7 w-7 items-center justify-center rounded-lg"),
        active
          ? "text-favorite"
          : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:text-favorite",
        className
      )}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-transform duration-120 ease-out-strong",
          active && "scale-110 fill-current"
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}
