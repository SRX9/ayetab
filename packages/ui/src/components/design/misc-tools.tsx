"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CIPHER_KINDS,
  DEFAULT_META_INPUT,
  OG_TYPES,
  autoDetect,
  generateMetaTags,
  runCipher,
  validateMetaTags,
  type CipherKind,
  type MetaTagInput,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  CHECKER_STYLE,
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
  canvasToBlob,
  downloadBlob,
  downloadCanvas,
  downloadText,
  useImageUpload,
} from "./shared";

// ── Barcode Generator ───────────────────────────────────────────────────────

interface Symbology {
  id: string;
  label: string;
  placeholder: string;
  note: string;
}

const SYMBOLOGIES: Symbology[] = [
  { id: "code128", label: "Code 128", placeholder: "ABC-1234", note: "General purpose, any ASCII" },
  { id: "code39", label: "Code 39", placeholder: "ABC1234", note: "Uppercase, digits, - . $ / + %" },
  { id: "ean13", label: "EAN-13", placeholder: "5901234123457", note: "Exactly 12 or 13 digits" },
  { id: "ean8", label: "EAN-8", placeholder: "96385074", note: "Exactly 7 or 8 digits" },
  { id: "upca", label: "UPC-A", placeholder: "042100005264", note: "Exactly 11 or 12 digits" },
  { id: "upce", label: "UPC-E", placeholder: "01234565", note: "Exactly 7 or 8 digits" },
  { id: "itf14", label: "ITF-14", placeholder: "0012345678905", note: "Exactly 13 or 14 digits" },
  { id: "datamatrix", label: "Data Matrix", placeholder: "https://example.com", note: "Compact 2D, any text" },
  { id: "azteccode", label: "Aztec", placeholder: "https://example.com", note: "2D, no quiet zone needed" },
  { id: "pdf417", label: "PDF417", placeholder: "Longer payloads work here", note: "2D stacked, high capacity" },
  { id: "qrcode", label: "QR Code", placeholder: "https://example.com", note: "The familiar 2D code" },
  { id: "code93", label: "Code 93", placeholder: "ABC1234", note: "Denser than Code 39" },
  { id: "codabar", label: "Codabar", placeholder: "A12345B", note: "Start/stop letters A–D" },
  { id: "msi", label: "MSI", placeholder: "1234567", note: "Digits only, inventory use" },
  { id: "gs1datamatrix", label: "GS1 Data Matrix", placeholder: "(01)09521234543213", note: "GS1 application identifiers" },
];

export function BarcodeGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [symbology, setSymbology] = useState("code128");
  const [text, setText] = useState("AYETAB-1234");
  const [showText, setShowText] = useState(true);
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(12);
  const [barColor, setBarColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);

  const active = SYMBOLOGIES.find((s) => s.id === symbology) ?? SYMBOLOGIES[0];
  const is2d = ["datamatrix", "azteccode", "pdf417", "qrcode", "gs1datamatrix"].includes(symbology);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) {
      setError(null);
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        // bwip-js is ~1MB, so it only loads when this tool is opened.
        const bwipjs = await import("bwip-js/browser");
        if (cancelled) return;
        const toCanvas = (bwipjs as unknown as {
          toCanvas: (c: HTMLCanvasElement, o: Record<string, unknown>) => void;
        }).toCanvas;

        toCanvas(canvas, {
          bcid: symbology,
          text: text.trim(),
          scale,
          height: is2d ? undefined : height,
          includetext: showText,
          textxalign: "center",
          barcolor: barColor.replace("#", ""),
          backgroundcolor: background.replace("#", ""),
          paddingwidth: 6,
          paddingheight: 6,
        });
        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "That value is not valid for this symbology.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbology, text, showText, scale, height, barColor, background, is2d]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setText("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            !error &&
            text.trim() && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => canvasRef.current && void downloadCanvas(canvasRef.current, `${symbology}.png`)}
              >
                Download PNG
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="barcode-generator">
        <Panel>
          <div className="flex flex-col gap-3">
            <ControlGrid>
              <Field label="Symbology" hint={active.note}>
                <Select
                  value={symbology}
                  onChange={setSymbology}
                  options={SYMBOLOGIES.map((s) => ({ value: s.id, label: s.label }))}
                />
              </Field>
              <Field label="Value">
                <TextInput
                  value={text}
                  onChange={setText}
                  placeholder={active.placeholder}
                  className="font-mono"
                />
              </Field>
            </ControlGrid>
            <ControlGrid className="sm:grid-cols-4">
              <Field label="Scale">
                <Range value={scale} onChange={setScale} min={1} max={10} format={(v) => `${v}×`} />
              </Field>
              {!is2d && (
                <Field label="Bar height">
                  <Range value={height} onChange={setHeight} min={4} max={40} />
                </Field>
              )}
              <Field label="Bars">
                <ColorInput value={barColor} onChange={setBarColor} />
              </Field>
              <Field label="Background">
                <ColorInput value={background} onChange={setBackground} />
              </Field>
            </ControlGrid>
            {!is2d && <Toggle checked={showText} onChange={setShowText} label="Print the value under the bars" />}
          </div>
        </Panel>

        <Panel title="Preview">
          {error && <ErrorNote>{error}</ErrorNote>}
          <div className={cn("flex justify-center rounded-md p-4", error && "opacity-30")}>
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Styled QR Generator ─────────────────────────────────────────────────────

