"use client";

import { useMemo, useState } from "react";
import {
  formatColor,
  generatePalette,
  gradeContrast,
  harmony,
  hslToHex,
  parseColor,
  readableTextOn,
  rgbToHex,
  rgbToHsl,
  tailwindScale,
  HARMONY_KINDS,
  PALETTE_MODES,
  type HarmonyKind,
  type PaletteMode,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  ColorInput,
  CopyButton,
  ControlGrid,
  CustomToolProps,
  EmptyNote,
  ErrorNote,
  Field,
  NumberInput,
  Panel,
  Range,
  Segmented,
  Select,
  StatRow,
  Swatch,
  TextInput,
  Toggle,
  ToolActions,
  downloadText,
} from "./shared";

type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

const FORMAT_OPTIONS: Array<{ value: ColorFormat; label: string }> = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsl", label: "HSL" },
  { value: "oklch", label: "OKLCH" },
];

const randomHex = () =>
  hslToHex({ h: Math.random() * 360, s: 55 + Math.random() * 35, l: 40 + Math.random() * 25 });

/** Export a list of colours in the format designers actually paste somewhere. */
function exportPalette(colors: string[], as: "css" | "tailwind" | "json" | "svg"): string {
  switch (as) {
    case "css":
      return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
    case "tailwind":
      return `colors: {\n${colors.map((c, i) => `  brand-${(i + 1) * 100}: "${c}",`).join("\n")}\n}`;
    case "json":
      return JSON.stringify(colors, null, 2);
    case "svg": {
      const w = 100;
      const rects = colors
        .map((c, i) => `  <rect x="${i * w}" y="0" width="${w}" height="${w}" fill="${c}"/>`)
        .join("\n");
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${colors.length * w}" height="${w}" viewBox="0 0 ${colors.length * w} ${w}">\n${rects}\n</svg>`;
    }
  }
}

function PaletteExport({ colors, name }: { colors: string[]; name: string }) {
  const [as, setAs] = useState<"css" | "tailwind" | "json" | "svg">("css");
  const text = useMemo(() => exportPalette(colors, as), [colors, as]);

  return (
    <Panel
      title="Export"
      actions={
        <>
          <CopyButton text={text} />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadText(
                text,
                `${name}.${as === "tailwind" ? "js" : as}`,
                as === "svg" ? "image/svg+xml" : "text/plain"
              )
            }
          >
            Download
          </Button>
        </>
      }
    >
      <Segmented
        value={as}
        onChange={setAs}
        options={[
          { value: "css", label: "CSS vars" },
          { value: "tailwind", label: "Tailwind" },
          { value: "json", label: "JSON" },
          { value: "svg", label: "SVG" },
        ]}
        className="mb-3"
      />
      <pre className="max-h-52 overflow-auto rounded-md bg-background p-3 font-mono text-caption leading-relaxed">
        {text}
      </pre>
    </Panel>
  );
}

// ── Palette Generator ───────────────────────────────────────────────────────

/**
 * Pair each colour with a unique, content-derived list key. Palettes can
 * legitimately repeat a colour (a grey seed makes every harmony identical),
 * so the raw value alone is not always unique.
 */
function keyedColors(colors: string[]): Array<{ color: string; key: string }> {
  const seen = new Map<string, number>();
  return colors.map((color) => {
    const n = seen.get(color) ?? 0;
    seen.set(color, n + 1);
    return { color, key: n === 0 ? color : `${color}~${n}` };
  });
}

