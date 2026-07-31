"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  allowUpload?: boolean;
  autoFocus?: boolean;
  focusKey?: string;
}

export function InputPanel({
  value,
  onChange,
  placeholder = "Paste or type your input here…",
  label = "Input",
  className,
  rows = 8,
  onPaste,
  allowUpload = true,
  autoFocus = false,
  focusKey,
}: InputPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /*
   * The id used to be the literal "tool-input". Surfaces that mount more than
   * one tool (newtab widgets, sidepanel) produced duplicate ids, so every label
   * pointed at whichever textarea rendered first.
   */
  const uid = useId();
  const inputId = `tool-input-${uid}`;

  useEffect(() => {
    if (!autoFocus) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const end = el.value.length;
        el.setSelectionRange(end, end);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [autoFocus, focusKey]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-label font-medium uppercase text-muted-foreground">
          {label}
        </label>
        {allowUpload && (
          <>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="h-6 px-2">
              Upload file
            </Button>
          </>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        placeholder={placeholder}
        rows={rows}
        data-testid="tool-input"
        id={inputId}
        autoFocus={autoFocus}
        className={cn(
          // text-base below sm: anything under 16px makes iOS Safari zoom on focus.
          // size/leading shorthand: a bare `leading-*` loses to the responsive
          // `sm:text-sm`, which re-sets line-height later in the cascade.
          "field w-full resize-y px-3 py-2.5 font-mono text-base/[1.5] sm:text-sm/[1.5]",
          "placeholder:text-muted-foreground",
          "transition-colors duration-100 focus-visible:border-ring/60 focus-visible:outline-none"
        )}
        spellCheck={false}
      />
    </div>
  );
}
