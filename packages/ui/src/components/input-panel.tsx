"use client";

import { useEffect, useRef } from "react";
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
  placeholder = "Paste or type your input here...",
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
      <div className="flex items-center justify-between">
        <label htmlFor="tool-input" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
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
        id="tool-input"
        autoFocus={autoFocus}
        className={cn(
          "material-field w-full resize-y rounded-[14px] px-3.5 py-3 text-sm font-mono",
          "placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow] duration-150 ease-out-strong",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection/35 focus-visible:border-selection/35",
          "motion-reduce:transition-none"
        )}
        spellCheck={false}
      />
    </div>
  );
}
