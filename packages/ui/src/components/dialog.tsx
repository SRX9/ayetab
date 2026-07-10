"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  labelledBy?: string;
  label?: string;
  children: ReactNode;
  placement?: "center" | "top";
  /** Skip enter/exit motion — use for high-frequency surfaces (⌘K) */
  instant?: boolean;
  panelClassName?: string;
  testId?: string;
}

export function Dialog({
  open,
  onClose,
  labelledBy,
  label,
  children,
  placement = "center",
  instant = false,
  panelClassName,
  testId,
}: DialogProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open && instant);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (instant) {
        setVisible(true);
        return;
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    if (instant) {
      setVisible(false);
      setMounted(false);
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 180);
    return () => window.clearTimeout(timer);
  }, [open, instant]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center",
        placement === "center" ? "items-center" : "items-start pt-[11vh]"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={label}
    >
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[6px]",
          !instant &&
            "transition-opacity duration-200 ease-out-strong motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        data-testid={testId}
        className={cn(
          "relative w-full mx-4",
          !instant &&
            "transition-[opacity,transform] duration-200 ease-out-strong motion-reduce:transition-none motion-reduce:transform-none",
          !instant &&
            (visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[0.97] translate-y-1"),
          panelClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