export function PaletteGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [seed, setSeed] = useState("#4f46e5");
  const [mode, setMode] = useState<PaletteMode>("vibrant");
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<ColorFormat>("hex");

  const rgb = parseColor(seed);
  const colors = useMemo(
    () => (rgb ? generatePalette(rgb, mode, Math.max(2, Math.min(12, count))) : []),
    [rgb, mode, count]
  );

  const shown = keyedColors(colors).map(({ color, key }) => {
    const parsed = parseColor(color);
    return { key, color, label: parsed ? formatColor(parsed, format) : color };
  });

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setSeed("#4f46e5")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <Button variant="outline" size="sm" onClick={() => setSeed(randomHex())}>
              Randomise
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="palette-generator">
        <Panel>
          <ControlGrid className="sm:grid-cols-4">
            <Field label="Seed colour">
              <ColorInput value={seed} onChange={setSeed} />
            </Field>
            <Field label="Mood">
              <Select
                value={mode}
                onChange={setMode}
                options={PALETTE_MODES.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
              />
            </Field>
            <Field label="Swatches">
              <NumberInput value={count} onChange={setCount} min={2} max={12} />
            </Field>
            <Field label="Format">
              <Select value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
            </Field>
          </ControlGrid>
        </Panel>

        {!rgb ? (
          <ErrorNote>“{seed}” is not a colour I can read. Try a hex, rgb() or hsl() value.</ErrorNote>
        ) : (
          <>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(auto-fit, minmax(6.5rem, 1fr))` }}
            >
              {shown.map((s) => (
                <Swatch key={s.key} color={s.color} label={s.label} height="h-28" />
              ))}
            </div>
            <PaletteExport colors={colors} name="palette" />
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Harmony Generator ───────────────────────────────────────────────────────

const HARMONY_LABELS: Record<HarmonyKind, string> = {
  complementary: "Complementary",
  "split-complementary": "Split complementary",
  analogous: "Analogous",
  triadic: "Triadic",
  tetradic: "Tetradic",
  square: "Square",
  monochromatic: "Monochromatic",
};

export function HarmonyGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [seed, setSeed] = useState("#e11d48");
  const [format, setFormat] = useState<ColorFormat>("hex");
  const rgb = parseColor(seed);

  const groups = useMemo(
    () =>
      rgb
        ? HARMONY_KINDS.map((k) => {
            const colors = harmony(rgb, k);
            return { kind: k, colors, swatches: keyedColors(colors) };
          })
        : [],
    [rgb]
  );

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setSeed("#e11d48")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <Button variant="outline" size="sm" onClick={() => setSeed(randomHex())}>
              Randomise
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="harmony-generator">
        <Panel>
          <ControlGrid>
            <Field label="Base colour">
              <ColorInput value={seed} onChange={setSeed} />
            </Field>
            <Field label="Format">
              <Select value={format} onChange={setFormat} options={FORMAT_OPTIONS} />
            </Field>
          </ControlGrid>
        </Panel>

        {!rgb ? (
          <ErrorNote>Enter a valid colour to see its harmonies.</ErrorNote>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {groups.map(({ kind, colors, swatches }) => (
              <Panel
                key={kind}
                title={HARMONY_LABELS[kind]}
                actions={<CopyButton text={colors.join(", ")} label="Copy set" />}
              >
                <div className="flex gap-1.5">
                  {swatches.map(({ color, key }) => {
                    const p = parseColor(color);
                    return (
                      <Swatch
                        key={key}
                        color={color}
                        label={p ? formatColor(p, format) : color}
                        height="h-16"
                        className="flex-1"
                      />
                    );
                  })}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}

// ── Contrast Checker ────────────────────────────────────────────────────────

function Verdict({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-ui",
        pass ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="text-label font-semibold uppercase">{pass ? "Pass" : "Fail"}</span>
    </div>
  );
}

export function ContrastCheckerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [fg, setFg] = useState("#5b5b5b");
  const [bg, setBg] = useState("#ffffff");

  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  const verdict = fgRgb && bgRgb ? gradeContrast(fgRgb, bgRgb) : null;

  /** Walk lightness toward the nearest value that clears the target ratio. */
  const suggest = (target: number) => {
    if (!fgRgb || !bgRgb) return;
    const bgLum = gradeContrast(bgRgb, { r: 0, g: 0, b: 0 }).ratio;
    const goDarker = bgLum > 5;
    const { h, s } = rgbToHsl(fgRgb);

    for (let step = 0; step <= 100; step++) {
      const l = goDarker ? 100 - step : step;
      const candidate = parseColor(hslToHex({ h, s, l }));
      if (candidate && gradeContrast(candidate, bgRgb).ratio >= target) {
        setFg(hslToHex({ h, s, l }));
        return;
      }
    }
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setFg("#5b5b5b");
            setBg("#ffffff");
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFg(bg);
                setBg(fg);
              }}
            >
              Swap
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="contrast-checker">
        <ControlGrid>
          <Field label="Foreground">
            <ColorInput value={fg} onChange={setFg} />
          </Field>
          <Field label="Background">
            <ColorInput value={bg} onChange={setBg} />
          </Field>
        </ControlGrid>

        {!verdict ? (
          <ErrorNote>Enter two readable colours.</ErrorNote>
        ) : (
          <>
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-md border border-border px-6 py-10 text-center"
              style={{ backgroundColor: bg, color: fg }}
            >
              <p className="text-2xl font-semibold tracking-tight">Large text at 24px</p>
              <p className="text-sm">Normal body copy at 14px — this is the harder test to pass.</p>
              <p className="text-xs opacity-80">Small print at 12px</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
              <Panel className="flex flex-col items-center justify-center lg:w-52">
                <p className="text-5xl font-semibold tabular-nums tracking-tight">
                  {verdict.ratio.toFixed(2)}
                </p>
                <p className="mt-1 text-label uppercase text-muted-foreground">
                  Contrast ratio
                </p>
              </Panel>

              <Panel title="WCAG 2.2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Verdict pass={verdict.aaNormal} label="AA · normal text" />
                  <Verdict pass={verdict.aaLarge} label="AA · large text" />
                  <Verdict pass={verdict.aaaNormal} label="AAA · normal text" />
                  <Verdict pass={verdict.aaaLarge} label="AAA · large text" />
                  <Verdict pass={verdict.uiComponent} label="UI components & graphics" />
                </div>
                {!verdict.aaNormal && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="self-center text-caption text-muted-foreground">
                      Nudge the foreground to reach:
                    </span>
                    <Button variant="outline" size="sm" onClick={() => suggest(4.5)}>
                      AA (4.5)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => suggest(7)}>
                      AAA (7.0)
                    </Button>
                  </div>
                )}
              </Panel>
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Gradient Generator ──────────────────────────────────────────────────────

interface Stop {
  id: string;
  color: string;
  position: number;
}

type GradientKind = "linear" | "radial" | "conic" | "mesh";

const newStop = (color: string, position: number): Stop => ({
  id: crypto.randomUUID(),
  color,
  position,
});

export function GradientGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [kind, setKind] = useState<GradientKind>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    newStop("#6366f1", 0),
    newStop("#ec4899", 100),
  ]);

  const stopList = useMemo(
    () =>
      [...stops]
        .sort((a, b) => a.position - b.position)
        .map((s) => `${s.color} ${s.position}%`)
        .join(", "),
    [stops]
  );

  const css = useMemo(() => {
    switch (kind) {
      case "linear":
        return `linear-gradient(${angle}deg, ${stopList})`;
      case "radial":
        return `radial-gradient(circle at 50% 50%, ${stopList})`;
      case "conic":
        return `conic-gradient(from ${angle}deg at 50% 50%, ${stopList})`;
      case "mesh": {
        // Mesh is faked by layering soft radial blobs, one per stop.
        const layers = stops
          .map((s, i) => {
            const x = (i * 37 + 20) % 100;
            const y = (i * 53 + 30) % 100;
            return `radial-gradient(at ${x}% ${y}%, ${s.color} 0px, transparent 55%)`;
          })
          .join(", ");
        return `${layers}, linear-gradient(${angle}deg, ${stops[0]?.color ?? "#000"}, ${stops[stops.length - 1]?.color ?? "#fff"})`;
      }
    }
  }, [kind, angle, stopList, stops]);

  const update = (index: number, patch: Partial<Stop>) =>
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() =>
            setStops([
              newStop("#6366f1", 0),
              newStop("#ec4899", 100),
            ])
          }
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={<CopyButton text={`background: ${css};`} label="Copy CSS" />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="gradient-generator">
        <div
          className="h-56 rounded-md border border-border"
          style={{ backgroundImage: css }}
          aria-label="Gradient preview"
        />

        <Panel>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={kind}
                onChange={setKind}
                options={[
                  { value: "linear", label: "Linear" },
                  { value: "radial", label: "Radial" },
                  { value: "conic", label: "Conic" },
                  { value: "mesh", label: "Mesh" },
                ]}
              />
              {(kind === "linear" || kind === "conic" || kind === "mesh") && (
                <div className="min-w-[12rem] flex-1">
                  <Field label="Angle">
                    <Range value={angle} onChange={setAngle} min={0} max={360} format={(v) => `${v}°`} />
                  </Field>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex flex-wrap items-end gap-3">
                  <div className="w-48">
                    <Field label={`Stop ${i + 1}`}>
                      <ColorInput value={stop.color} onChange={(v) => update(i, { color: v })} />
                    </Field>
                  </div>
                  <div className="min-w-[10rem] flex-1">
                    <Field label="Position">
                      <Range
                        value={stop.position}
                        onChange={(v) => update(i, { position: v })}
                        format={(v) => `${v}%`}
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={stops.length <= 2}
                    onClick={() => setStops((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={stops.length >= 8}
                onClick={() => setStops((prev) => [...prev, newStop(randomHex(), 50)])}
              >
                Add stop
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setStops((prev) =>
                    prev.map((s, i) => ({
                      id: s.id,
                      color: randomHex(),
                      position: prev.length === 1 ? 0 : Math.round((i / (prev.length - 1)) * 100),
                    }))
                  )
                }
              >
                Randomise
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="CSS">
          <pre className="overflow-auto rounded-md bg-background p-3 font-mono text-caption">
            {`background: ${css};`}
          </pre>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Tailwind Shade Generator ────────────────────────────────────────────────

export function TailwindShadesTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [seed, setSeed] = useState("#3b82f6");
  const [name, setName] = useState("brand");
  const [as, setAs] = useState<"config" | "css" | "v4">("v4");

  const rgb = parseColor(seed);
  const scale = useMemo(() => (rgb ? tailwindScale(rgb) : []), [rgb]);

  const code = useMemo(() => {
    if (scale.length === 0) return "";
    const safe = name.trim().replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "brand";
    if (as === "config") {
      return `// tailwind.config.js\ncolors: {\n  "${safe}": {\n${scale
        .map((s) => `    ${s.stop}: "${s.hex}",`)
        .join("\n")}\n  },\n}`;
    }
    if (as === "v4") {
      return `/* Tailwind v4 — app.css */\n@theme {\n${scale
        .map((s) => `  --color-${safe}-${s.stop}: ${s.hex};`)
        .join("\n")}\n}`;
    }
    return `:root {\n${scale.map((s) => `  --${safe}-${s.stop}: ${s.hex};`).join("\n")}\n}`;
  }, [scale, name, as]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setSeed("#3b82f6")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={<CopyButton text={code} label="Copy scale" />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="tailwind-shades">
        <Panel>
          <ControlGrid className="sm:grid-cols-3">
            <Field label="Seed colour" hint="Kept exactly as-is at its closest stop">
              <ColorInput value={seed} onChange={setSeed} />
            </Field>
            <Field label="Scale name">
              <TextInput value={name} onChange={setName} placeholder="brand" />
            </Field>
            <Field label="Output">
              <Select
                value={as}
                onChange={setAs}
                options={[
                  { value: "v4", label: "Tailwind v4 @theme" },
                  { value: "config", label: "tailwind.config.js" },
                  { value: "css", label: "CSS variables" },
                ]}
              />
            </Field>
          </ControlGrid>
        </Panel>

        {!rgb ? (
          <ErrorNote>Enter a valid colour to build a scale.</ErrorNote>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
              {scale.map((s) => (
                <div key={s.stop} className="flex flex-col gap-1">
                  <Swatch
                    color={s.hex}
                    label={String(s.stop)}
                    sublabel={s.hex}
                    height="h-20"
                    className={cn(s.isSeed && "ring-2 ring-brand ring-offset-2 ring-offset-background")}
                  />
                </div>
              ))}
            </div>
            <Panel title="Code">
              <pre className="max-h-72 overflow-auto rounded-md bg-background p-3 font-mono text-caption leading-relaxed">
                {code}
              </pre>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Palette Collection ──────────────────────────────────────────────────────

interface CuratedPalette {
  name: string;
  tags: string[];
  colors: string[];
}

/** A curated starting library — enough to browse, all offline. */
const COLLECTION: CuratedPalette[] = [
  { name: "Nord", tags: ["cool", "editor"], colors: ["#2e3440", "#3b4252", "#88c0d0", "#a3be8c", "#eceff4"] },
  { name: "Dracula", tags: ["dark", "editor"], colors: ["#282a36", "#44475a", "#ff79c6", "#bd93f9", "#f8f8f2"] },
  { name: "Solarized", tags: ["warm", "editor"], colors: ["#002b36", "#268bd2", "#2aa198", "#b58900", "#fdf6e3"] },
  { name: "Gruvbox", tags: ["warm", "retro"], colors: ["#282828", "#cc241d", "#98971a", "#d79921", "#ebdbb2"] },
  { name: "Tokyo Night", tags: ["dark", "cool"], colors: ["#1a1b26", "#414868", "#7aa2f7", "#bb9af7", "#c0caf5"] },
  { name: "Catppuccin", tags: ["pastel", "soft"], colors: ["#1e1e2e", "#f5c2e7", "#cba6f7", "#a6e3a1", "#cdd6f4"] },
  { name: "Sunset Boulevard", tags: ["warm", "vibrant"], colors: ["#f72585", "#b5179e", "#7209b7", "#3a0ca3", "#4361ee"] },
  { name: "Desert Sand", tags: ["earth", "muted"], colors: ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"] },
  { name: "Deep Ocean", tags: ["cool", "calm"], colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"] },
  { name: "Forest Floor", tags: ["earth", "natural"], colors: ["#2d6a4f", "#40916c", "#52b788", "#95d5b2", "#d8f3dc"] },
  { name: "Terracotta", tags: ["earth", "warm"], colors: ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#f4f1de"] },
  { name: "Cotton Candy", tags: ["pastel", "playful"], colors: ["#ffcad4", "#f4acb7", "#9d8189", "#d8e2dc", "#ffe5d9"] },
  { name: "Neon Arcade", tags: ["neon", "vibrant"], colors: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff"] },
  { name: "Monochrome", tags: ["neutral", "minimal"], colors: ["#000000", "#404040", "#808080", "#bfbfbf", "#ffffff"] },
  { name: "Autumn Leaves", tags: ["warm", "seasonal"], colors: ["#582f0e", "#7f4f24", "#936639", "#a68a64", "#c2c5aa"] },
  { name: "Berry Smoothie", tags: ["vibrant", "fruit"], colors: ["#590d22", "#a4133c", "#ff4d6d", "#ff8fa3", "#fff0f3"] },
  { name: "Nordic Frost", tags: ["cool", "minimal"], colors: ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500"] },
  { name: "Sage & Clay", tags: ["earth", "muted"], colors: ["#cb997e", "#ddbea9", "#ffe8d6", "#b7b7a4", "#a5a58d"] },
  { name: "Midnight Bloom", tags: ["dark", "floral"], colors: ["#10002b", "#3c096c", "#7b2cbf", "#c77dff", "#e0aaff"] },
  { name: "Citrus Punch", tags: ["vibrant", "fruit"], colors: ["#ff9f1c", "#ffbf69", "#ffffff", "#cbf3f0", "#2ec4b6"] },
  { name: "Slate Office", tags: ["neutral", "ui"], colors: ["#0f172a", "#334155", "#64748b", "#cbd5e1", "#f8fafc"] },
  { name: "Coral Reef", tags: ["vibrant", "tropical"], colors: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"] },
];

const ALL_TAGS = [...new Set(COLLECTION.flatMap((p) => p.tags))].sort();

export function PaletteCollectionTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COLLECTION.filter((p) => {
      if (tag !== "all" && !p.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)) ||
        p.colors.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [query, tag]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setQuery("");
            setTag("all");
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="palette-collection">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <Field label="Search">
              <TextInput value={query} onChange={setQuery} placeholder="Name, tag or hex…" />
            </Field>
          </div>
          <Field label="Tag">
            <Select
              value={tag}
              onChange={setTag}
              options={[{ value: "all", label: "All tags" }, ...ALL_TAGS.map((t) => ({ value: t, label: t }))]}
            />
          </Field>
        </div>

        {filtered.length === 0 ? (
          <EmptyNote>No palettes match “{query}”.</EmptyNote>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Panel key={p.name} className="p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-ui font-semibold">{p.name}</p>
                    <p className="truncate text-caption text-muted-foreground">{p.tags.join(" · ")}</p>
                  </div>
                  <CopyButton text={p.colors.join(", ")} label="Copy" variant="ghost" />
                </div>
                <div className="flex overflow-hidden rounded-lg">
                  {p.colors.map((c) => (
                    <Swatch key={c} color={c} label="" height="h-14" className="flex-1 rounded-none border-0" />
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
