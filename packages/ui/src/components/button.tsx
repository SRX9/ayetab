"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";
import { FOCUS_RING } from "../lib/pressable";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-selection text-selection-foreground shadow-[0_1px_0_rgba(255,255,255,0.28)_inset] hover:brightness-[1.04]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-[hsl(var(--hover-fill))] hover:text-foreground",
  outline:
    "border border-border bg-background/80 text-foreground backdrop-blur-sm hover:bg-[hsl(var(--hover-fill))]",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 rounded px-2 text-caption gap-1.5",
  md: "h-8 rounded px-3 text-ui gap-1.5",
  lg: "h-9 rounded px-4 text-ui-md gap-2",
  icon: "h-7 w-7 rounded",
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
        "inline-flex select-none items-center justify-center font-medium transition-[color,background-color,transform,filter,box-shadow] duration-150",
        FOCUS_RING,
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
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