type DotStyle = "square" | "rounded" | "dots" | "classy";

export function StyledQrTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logo = useImageUpload();
  const [text, setText] = useState("https://ayetab.dev");
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(4);
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [fg, setFg] = useState("#111111");
  const [bg, setBg] = useState("#ffffff");
  const [eyeColor, setEyeColor] = useState("#111111");
  const [gradient, setGradient] = useState(false);
  const [gradientTo, setGradientTo] = useState("#6366f1");
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("H");
  const [logoSize, setLogoSize] = useState(22);
  const [transparent, setTransparent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    let cancelled = false;

    void (async () => {
      try {
        // qrcode is already a dependency of the utils package.
        const QR = await import("qrcode");
        if (cancelled) return;

        const qr = QR.create(text, { errorCorrectionLevel: ecc });
        const moduleCount = qr.modules.size;
        const data = qr.modules.data;

        const total = moduleCount + margin * 2;
        const cell = size / total;

        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);
        if (!transparent) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, size, size);
        }

        const paint = gradient
          ? (() => {
              const g = ctx.createLinearGradient(0, 0, size, size);
              g.addColorStop(0, fg);
              g.addColorStop(1, gradientTo);
              return g;
            })()
          : fg;

        /** The three finder patterns sit in fixed corners, 7×7 modules each. */
        const inFinder = (row: number, col: number) => {
          const last = moduleCount - 7;
          return (
            (row < 7 && col < 7) || (row < 7 && col >= last) || (row >= last && col < 7)
          );
        };

        // Body modules
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (!data[row * moduleCount + col]) continue;
            if (inFinder(row, col)) continue;

            const x = (col + margin) * cell;
            const y = (row + margin) * cell;
            ctx.fillStyle = paint;

            if (dotStyle === "dots") {
              ctx.beginPath();
              ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
              ctx.fill();
            } else if (dotStyle === "rounded") {
              ctx.beginPath();
              ctx.roundRect(x, y, cell, cell, cell * 0.32);
              ctx.fill();
            } else if (dotStyle === "classy") {
              // Round only the outer corners so runs read as connected strokes.
              const up = row > 0 && data[(row - 1) * moduleCount + col];
              const down = row < moduleCount - 1 && data[(row + 1) * moduleCount + col];
              const left = col > 0 && data[row * moduleCount + col - 1];
              const right = col < moduleCount - 1 && data[row * moduleCount + col + 1];
              const r = cell * 0.45;
              ctx.beginPath();
              ctx.roundRect(x, y, cell, cell, [
                up || left ? 0 : r,
                up || right ? 0 : r,
                down || right ? 0 : r,
                down || left ? 0 : r,
              ]);
              ctx.fill();
            } else {
              ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
            }
          }
        }

        // Finder patterns, drawn as clean nested shapes.
        const drawFinder = (row: number, col: number) => {
          const x = (col + margin) * cell;
          const y = (row + margin) * cell;
          const outer = cell * 7;
          const radius = dotStyle === "square" ? 0 : outer * 0.24;

          ctx.fillStyle = eyeColor;
          ctx.beginPath();
          ctx.roundRect(x, y, outer, outer, radius);
          ctx.fill();

          ctx.fillStyle = transparent ? "rgba(0,0,0,0)" : bg;
          ctx.globalCompositeOperation = transparent ? "destination-out" : "source-over";
          ctx.beginPath();
          ctx.roundRect(x + cell, y + cell, cell * 5, cell * 5, radius * 0.7);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";

          ctx.fillStyle = eyeColor;
          ctx.beginPath();
          ctx.roundRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3, radius * 0.45);
          ctx.fill();
        };

        drawFinder(0, 0);
        drawFinder(0, moduleCount - 7);
        drawFinder(moduleCount - 7, 0);

        // Logo, punched into the centre with a background plate for contrast.
        if (logo.image) {
          const box = (size * logoSize) / 100;
          const x = (size - box) / 2;
          const y = (size - box) / 2;
          const pad = box * 0.08;

          if (!transparent) {
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.roundRect(x - pad, y - pad, box + pad * 2, box + pad * 2, box * 0.18);
            ctx.fill();
          }

          const scale = Math.min(box / logo.image.width, box / logo.image.height);
          const dw = logo.image.width * scale;
          const dh = logo.image.height * scale;
          ctx.drawImage(logo.image.el, (size - dw) / 2, (size - dh) / 2, dw, dh);
        }

        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || "Could not encode that value.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [text, size, margin, dotStyle, fg, bg, eyeColor, gradient, gradientTo, ecc, logo.image, logoSize, transparent]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setText("");
            logo.clear();
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            text.trim() &&
            !error && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => canvasRef.current && void downloadCanvas(canvasRef.current, "qr-code.png")}
              >
                Download PNG
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="qr-styled">
        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Panel title="Preview">
            <div className="flex justify-center rounded-md p-4" style={transparent ? CHECKER_STYLE : undefined}>
              <canvas ref={canvasRef} className="max-h-[26rem] max-w-full" />
            </div>
          </Panel>

          <div className="flex flex-col gap-3">
            <Panel title="Content">
              <div className="flex flex-col gap-3">
                <Field label="Text or URL">
                  <TextInput value={text} onChange={setText} placeholder="https://example.com" />
                </Field>
                <Field label="Error correction" hint="Higher levels survive a bigger logo">
                  <Segmented
                    value={ecc}
                    onChange={setEcc}
                    options={[
                      { value: "L", label: "L 7%" },
                      { value: "M", label: "M 15%" },
                      { value: "Q", label: "Q 25%" },
                      { value: "H", label: "H 30%" },
                    ]}
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Style">
              <div className="flex flex-col gap-3">
                <Field label="Module shape">
                  <Select
                    value={dotStyle}
                    onChange={setDotStyle}
                    options={[
                      { value: "square", label: "Square" },
                      { value: "rounded", label: "Rounded" },
                      { value: "dots", label: "Dots" },
                      { value: "classy", label: "Connected" },
                    ]}
                  />
                </Field>
                <Field label="Foreground">
                  <ColorInput value={fg} onChange={setFg} />
                </Field>
                <Toggle checked={gradient} onChange={setGradient} label="Gradient fill" />
                {gradient && (
                  <Field label="Gradient to">
                    <ColorInput value={gradientTo} onChange={setGradientTo} />
                  </Field>
                )}
                <Field label="Corner eyes">
                  <ColorInput value={eyeColor} onChange={setEyeColor} />
                </Field>
                <Field label="Background">
                  <ColorInput value={bg} onChange={setBg} />
                </Field>
                <Toggle checked={transparent} onChange={setTransparent} label="Transparent background" />
                <Field label="Size">
                  <Range value={size} onChange={setSize} min={128} max={1024} step={32} format={(v) => `${v}px`} />
                </Field>
                <Field label="Quiet zone">
                  <Range value={margin} onChange={setMargin} min={0} max={8} />
                </Field>
              </div>
            </Panel>

            <Panel title="Logo">
              {logo.image ? (
                <div className="flex flex-col gap-3">
                  <div className="input-well flex items-center gap-2.5 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.image.url} alt="" className="h-10 w-10 rounded object-contain" style={CHECKER_STYLE} />
                    <span className="min-w-0 flex-1 truncate text-caption">{logo.image.name}</span>
                    <Button variant="ghost" size="sm" onClick={logo.clear}>
                      ✕
                    </Button>
                  </div>
                  <Field label="Logo size" hint="Keep under 25% or the code may not scan">
                    <Range value={logoSize} onChange={setLogoSize} min={8} max={35} format={(v) => `${v}%`} />
                  </Field>
                </div>
              ) : (
                <Dropzone
                  onFiles={(f) => void logo.accept([...f][0])}
                  compact
                  label="Drop a logo"
                  hint="Optional — sits in the centre"
                />
              )}
            </Panel>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}

