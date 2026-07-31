"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(open && instant);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open) {
      if (!el.open) el.showModal();
      if (instant) {
        setVisible(true);
        return;
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    setVisible(false);
    if (instant) {
      if (el.open) el.close();
      return;
    }
    const timer = window.setTimeout(() => {
      if (el.open) el.close();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [open, instant]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      aria-label={label}
      data-testid={testId}
      className={cn(
        // Never set display:flex unconditionally — it overrides the UA
        // `dialog:not([open]) { display: none }` and leaves closed palettes visible.
        "fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none justify-center border-0 bg-transparent p-0",
        "backdrop:bg-transparent",
        "open:flex",
        placement === "center" ? "items-center" : "items-start pt-[10vh]"
      )}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className={cn(
          "fixed inset-0 cursor-default border-0 bg-black/30",
          !instant && "transition-opacity duration-150 motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 mx-4 w-full",
          !instant && "transition-opacity duration-150 motion-reduce:transition-none",
          !instant && (visible ? "opacity-100" : "opacity-0"),
          panelClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </dialog>
  );
}
