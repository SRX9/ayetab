"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
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
      <HugeiconsIcon
        icon={StarIcon}
        size={16}
        strokeWidth={active ? 2 : 1.75}
        color="currentColor"
        aria-hidden
        className={cn(
          "transition-transform duration-120 ease-out-strong",
          active && "scale-110"
        )}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
