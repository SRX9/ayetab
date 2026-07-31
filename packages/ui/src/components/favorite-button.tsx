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
        pressable("inline-flex h-6 w-6 items-center justify-center rounded"),
        active ? "text-favorite" : "text-muted-foreground hover:text-favorite",
        className
      )}
    >
      <HugeiconsIcon
        icon={StarIcon}
        size={15}
        strokeWidth={active ? 2 : 1.75}
        color="currentColor"
        aria-hidden
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
