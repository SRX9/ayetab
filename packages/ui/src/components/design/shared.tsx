"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { readableTextOn, parseColor } from "@ayetab/utils";
import { Button } from "../button";
import { ToolIcon } from "../tool-icon";
import { useClipboard } from "../../hooks/use-clipboard";
import { cn } from "../../lib/utils";
import { FOCUS_RING } from "../../lib/pressable";
import { loadImageFile } from "./shared-utils";
import type { LoadedImage } from "./shared-utils";

export type { CustomToolProps } from "../../lib/custom-tool-props";
export { ToolActions, LoadingState } from "../productivity/shared";
export {
  loadImageFile,
  canvasToBlob,
  downloadBlob,
  downloadText,
  downloadCanvas,
  baseName,
  formatBytes,
  drawFitted,
  CHECKER_STYLE,
} from "./shared-utils";
export type { LoadedImage } from "./shared-utils";

/**
 * Holds a single dropped/pasted image and revokes its object URL when it is
 * replaced or the tool unmounts.
 */
export function useImageUpload() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const previous = useRef<string | null>(null);

  const accept = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const loaded = await loadImageFile(file);
      if (previous.current) URL.revokeObjectURL(previous.current);
      previous.current = loaded.url;
      setImage(loaded);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (previous.current) URL.revokeObjectURL(previous.current);
    previous.current = null;
    setImage(null);
    setError(null);
  }, []);

  useEffect(
    () => () => {
      if (previous.current) URL.revokeObjectURL(previous.current);
    },
    []
  );

  return { image, error, busy, accept, clear, setError };
}