// ── Cipher Decoder ──────────────────────────────────────────────────────────

export function CipherDecoderTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [input, setInput] = useState("");
  const [cipher, setCipher] = useState<CipherKind>("auto");
  const [key, setKey] = useState("3");
  const [mode, setMode] = useState<"decode" | "encode">("decode");

  const spec = CIPHER_KINDS.find((c) => c.id === cipher);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return runCipher(input, cipher, key, mode);
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, cipher, key, mode]);

  const candidates = useMemo(
    () => (cipher === "auto" && input.trim() ? autoDetect(input) : []),
    [cipher, input]
  );

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setInput("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={result?.output && <CopyButton text={candidates[0]?.output ?? result.output} />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="cipher-decoder">
        <Panel>
          <div className="flex flex-col gap-3">
            <ControlGrid className="sm:grid-cols-3">
              <Field label="Cipher">
                <Select
                  value={cipher}
                  onChange={setCipher}
                  options={CIPHER_KINDS.map((c) => ({ value: c.id, label: c.label }))}
                />
              </Field>
              {spec?.needsKey && (
                <Field label={spec.needsKey === "number" ? "Shift / rails" : "Keyword"}>
                  <TextInput
                    value={key}
                    onChange={setKey}
                    className="font-mono"
                    placeholder={spec.needsKey === "number" ? "3" : "SECRET"}
                  />
                </Field>
              )}
              {cipher !== "auto" && (
                <Field label="Direction">
                  <Segmented
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "decode", label: "Decode" },
                      { value: "encode", label: "Encode" },
                    ]}
                  />
                </Field>
              )}
            </ControlGrid>
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste ciphertext (or plaintext to encode)…"
              spellCheck={false}
              className="input-well min-h-[14rem] w-full resize-y p-3 font-mono text-ui leading-relaxed"
            />
          </Panel>

          <Panel title={cipher === "auto" ? "Best match" : "Output"}>
            {result?.error ? (
              <ErrorNote>{result.error}</ErrorNote>
            ) : candidates.length > 0 ? (
              <>
                <p className="mb-2 text-label uppercase text-muted-foreground">
                  {candidates[0].cipher} · {candidates[0].detail}
                </p>
                <pre className="input-well min-h-[10rem] whitespace-pre-wrap break-words p-3 font-mono text-ui leading-relaxed">
                  {candidates[0].output}
                </pre>
              </>
            ) : result?.output ? (
              <pre className="input-well min-h-[14rem] whitespace-pre-wrap break-words p-3 font-mono text-ui leading-relaxed">
                {result.output}
              </pre>
            ) : (
              <EmptyNote>Output appears here.</EmptyNote>
            )}
          </Panel>
        </div>

        {candidates.length > 1 && (
          <Panel title="Other candidates">
            <div className="flex flex-col gap-1.5">
              {candidates.slice(1).map((c, i) => (
                <div key={i} className="input-well p-2.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-label font-medium uppercase text-muted-foreground">
                      {c.cipher} · {c.detail}
                    </span>
                    <CopyButton text={c.output} variant="ghost" />
                  </div>
                  <p className="truncate font-mono text-caption">{c.output}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </ToolShell>
  );
}

// ── Meta Tag Generator ──────────────────────────────────────────────────────

export function MetaTagGeneratorTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [input, setInput] = useState<MetaTagInput>({
    ...DEFAULT_META_INPUT,
    title: "AyeTab — every developer tool in a new tab",
    description:
      "Fifty-plus offline developer and design tools that open in a new tab. Nothing leaves your browser.",
    url: "https://ayetab.dev",
    siteName: "AyeTab",
  });

  const set = <K extends keyof MetaTagInput>(key: K, value: MetaTagInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const output = useMemo(() => generateMetaTags(input), [input]);
  const warnings = useMemo(() => validateMetaTags(input), [input]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setInput(DEFAULT_META_INPUT)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <>
              <CopyButton text={output} label="Copy tags" />
              <Button variant="outline" size="sm" onClick={() => downloadText(output, "meta-tags.html", "text/html")}>
                Download
              </Button>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="meta-tag-generator">
        <div className="flex flex-col gap-3">
          <Panel title="Page">
            <div className="flex flex-col gap-3">
              <Field label="Title" hint={`${input.title.length} / 60 characters`}>
                <TextInput value={input.title} onChange={(v) => set("title", v)} />
              </Field>
              <Field label="Description" hint={`${input.description.length} / 160 characters`}>
                <textarea
                  value={input.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className="input-well w-full resize-y p-2.5 text-sm"
                />
              </Field>
              <Field label="Canonical URL">
                <TextInput value={input.url} onChange={(v) => set("url", v)} placeholder="https://example.com/page" />
              </Field>
              <ControlGrid>
                <Field label="Site name">
                  <TextInput value={input.siteName} onChange={(v) => set("siteName", v)} />
                </Field>
                <Field label="Author">
                  <TextInput value={input.author} onChange={(v) => set("author", v)} />
                </Field>
              </ControlGrid>
            </div>
          </Panel>

          <Panel title="Social card">
            <div className="flex flex-col gap-3">
              <Field label="Image URL" hint="1200 × 630 is the safe size everywhere">
                <TextInput value={input.image} onChange={(v) => set("image", v)} placeholder="https://example.com/og.png" />
              </Field>
              <Field label="Image alt text">
                <TextInput value={input.imageAlt} onChange={(v) => set("imageAlt", v)} />
              </Field>
              <ControlGrid>
                <Field label="Open Graph type">
                  <Select
                    value={input.type}
                    onChange={(v) => set("type", v)}
                    options={OG_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                </Field>
                <Field label="Twitter card">
                  <Select
                    value={input.twitterCard}
                    onChange={(v) => set("twitterCard", v)}
                    options={[
                      { value: "summary_large_image" as const, label: "Large image" },
                      { value: "summary" as const, label: "Summary" },
                      { value: "app" as const, label: "App" },
                      { value: "player" as const, label: "Player" },
                    ]}
                  />
                </Field>
                <Field label="Site handle">
                  <TextInput value={input.twitterSite} onChange={(v) => set("twitterSite", v)} placeholder="@site" />
                </Field>
                <Field label="Creator handle">
                  <TextInput value={input.twitterCreator} onChange={(v) => set("twitterCreator", v)} placeholder="@you" />
                </Field>
              </ControlGrid>
            </div>
          </Panel>

          <Panel title="Extras">
            <div className="flex flex-col gap-3">
              <ControlGrid>
                <Field label="Keywords" hint="Comma separated">
                  <TextInput value={input.keywords} onChange={(v) => set("keywords", v)} />
                </Field>
                <Field label="Robots">
                  <Select
                    value={input.robots}
                    onChange={(v) => set("robots", v)}
                    options={[
                      { value: "index, follow", label: "index, follow" },
                      { value: "noindex, follow", label: "noindex, follow" },
                      { value: "index, nofollow", label: "index, nofollow" },
                      { value: "noindex, nofollow", label: "noindex, nofollow" },
                    ]}
                  />
                </Field>
                <Field label="Theme colour">
                  <ColorInput value={input.themeColor} onChange={(v) => set("themeColor", v)} />
                </Field>
                <Field label="Locale">
                  <TextInput value={input.locale} onChange={(v) => set("locale", v)} placeholder="en_US" />
                </Field>
              </ControlGrid>
              <div className="flex flex-wrap gap-4">
                <Toggle checked={input.viewport} onChange={(v) => set("viewport", v)} label="Viewport" />
                <Toggle checked={input.canonical} onChange={(v) => set("canonical", v)} label="Canonical" />
                <Toggle checked={input.favicon} onChange={(v) => set("favicon", v)} label="Icon links" />
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-3">
          <Panel title="Card preview">
            <div className="tool-surface overflow-hidden">
              {input.image.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={input.image}
                  alt={input.imageAlt || ""}
                  className="aspect-[1200/630] w-full bg-muted object-cover"
                />
              ) : (
                <div className="flex aspect-[1200/630] items-center justify-center bg-muted text-caption text-muted-foreground">
                  No image set
                </div>
              )}
              <div className="p-3">
                <p className="text-label uppercase text-muted-foreground">
                  {input.url.replace(/^https?:\/\//, "").split("/")[0] || "example.com"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-ui-md font-semibold leading-snug">
                  {input.title || "Page title"}
                </p>
                <p className="mt-1 line-clamp-2 text-caption leading-snug text-muted-foreground">
                  {input.description || "Page description"}
                </p>
              </div>
            </div>
          </Panel>

          {warnings.length > 0 && (
            <Panel title="Checks">
              <div className="flex flex-col gap-1.5">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-md px-3 py-2 text-caption",
                      w.level === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {w.message}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Tags">
            <pre className="input-well max-h-[24rem] overflow-auto p-3 font-mono text-caption leading-relaxed">
              {output}
            </pre>
          </Panel>
        </div>
      </div>
    </ToolShell>
  );
}

// ── Tailwind Cheat Sheet ────────────────────────────────────────────────────

interface CheatEntry {
  cls: string;
  css: string;
}

interface CheatGroup {
  name: string;
  section: string;
  entries: CheatEntry[];
}

const SPACING_SCALE = [
  ["0", "0px"], ["px", "1px"], ["0.5", "2px"], ["1", "4px"], ["1.5", "6px"], ["2", "8px"],
  ["2.5", "10px"], ["3", "12px"], ["3.5", "14px"], ["4", "16px"], ["5", "20px"], ["6", "24px"],
  ["7", "28px"], ["8", "32px"], ["9", "36px"], ["10", "40px"], ["11", "44px"], ["12", "48px"],
  ["14", "56px"], ["16", "64px"], ["20", "80px"], ["24", "96px"], ["32", "128px"], ["40", "160px"],
  ["48", "192px"], ["56", "224px"], ["64", "256px"],
];

const CHEAT_GROUPS: CheatGroup[] = [
  {
    section: "Layout",
    name: "Display",
    entries: [
      { cls: "block", css: "display: block" },
      { cls: "inline-block", css: "display: inline-block" },
      { cls: "inline", css: "display: inline" },
      { cls: "flex", css: "display: flex" },
      { cls: "inline-flex", css: "display: inline-flex" },
      { cls: "grid", css: "display: grid" },
      { cls: "inline-grid", css: "display: inline-grid" },
      { cls: "contents", css: "display: contents" },
      { cls: "hidden", css: "display: none" },
    ],
  },
  {
    section: "Layout",
    name: "Position",
    entries: [
      { cls: "static", css: "position: static" },
      { cls: "relative", css: "position: relative" },
      { cls: "absolute", css: "position: absolute" },
      { cls: "fixed", css: "position: fixed" },
      { cls: "sticky", css: "position: sticky" },
      { cls: "inset-0", css: "inset: 0" },
      { cls: "top-0 / right-0 / bottom-0 / left-0", css: "top/right/bottom/left: 0" },
      { cls: "z-10 … z-50", css: "z-index: 10 … 50" },
    ],
  },
  {
    section: "Layout",
    name: "Overflow & sizing",
    entries: [
      { cls: "overflow-auto", css: "overflow: auto" },
      { cls: "overflow-hidden", css: "overflow: hidden" },
      { cls: "overflow-x-auto", css: "overflow-x: auto" },
      { cls: "w-full / h-full", css: "width/height: 100%" },
      { cls: "w-screen / h-screen", css: "width/height: 100vw / 100vh" },
      { cls: "w-fit / w-min / w-max", css: "width: fit-content / min-content / max-content" },
      { cls: "max-w-prose", css: "max-width: 65ch" },
      { cls: "aspect-video", css: "aspect-ratio: 16 / 9" },
      { cls: "size-8", css: "width: 32px; height: 32px" },
    ],
  },
  {
    section: "Flex & Grid",
    name: "Flex",
    entries: [
      { cls: "flex-row / flex-col", css: "flex-direction: row / column" },
      { cls: "flex-wrap / flex-nowrap", css: "flex-wrap: wrap / nowrap" },
      { cls: "flex-1", css: "flex: 1 1 0%" },
      { cls: "flex-auto", css: "flex: 1 1 auto" },
      { cls: "flex-none", css: "flex: none" },
      { cls: "grow / grow-0", css: "flex-grow: 1 / 0" },
      { cls: "shrink / shrink-0", css: "flex-shrink: 1 / 0" },
      { cls: "order-1 … order-12", css: "order: 1 … 12" },
    ],
  },
  {
    section: "Flex & Grid",
    name: "Grid",
    entries: [
      { cls: "grid-cols-1 … grid-cols-12", css: "grid-template-columns: repeat(n, minmax(0,1fr))" },
      { cls: "grid-rows-1 … grid-rows-6", css: "grid-template-rows: repeat(n, minmax(0,1fr))" },
      { cls: "col-span-2", css: "grid-column: span 2 / span 2" },
      { cls: "col-start-1 / col-end-3", css: "grid-column-start / end" },
      { cls: "row-span-2", css: "grid-row: span 2 / span 2" },
      { cls: "auto-cols-fr", css: "grid-auto-columns: minmax(0, 1fr)" },
      { cls: "grid-flow-col", css: "grid-auto-flow: column" },
    ],
  },
  {
    section: "Flex & Grid",
    name: "Alignment",
    entries: [
      { cls: "items-start / center / end / stretch / baseline", css: "align-items" },
      { cls: "justify-start / center / end / between / around / evenly", css: "justify-content" },
      { cls: "self-start / center / end / stretch", css: "align-self" },
      { cls: "justify-items-center", css: "justify-items: center" },
      { cls: "place-items-center", css: "place-items: center" },
      { cls: "content-center / between", css: "align-content" },
      { cls: "gap-4 / gap-x-2 / gap-y-6", css: "gap / column-gap / row-gap" },
    ],
  },
  {
    section: "Spacing",
    name: "Padding & margin",
    entries: [
      { cls: "p-4 / px-4 / py-4 / pt-4 / pr-4 / pb-4 / pl-4", css: "padding on all / x / y / one side" },
      { cls: "ps-4 / pe-4", css: "padding-inline-start / end (RTL aware)" },
      { cls: "m-4 / mx-auto / my-2 / mt-4", css: "margin on all / x / y / one side" },
      { cls: "-mt-4", css: "margin-top: -16px" },
      { cls: "space-x-4 / space-y-4", css: "margin between children" },
      ...SPACING_SCALE.slice(0, 12).map(([k, v]) => ({ cls: `p-${k}`, css: `padding: ${v}` })),
    ],
  },
  {
    section: "Typography",
    name: "Text",
    entries: [
      { cls: "text-xs", css: "font-size: 12px; line-height: 16px" },
      { cls: "text-sm", css: "font-size: 14px; line-height: 20px" },
      { cls: "text-base", css: "font-size: 16px; line-height: 24px" },
      { cls: "text-lg", css: "font-size: 18px; line-height: 28px" },
      { cls: "text-xl", css: "font-size: 20px; line-height: 28px" },
      { cls: "text-2xl … text-9xl", css: "font-size: 24px … 128px" },
      { cls: "font-thin … font-black", css: "font-weight: 100 … 900" },
      { cls: "italic / not-italic", css: "font-style" },
      { cls: "text-left / center / right / justify", css: "text-align" },
      { cls: "uppercase / lowercase / capitalize", css: "text-transform" },
      { cls: "truncate", css: "overflow hidden + ellipsis + nowrap" },
      { cls: "line-clamp-3", css: "clamp to 3 lines" },
      { cls: "text-balance / text-pretty", css: "text-wrap: balance / pretty" },
      { cls: "tracking-tight / wide", css: "letter-spacing" },
      { cls: "leading-none … leading-loose", css: "line-height: 1 … 2" },
      { cls: "tabular-nums", css: "font-variant-numeric: tabular-nums" },
      { cls: "underline / line-through / no-underline", css: "text-decoration-line" },
      { cls: "antialiased", css: "-webkit-font-smoothing: antialiased" },
    ],
  },
  {
    section: "Appearance",
    name: "Colour",
    entries: [
      { cls: "bg-slate-500", css: "background-color: token" },
      { cls: "bg-black/50", css: "background with 50% alpha" },
      { cls: "text-red-600", css: "color: token" },
      { cls: "border-gray-200", css: "border-color: token" },
      { cls: "ring-blue-500", css: "--tw-ring-color: token" },
      { cls: "divide-gray-200", css: "border colour between children" },
      { cls: "accent-brand", css: "accent-color: token" },
      { cls: "bg-gradient-to-r from-x via-y to-z", css: "linear-gradient" },
    ],
  },
  {
    section: "Appearance",
    name: "Borders & effects",
    entries: [
      { cls: "rounded / rounded-md / rounded-lg / rounded-full", css: "border-radius" },
      { cls: "rounded-t-lg / rounded-bl-lg", css: "border-radius on one side / corner" },
      { cls: "border / border-2 / border-t", css: "border-width" },
      { cls: "shadow-sm / shadow / shadow-lg / shadow-2xl", css: "box-shadow" },
      { cls: "ring-2 ring-offset-2", css: "outline-style ring" },
      { cls: "opacity-50", css: "opacity: 0.5" },
      { cls: "blur-sm / backdrop-blur-md", css: "filter / backdrop-filter: blur()" },
      { cls: "mix-blend-multiply", css: "mix-blend-mode" },
    ],
  },
  {
    section: "Interaction",
    name: "States & motion",
    entries: [
      { cls: "hover: / focus: / active: / disabled:", css: "state variants" },
      { cls: "focus-visible:ring-2", css: "keyboard-only focus ring" },
      { cls: "group / group-hover:", css: "style a child from a parent's state" },
      { cls: "peer / peer-checked:", css: "style a sibling from its state" },
      { cls: "dark:", css: "dark colour scheme" },
      { cls: "sm: / md: / lg: / xl: / 2xl:", css: "≥640 / 768 / 1024 / 1280 / 1536px" },
      { cls: "transition / transition-colors", css: "transition-property" },
      { cls: "duration-150 / ease-out / delay-100", css: "transition timing" },
      { cls: "animate-spin / pulse / bounce", css: "built-in keyframes" },
      { cls: "motion-reduce:transition-none", css: "prefers-reduced-motion" },
      { cls: "cursor-pointer / select-none", css: "cursor / user-select" },
      { cls: "pointer-events-none", css: "pointer-events: none" },
      { cls: "sr-only", css: "visually hidden, still read aloud" },
    ],
  },
];

export function TailwindCheatsheetTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("all");

  const sections = useMemo(() => [...new Set(CHEAT_GROUPS.map((g) => g.section))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHEAT_GROUPS.map((group) => {
      if (section !== "all" && group.section !== section) return null;
      if (!q) return group;
      const entries = group.entries.filter(
        (e) => e.cls.toLowerCase().includes(q) || e.css.toLowerCase().includes(q)
      );
      return entries.length > 0 ? { ...group, entries } : null;
    }).filter((g): g is CheatGroup => g !== null);
  }, [query, section]);

  const total = filtered.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setQuery("");
            setSection("all");
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="tailwind-cheatsheet">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <Field label="Search">
              <TextInput value={query} onChange={setQuery} placeholder="flex, padding, shadow…" autoFocus />
            </Field>
          </div>
          <Field label="Section">
            <Select
              value={section}
              onChange={setSection}
              options={[{ value: "all", label: "All sections" }, ...sections.map((s) => ({ value: s, label: s }))]}
            />
          </Field>
        </div>

        {total === 0 ? (
          <EmptyNote>No utilities match “{query}”.</EmptyNote>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((group) => (
              <Panel key={`${group.section}-${group.name}`} title={`${group.section} · ${group.name}`}>
                <div className="flex flex-col">
                  {group.entries.map((e) => (
                    <button
                      key={e.cls}
                      type="button"
                      onClick={() => void navigator.clipboard?.writeText(e.cls.split(" ")[0])}
                      title="Copy class"
                      className="flex items-baseline justify-between gap-3 rounded-md border-b border-border px-1.5 py-1.5 text-left last:border-0 transition-colors hover:bg-[hsl(var(--hover-fill))]"
                    >
                      <code className="shrink-0 font-mono text-caption text-brand">{e.cls}</code>
                      <span className="min-w-0 truncate text-right font-mono text-caption text-muted-foreground">
                        {e.css}
                      </span>
                    </button>
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
