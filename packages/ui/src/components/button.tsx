"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-selection text-selection-foreground shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hover:bg-selection/90",
  secondary:
    "bg-secondary text-secondary-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary/80",
  ghost:
    "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.05] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.08] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
  outline:
    "border border-border/80 bg-card/50 text-foreground shadow-[0_1px_0_hsl(var(--hairline))] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
  destructive:
    "bg-destructive text-destructive-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs rounded-[8px] gap-1.5",
  md: "h-9 px-3.5 text-sm rounded-[10px] gap-2",
  lg: "h-10 px-4 text-sm rounded-xl gap-2",
  icon: "h-8 w-8 rounded-[9px]",
};

export function Button({
  variant = "outline",
  size = "sm",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none",
        "transition-[transform,background-color,color,border-color,opacity,box-shadow] duration-150 ease-out-strong",
        "active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
