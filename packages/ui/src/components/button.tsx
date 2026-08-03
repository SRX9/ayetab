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
  primary: "btn-liquid-primary border-0",
  secondary:
    "border border-white/70 bg-white/55 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md hover:bg-white/75 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15",
  ghost: "text-muted-foreground hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10",
  outline:
    "border border-white/65 bg-white/45 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md hover:bg-white/70 dark:border-white/15 dark:bg-white/[0.08] dark:hover:bg-white/12",
  destructive:
    "border-0 bg-[linear-gradient(180deg,#ff6b63_0%,#ff3b30_50%,#e0352b_100%)] text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_18px_rgba(255,59,48,0.35)] hover:brightness-105",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 rounded-lg px-2.5 text-caption gap-1.5",
  md: "h-8 rounded-lg px-3 text-ui gap-1.5",
  lg: "h-10 rounded-xl px-4 text-ui-md gap-2",
  icon: "h-8 w-8 rounded-lg",
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
