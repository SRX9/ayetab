"use client";

import { useRef } from "react";
import { cn } from "../lib/utils";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  allowUpload?: boolean;
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
}: InputPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

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
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
        {allowUpload && (
          <>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Upload file
            </button>
          </>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        spellCheck={false}
      />
    </div>
  );
}