/** Same as `useImageUpload` but keeps an ordered list. */
export function useImageListUpload() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const urls = useRef<string[]>([]);

  const accept = useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      setError("No images in that drop.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const loaded = await Promise.all(list.map(loadImageFile));
      urls.current.push(...loaded.map((l) => l.url));
      setImages((prev) => [...prev, ...loaded]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  const remove = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((from: number, to: number) => {
    setImages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setImages([]);
    setError(null);
  }, []);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  return { images, error, busy, accept, remove, move, clear, setError };
}

// ── Dropzone ────────────────────────────────────────────────────────────────

interface DropzoneProps {
  onFiles: (files: FileList | File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  icon?: string;
  compact?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Drag-drop / click / paste target. Paste is bound to the window while the
 * zone is mounted so users can go straight from a screenshot to a tool.
 */
export function Dropzone({
  onFiles,
  accept = "image/*",
  multiple = false,
  label = "Drop an image here",
  hint = "or click to browse — nothing leaves your device",
  icon = "ImagePlus",
  compact = false,
  children,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files: File[] = [];
      for (const item of e.clipboardData?.items ?? []) {
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (file) files.push(file);
      }
      if (files.length > 0) {
        e.preventDefault();
        onFiles(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded border border-dashed text-center",
        "transition-colors duration-100",
        compact ? "min-h-[7rem] p-4" : "min-h-[14rem] p-8",
        over ? "border-ring bg-selection-soft" : "border-border bg-muted/40",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="sr-only"
        aria-label={label}
      />
      {children ?? (
        <>
          <ToolIcon name={icon} className="h-6 w-6 text-muted-foreground" />
          <p className="text-ui font-medium">{label}</p>
          <p className="text-caption text-muted-foreground">{hint}</p>
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="mt-1">
        Choose {multiple ? "files" : "file"}
      </Button>
    </div>
  );
}

// ── Layout ──────────────────────────────────────────────────────────────────

export function Panel({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("tool-surface p-4", className)}>
      {(title || actions) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h3 className="text-ui font-semibold">{title}</h3>}
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function ControlGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>;
}

/**
 * Lets a control borrow the id of the `Field` caption above it for
 * `aria-labelledby` — used by `Segmented`'s radiogroup, which is not a form
 * element, and by the shared inputs, whose wrapping `<label>` only exists at
 * the call site.
 */
const FieldLabelContext = createContext<string | undefined>(undefined);

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const labelId = useId();
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span id={labelId} className="text-label font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <FieldLabelContext.Provider value={labelId}>{children}</FieldLabelContext.Provider>
      {hint && <span className="text-caption text-muted-foreground">{hint}</span>}
    </label>
  );
}

/**
 * One control height across the tool surface: 32px, matching `Button` size
 * `md`, so a field and a button sitting in the same row share a baseline.
 */
const inputClass = cn(
  "input-well h-8 w-full min-w-0 px-2.5 text-ui text-foreground",
  "placeholder:text-muted-foreground",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, className)}
      {...rest}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}) {
  const labelledBy = useContext(FieldLabelContext);
  return (
    <div className={cn("relative", className)}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = e.target.value === "" ? NaN : Number(e.target.value);
          onChange(n);
        }}
        aria-labelledby={labelledBy}
        className={cn(inputClass, suffix && "pr-10", "tabular-nums")}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-caption text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  const labelledBy = useContext(FieldLabelContext);
  return (
    <div className={cn("relative min-w-0", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-labelledby={labelledBy}
        className={cn(inputClass, "cursor-pointer appearance-none pe-7")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* A real element, so the chevron tracks the theme instead of baking in a grey. */}
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        size={14}
        strokeWidth={1.75}
        color="currentColor"
        className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

export function Range({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  const labelledBy = useContext(FieldLabelContext);
  const span = max - min;
  const fill = span > 0 ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;

  return (
    <div className="flex items-center gap-2.5">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-labelledby={labelledBy}
        className={cn("range-input min-w-0 flex-1 rounded", FOCUS_RING)}
        style={{ "--range-fill": `${fill}%` } as CSSProperties}
      />
      <span className="w-14 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
        {format ? format(value) : value}
      </span>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  const labelledBy = useContext(FieldLabelContext);
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={cn("seg-control flex-wrap", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn("seg-option", active && "seg-option-active", FOCUS_RING)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        data-on={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "ios-switch",
          // The track is 22px tall; the pseudo-element brings the target to 32.
          "before:absolute before:-inset-y-[5px] before:inset-x-0 before:content-['']",
          FOCUS_RING
        )}
      />
      <label htmlFor={id} className="cursor-pointer select-none text-ui">
        {label}
      </label>
    </div>
  );
}

export function ColorInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  // The native picker only accepts 6-digit hex, so fall back when the text
  // field holds something it cannot represent yet.
  const rgb = parseColor(value);
  const swatch = rgb
    ? `#${[rgb.r, rgb.g, rgb.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`
    : "#000000";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <input
        type="color"
        value={swatch}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "input-well h-8 w-8 shrink-0 cursor-pointer rounded-lg p-0.5",
          FOCUS_RING
        )}
        aria-label="Colour picker"
      />
      {/* A `Field` label only reaches the first control, so this one names itself. */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label="Colour value"
        className={cn(inputClass, "font-mono")}
      />
    </div>
  );
}

// ── Copy / swatch ───────────────────────────────────────────────────────────

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "outline",
  className,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "outline" | "ghost" | "secondary";
  className?: string;
}) {
  const { copied, copy } = useClipboard();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => void copy(text)}
      className={className}
      aria-live="polite"
    >
      {copied ? "Copied" : label}
    </Button>
  );
}

/** A colour chip that copies its own value on click. */
export function Swatch({
  color,
  label,
  sublabel,
  height = "h-20",
  onClick,
  className,
}: {
  color: string;
  label?: string;
  sublabel?: string;
  height?: string;
  onClick?: () => void;
  className?: string;
}) {
  const { copied, copy } = useClipboard(1200);
  const rgb = parseColor(color);
  const text = rgb ? readableTextOn(rgb) : "#fff";

  return (
    <button
      type="button"
      onClick={onClick ?? (() => void copy(color))}
      title={`Copy ${color}`}
      className={cn(
        "group relative flex w-full flex-col justify-end overflow-hidden rounded border border-border p-2.5 text-left",
        FOCUS_RING,
        height,
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span className="text-label font-semibold uppercase" style={{ color: text }}>
        {copied ? "Copied" : (label ?? color)}
      </span>
      {sublabel && (
        <span className="text-kbd tabular-nums opacity-70" style={{ color: text }}>
          {sublabel}
        </span>
      )}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded bg-destructive/10 px-3 py-2 text-ui text-destructive">
      {children}
    </p>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-ui text-muted-foreground">{children}</p>;
}

/** Key/value strip used by the inspector-style tools. */
export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-1.5 last:border-0">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-ui font-medium tabular-nums">{value}</span>
    </div>
  );
}
