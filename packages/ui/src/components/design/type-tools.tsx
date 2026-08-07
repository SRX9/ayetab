"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PAPER_SERIES,
  PAPER_SIZES,
  TYPO_UNIT_LABELS,
  convertTypoUnits,
  paperDimensions,
  type PaperSize,
  type TypoUnitId,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { useClipboard } from "../../hooks/use-clipboard";
import {
  ColorInput,
  ControlGrid,
  CopyButton,
  CustomToolProps,
  Dropzone,
  EmptyNote,
  ErrorNote,
  Field,
  NumberInput,
  Panel,
  Range,
  Segmented,
  Select,
  StatRow,
  TextInput,
  Toggle,
  ToolActions,
  downloadText,
} from "./shared";

// ── PX to REM ───────────────────────────────────────────────────────────────

const CONVERT_UNITS: TypoUnitId[] = ["px", "rem", "em", "percent", "pt", "pc", "mm", "cm", "in"];

/** The scale most design systems reach for, converted on the fly. */
const SCALE = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

export function PxToRemTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [value, setValue] = useState(16);
  const [unit, setUnit] = useState<TypoUnitId>("px");
  const [rootSize, setRootSize] = useState(16);
  const [parentSize, setParentSize] = useState(16);

  const result = useMemo(
    () => convertTypoUnits(Number.isFinite(value) ? value : 0, unit, rootSize || 16, parentSize || 16),
    [value, unit, rootSize, parentSize]
  );

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setValue(16);
            setUnit("px");
            setRootSize(16);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="px-to-rem">
        <Panel>
          <ControlGrid className="sm:grid-cols-4">
            <Field label="Value">
              <NumberInput value={value} onChange={setValue} step={0.5} />
            </Field>
            <Field label="From unit">
              <Select
                value={unit}
                onChange={setUnit}
                options={CONVERT_UNITS.map((u) => ({ value: u, label: TYPO_UNIT_LABELS[u] }))}
              />
            </Field>
            <Field label="Root font size" hint="html { font-size }">
              <NumberInput value={rootSize} onChange={setRootSize} min={1} suffix="px" />
            </Field>
            <Field label="Parent font size" hint="What em and % resolve against">
              <NumberInput value={parentSize} onChange={setParentSize} min={1} suffix="px" />
            </Field>
          </ControlGrid>
        </Panel>

        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
          {CONVERT_UNITS.map((u) => {
            const out = result[u];
            const text = `${Number(out.toFixed(u === "px" ? 2 : 4))}${
              u === "percent" ? "%" : u === "em" || u === "rem" ? u : u
            }`;
            return (
              <button
                key={u}
                type="button"
                onClick={() => void navigator.clipboard?.writeText(text)}
                className={cn(
                  "tool-surface px-3 py-2.5 text-left transition-colors",
                  "hover:bg-[hsl(var(--hover-fill))]",
                  u === unit && "border-brand/60 bg-brand/5"
                )}
              >
                <p className="text-label uppercase text-muted-foreground">
                  {TYPO_UNIT_LABELS[u]}
                </p>
                <p className="text-lg font-semibold tabular-nums">{text}</p>
              </button>
            );
          })}
        </div>

        <Panel title={`Common scale at ${rootSize}px root`}>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {SCALE.map((px) => (
              <div
                key={px}
                className="input-well flex items-baseline justify-between gap-2 px-2.5 py-1.5"
              >
                <span className="text-caption tabular-nums text-muted-foreground">{px}px</span>
                <span className="text-ui font-medium tabular-nums">
                  {Number((px / (rootSize || 16)).toFixed(4))}rem
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Typography Calculator ───────────────────────────────────────────────────

const ALL_TYPO_UNITS: TypoUnitId[] = ["px", "pt", "pc", "em", "rem", "percent", "mm", "cm", "in", "ex", "ch"];

export function TypoCalcTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [value, setValue] = useState(12);
  const [unit, setUnit] = useState<TypoUnitId>("pt");
  const [rootSize, setRootSize] = useState(16);
  const [dpi, setDpi] = useState(96);

  const result = useMemo(
    () => convertTypoUnits(Number.isFinite(value) ? value : 0, unit, rootSize || 16, rootSize || 16, dpi || 96),
    [value, unit, rootSize, dpi]
  );

  const table = ALL_TYPO_UNITS.map((u) => ({
    unit: u,
    label: TYPO_UNIT_LABELS[u],
    value: Number(result[u].toFixed(4)),
  }));

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setValue(12);
            setUnit("pt");
            setDpi(96);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <CopyButton
              text={table.map((t) => `${t.label}: ${t.value}`).join("\n")}
              label="Copy all"
            />
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="typo-calc">
        <Panel>
          <ControlGrid className="sm:grid-cols-4">
            <Field label="Value">
              <NumberInput value={value} onChange={setValue} step={0.25} />
            </Field>
            <Field label="Unit">
              <Select
                value={unit}
                onChange={setUnit}
                options={ALL_TYPO_UNITS.map((u) => ({ value: u, label: TYPO_UNIT_LABELS[u] }))}
              />
            </Field>
            <Field label="Root size">
              <NumberInput value={rootSize} onChange={setRootSize} min={1} suffix="px" />
            </Field>
            <Field label="Resolution" hint="96 for screen, 300 for print">
              <NumberInput value={dpi} onChange={setDpi} min={36} max={1200} suffix="dpi" />
            </Field>
          </ControlGrid>
        </Panel>

        <Panel title="Equivalents">
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {table.map((t) => (
              <div
                key={t.unit}
                className={cn(
                  "input-well flex items-baseline justify-between gap-2 px-2.5 py-2",
                  t.unit === unit && "bg-brand/8 ring-1 ring-brand/40"
                )}
              >
                <span className="text-caption text-muted-foreground">{t.label}</span>
                <span className="text-ui font-semibold tabular-nums">{t.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-caption leading-relaxed text-muted-foreground">
            ex and ch are approximated at half an em — the true values depend on the font in use.
          </p>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Line Height Calculator ──────────────────────────────────────────────────

export function LineHeightCalcTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [fontSize, setFontSize] = useState(16);
  const [measure, setMeasure] = useState(65);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [manual, setManual] = useState(false);
  const [sample, setSample] = useState(
    "Typography is the craft of endowing human language with a durable visual form. Good line height keeps the eye moving without losing its place on the return sweep."
  );

  /**
   * Longer measures need more leading to keep the return sweep reliable; the
   * relationship used here is the common 1.4-at-45ch to 1.75-at-90ch ramp,
   * pulled tighter as the type gets larger.
   */
  const suggested = useMemo(() => {
    const measureFactor = 1.35 + Math.max(0, Math.min(1, (measure - 40) / 55)) * 0.4;
    const sizeFactor = fontSize >= 32 ? -0.18 : fontSize >= 24 ? -0.1 : fontSize <= 13 ? 0.06 : 0;
    return Math.round((measureFactor + sizeFactor) * 100) / 100;
  }, [measure, fontSize]);

  const active = manual ? lineHeight : suggested;
  const px = Math.round(fontSize * active * 100) / 100;

  const css = `font-size: ${fontSize}px;\nline-height: ${active};\nmax-width: ${measure}ch;`;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setFontSize(16);
            setMeasure(65);
            setManual(false);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={<CopyButton text={css} label="Copy CSS" />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="line-height-calc">
        <Panel>
          <div className="flex flex-col gap-3">
            <ControlGrid className="sm:grid-cols-3">
              <Field label="Font size">
                <Range value={fontSize} onChange={setFontSize} min={9} max={72} format={(v) => `${v}px`} />
              </Field>
              <Field label="Measure" hint="Characters per line">
                <Range value={measure} onChange={setMeasure} min={20} max={120} format={(v) => `${v}ch`} />
              </Field>
              <Field label="Line height">
                <Range
                  value={manual ? lineHeight : suggested}
                  onChange={(v) => {
                    setManual(true);
                    setLineHeight(v);
                  }}
                  min={0.9}
                  max={2.6}
                  step={0.01}
                />
              </Field>
            </ControlGrid>
            <div className="flex flex-wrap items-center gap-3">
              <Toggle checked={!manual} onChange={(v) => setManual(!v)} label="Use suggested value" />
              {manual && suggested !== active && (
                <Button variant="outline" size="sm" onClick={() => setManual(false)}>
                  Reset to {suggested}
                </Button>
              )}
            </div>
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3">
          <Panel className="text-center">
            <p className="text-3xl font-semibold tabular-nums">{active}</p>
            <p className="mt-1 text-label uppercase text-muted-foreground">Unitless</p>
          </Panel>
          <Panel className="text-center">
            <p className="text-3xl font-semibold tabular-nums">{px}px</p>
            <p className="mt-1 text-label uppercase text-muted-foreground">Computed</p>
          </Panel>
          <Panel className="text-center">
            <p className="text-3xl font-semibold tabular-nums">{suggested}</p>
            <p className="mt-1 text-label uppercase text-muted-foreground">Suggested</p>
          </Panel>
        </div>

        <Panel title="Preview">
          <textarea
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            rows={3}
            aria-label="Preview text"
            className="input-well mb-3 w-full resize-y p-2.5 text-ui"
          />
          <div
            className="input-well p-4"
            style={{ fontSize: `${fontSize}px`, lineHeight: active, maxWidth: `${measure}ch` }}
          >
            {sample}
          </div>
        </Panel>

        <Panel title="CSS">
          <pre className="input-well overflow-auto p-3 font-mono text-caption">{css}</pre>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Large Type ──────────────────────────────────────────────────────────────

export function LargeTypeTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [text, setText] = useState("");
  const [mono, setMono] = useState(true);
  const [size, setSize] = useState(14);
  const [color, setColor] = useState("#111111");
  const [background, setBackground] = useState("#ffffff");
  const [group, setGroup] = useState(false);

  const shown = useMemo(() => {
    const raw = text.trim() || "Type something";
    if (!group) return raw;
    // Group digits in fours so long codes stay readable across a room.
    return raw.replace(/\d{5,}/g, (run) => run.replace(/(\d{4})(?=\d)/g, "$1 "));
  }, [text, group]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setText("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={text.trim() && <CopyButton text={text} />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="large-type">
        <Panel>
          <div className="flex flex-col gap-3">
            <Field label="Text">
              <TextInput
                value={text}
                onChange={setText}
                placeholder="A code, a number, a name…"
                autoFocus
              />
            </Field>
            <ControlGrid className="sm:grid-cols-4">
              <Field label="Size">
                <Range value={size} onChange={setSize} min={4} max={40} format={(v) => `${v}vw`} />
              </Field>
              <Field label="Text">
                <ColorInput value={color} onChange={setColor} />
              </Field>
              <Field label="Background">
                <ColorInput value={background} onChange={setBackground} />
              </Field>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <Toggle checked={mono} onChange={setMono} label="Monospace" />
                <Toggle checked={group} onChange={setGroup} label="Group long digits" />
              </div>
            </ControlGrid>
          </div>
        </Panel>

        <div
          className="tool-surface flex min-h-[16rem] items-center justify-center break-all p-6 text-center"
          style={{
            backgroundColor: background,
            color,
            fontSize: `${size}vw`,
            fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: mono ? "0.02em" : "-0.02em",
          }}
        >
          {shown}
        </div>
      </div>
    </ToolShell>
  );
}

// ── Glyph Browser ───────────────────────────────────────────────────────────

interface UnicodeBlock {
  name: string;
  start: number;
  end: number;
}

const BLOCKS: UnicodeBlock[] = [
  { name: "Basic Latin", start: 0x0020, end: 0x007e },
  { name: "Latin-1 Supplement", start: 0x00a0, end: 0x00ff },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017f },
  { name: "Greek & Coptic", start: 0x0370, end: 0x03ff },
  { name: "Cyrillic", start: 0x0400, end: 0x04ff },
  { name: "General Punctuation", start: 0x2000, end: 0x206f },
  { name: "Superscripts & Subscripts", start: 0x2070, end: 0x209f },
  { name: "Currency Symbols", start: 0x20a0, end: 0x20bf },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214f },
  { name: "Number Forms", start: 0x2150, end: 0x218f },
  { name: "Arrows", start: 0x2190, end: 0x21ff },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22ff },
  { name: "Box Drawing", start: 0x2500, end: 0x257f },
  { name: "Block Elements", start: 0x2580, end: 0x259f },
  { name: "Geometric Shapes", start: 0x25a0, end: 0x25ff },
  { name: "Miscellaneous Symbols", start: 0x2600, end: 0x26ff },
  { name: "Dingbats", start: 0x2700, end: 0x27bf },
  { name: "Braille Patterns", start: 0x2800, end: 0x28ff },
  { name: "CJK Symbols & Punctuation", start: 0x3000, end: 0x303f },
  { name: "Shavian", start: 0x10450, end: 0x1047f },
  { name: "Mathematical Alphanumerics", start: 0x1d400, end: 0x1d4ff },
  { name: "Emoticons", start: 0x1f600, end: 0x1f64f },
  { name: "Transport & Map", start: 0x1f680, end: 0x1f6ff },
];

export function GlyphBrowserTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [blockName, setBlockName] = useState(BLOCKS[0].name);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const { copied, copy } = useClipboard(1200);

  const block = BLOCKS.find((b) => b.name === blockName) ?? BLOCKS[0];

  const glyphs = useMemo(() => {
    const q = query.trim();
    if (q) {
      // A hex code point search jumps straight to that character.
      const asHex = q.replace(/^(u\+|0x|\\u)/i, "");
      if (/^[0-9a-f]{2,6}$/i.test(asHex)) {
        const cp = parseInt(asHex, 16);
        if (cp >= 32 && cp <= 0x10ffff) return [cp];
      }
      // Otherwise treat the query as literal characters to inspect.
      return [...q].map((c) => c.codePointAt(0) ?? 32);
    }
    const out: number[] = [];
    for (let cp = block.start; cp <= block.end; cp++) out.push(cp);
    return out;
  }, [block, query]);

  const detail = selected !== null ? String.fromCodePoint(selected) : null;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setQuery("");
            setSelected(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="glyph-browser">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Block" className="min-w-[14rem]">
            <Select
              value={blockName}
              onChange={setBlockName}
              options={BLOCKS.map((b) => ({ value: b.name, label: b.name }))}
            />
          </Field>
          <div className="min-w-[12rem] flex-1">
            <Field label="Search" hint="Paste characters, or a code point like U+2603">
              <TextInput value={query} onChange={setQuery} placeholder="U+2603 or ★" />
            </Field>
          </div>
        </div>

        {detail !== null && selected !== null && (
          <Panel title="Selected">
            <div className="flex flex-wrap items-center gap-5">
              <span className="text-6xl leading-none">{detail}</span>
              <div className="grid flex-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <StatRow label="Code point" value={`U+${selected.toString(16).toUpperCase().padStart(4, "0")}`} />
                <StatRow label="Decimal" value={selected} />
                <StatRow label="HTML entity" value={`&#${selected};`} />
                <StatRow label="CSS escape" value={`\\${selected.toString(16)}`} />
                <StatRow label="JS escape" value={`\\u{${selected.toString(16)}}`} />
                <StatRow label="UTF-8 bytes" value={new TextEncoder().encode(detail).length} />
              </div>
              <div className="flex flex-col gap-1.5">
                <CopyButton text={detail} label="Copy glyph" />
                <CopyButton text={`U+${selected.toString(16).toUpperCase().padStart(4, "0")}`} label="Copy code" />
                <CopyButton text={`&#${selected};`} label="Copy entity" />
              </div>
            </div>
          </Panel>
        )}

        <Panel title={query.trim() ? `Results · ${glyphs.length}` : `${block.name} · ${glyphs.length} glyphs`}>
          {glyphs.length === 0 ? (
            <EmptyNote>Nothing to show.</EmptyNote>
          ) : (
            <div
              className="grid max-h-[26rem] gap-1 overflow-y-auto"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(3rem, 1fr))" }}
            >
              {glyphs.map((cp) => (
                <button
                  key={cp}
                  type="button"
                  title={`U+${cp.toString(16).toUpperCase().padStart(4, "0")}`}
                  onClick={() => {
                    setSelected(cp);
                    void copy(String.fromCodePoint(cp));
                  }}
                  className={cn(
                    "input-well flex aspect-square items-center justify-center text-xl transition-colors",
                    "hover:bg-[hsl(var(--hover-fill))]",
                    cp === selected && "border-brand bg-brand/10"
                  )}
                >
                  {String.fromCodePoint(cp)}
                </button>
              ))}
            </div>
          )}
          {copied && <p className="mt-2 text-center text-caption text-brand">Copied to clipboard</p>}
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Paper Sizes ─────────────────────────────────────────────────────────────

export function PaperSizesTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [series, setSeries] = useState("ISO A");
  const [dpi, setDpi] = useState(300);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [selected, setSelected] = useState<PaperSize | null>(null);

  const sizes = PAPER_SIZES.filter((s) => s.series === series);
  const active = selected && selected.series === series ? selected : sizes[0];
  const dims = active ? paperDimensions(active, dpi || 300) : null;

  const orient = <T,>([a, b]: [T, T]): [T, T] => (orientation === "portrait" ? [a, b] : [b, a]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setSeries("ISO A");
            setDpi(300);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="paper-sizes">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Series">
            <Select
              value={series}
              onChange={setSeries}
              options={PAPER_SERIES.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Orientation">
            <Segmented
              value={orientation}
              onChange={setOrientation}
              options={[
                { value: "portrait", label: "Portrait" },
                { value: "landscape", label: "Landscape" },
              ]}
            />
          </Field>
          <Field label="Resolution">
            <NumberInput value={dpi} onChange={setDpi} min={36} max={1200} suffix="dpi" />
          </Field>
        </div>

        {active && dims && (
          <Panel title={active.name}>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div className="flex items-center justify-center">
                <div
                  className="tool-surface"
                  style={{
                    width: orientation === "portrait" ? `${110 / dims.ratio}px` : "110px",
                    height: orientation === "portrait" ? "110px" : `${110 / dims.ratio}px`,
                  }}
                />
              </div>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <StatRow label="Millimetres" value={orient(dims.mm).map((n) => n.toFixed(1)).join(" × ")} />
                <StatRow label="Centimetres" value={orient(dims.cm).map((n) => n.toFixed(2)).join(" × ")} />
                <StatRow label="Inches" value={orient(dims.in).map((n) => n.toFixed(2)).join(" × ")} />
                <StatRow label="Points" value={orient(dims.pt).map((n) => n.toFixed(0)).join(" × ")} />
                <StatRow label={`Pixels @ ${dpi}dpi`} value={orient(dims.px).join(" × ")} />
                <StatRow label="Aspect ratio" value={`1 : ${dims.ratio.toFixed(3)}`} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <CopyButton text={`${orient(dims.mm).map((n) => n.toFixed(1)).join(" × ")} mm`} label="Copy mm" />
              <CopyButton text={`${orient(dims.px).join(" × ")} px`} label="Copy px" />
              <CopyButton
                text={`width: ${orient(dims.mm)[0]}mm;\nheight: ${orient(dims.mm)[1]}mm;`}
                label="Copy CSS"
              />
            </div>
          </Panel>
        )}

        <Panel title={`${series} sizes`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] text-ui">
              <thead>
                <tr className="border-b border-border text-left text-label uppercase text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">mm</th>
                  <th className="px-2 py-2 font-medium">inches</th>
                  <th className="px-2 py-2 font-medium">px @ {dpi}dpi</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((s) => {
                  const d = paperDimensions(s, dpi || 300);
                  const isActive = active?.name === s.name;
                  return (
                    <tr
                      key={s.name}
                      tabIndex={0}
                      onClick={() => setSelected(s)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(s);
                        }
                      }}
                      className={cn(
                        "cursor-pointer border-b border-border last:border-0 transition-colors",
                        isActive
                          ? "bg-brand/8"
                          : "hover:bg-[hsl(var(--hover-fill))]"
                      )}
                    >
                      <td className="px-2 py-2 font-medium">{s.name}</td>
                      <td className="px-2 py-2 tabular-nums text-muted-foreground">
                        {orient(d.mm).map((n) => n.toFixed(1)).join(" × ")}
                      </td>
                      <td className="px-2 py-2 tabular-nums text-muted-foreground">
                        {orient(d.in).map((n) => n.toFixed(2)).join(" × ")}
                      </td>
                      <td className="px-2 py-2 tabular-nums text-muted-foreground">
                        {orient(d.px).join(" × ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </ToolShell>
  );
}
