"use client";

import { useCallback, useState } from "react";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import {
  ControlGrid,
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
  Toggle,
  ToolActions,
  downloadBlob,
  formatBytes,
} from "./shared";

const PT_TO_MM = 25.4 / 72;

/** Standard sheet sizes in PostScript points. */
const SHEETS: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  a3: [841.89, 1190.55],
  letter: [612, 792],
  legal: [612, 1008],
  tabloid: [792, 1224],
};

interface LoadedPdf {
  name: string;
  size: number;
  bytes: ArrayBuffer;
}

async function readPdf(file: File): Promise<LoadedPdf> {
  return { name: file.name, size: file.size, bytes: await file.arrayBuffer() };
}

function PdfDrop({ onLoad, label, hint }: { onLoad: (p: LoadedPdf) => void; label: string; hint: string }) {
  return (
    <Dropzone
      onFiles={(files) => {
        const file = [...files][0];
        if (file) void readPdf(file).then(onLoad);
      }}
      accept="application/pdf,.pdf"
      icon="Printer"
      label={label}
      hint={hint}
    />
  );
}

// ── PDF Preflight ───────────────────────────────────────────────────────────

interface PageReport {
  index: number;
  widthPt: number;
  heightPt: number;
  rotation: number;
  hasBleed: boolean;
  hasTrim: boolean;
}

interface Preflight {
  pageCount: number;
  title: string;
  author: string;
  producer: string;
  creator: string;
  created: string;
  modified: string;
  encrypted: boolean;
  version: string;
  pages: PageReport[];
  fonts: string[];
  embeddedFonts: string[];
  hasImages: boolean;
  colorSpaces: string[];
  issues: Array<{ level: "error" | "warn" | "ok"; message: string }>;
}

export function PdfPreflightTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [report, setReport] = useState<Preflight | null>(null);
  const [file, setFile] = useState<LoadedPdf | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [minDpi, setMinDpi] = useState(300);

  const analyse = useCallback(
    async (pdf: LoadedPdf) => {
      setBusy(true);
      setError(null);
      try {
        // pdf-lib only loads when a PDF is actually opened.
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(pdf.bytes, { ignoreEncryption: true, updateMetadata: false });

        const pages: PageReport[] = doc.getPages().map((page, index) => {
          const { width, height } = page.getSize();
          // pdf-lib exposes boxes through the page's raw dictionary node.
          const node = page.node as unknown as {
            BleedBox?: () => unknown;
            TrimBox?: () => unknown;
          };
          return {
            index,
            widthPt: width,
            heightPt: height,
            rotation: page.getRotation().angle,
            hasBleed: Boolean(node.BleedBox?.()),
            hasTrim: Boolean(node.TrimBox?.()),
          };
        });

        // Scan the raw bytes for structural markers pdf-lib does not surface.
        const text = new TextDecoder("latin1").decode(new Uint8Array(pdf.bytes));
        const fontNames = [
          ...new Set(
            [...text.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-_,.]+)/g)].map((m) => m[1])
          ),
        ].sort();
        // Subset fonts carry a six-letter prefix, which implies embedding.
        const embedded = fontNames.filter((f) => /^[A-Z]{6}\+/.test(f));
        const colorSpaces = [
          ...new Set(
            [...text.matchAll(/\/(DeviceRGB|DeviceCMYK|DeviceGray|ICCBased|Separation|Indexed|Lab)\b/g)].map(
              (m) => m[1]
            )
          ),
        ].sort();
        const hasImages = /\/Subtype\s*\/Image/.test(text);
        const version = text.slice(0, 20).match(/%PDF-(\d\.\d)/)?.[1] ?? "unknown";

        const issues: Preflight["issues"] = [];

        const sizes = new Set(pages.map((p) => `${Math.round(p.widthPt)}x${Math.round(p.heightPt)}`));
        if (sizes.size > 1) {
          issues.push({ level: "warn", message: `${sizes.size} different page sizes in one document.` });
        } else {
          issues.push({ level: "ok", message: "All pages share the same size." });
        }

        const withBleed = pages.filter((p) => p.hasBleed).length;
        if (withBleed === 0) {
          issues.push({
            level: "warn",
            message: "No BleedBox defined — a commercial printer will usually ask for 3mm bleed.",
          });
        } else if (withBleed < pages.length) {
          issues.push({ level: "warn", message: `Only ${withBleed} of ${pages.length} pages define a BleedBox.` });
        } else {
          issues.push({ level: "ok", message: "Every page defines a BleedBox." });
        }

        if (pages.some((p) => !p.hasTrim)) {
          issues.push({ level: "warn", message: "Some pages have no TrimBox, so the final cut size is implied." });
        } else {
          issues.push({ level: "ok", message: "Every page defines a TrimBox." });
        }

        if (fontNames.length > 0 && embedded.length === 0) {
          issues.push({
            level: "error",
            message: "No subset-embedded fonts detected — text may reflow or substitute at the printer.",
          });
        } else if (embedded.length < fontNames.length) {
          issues.push({
            level: "warn",
            message: `${fontNames.length - embedded.length} of ${fontNames.length} fonts show no subset prefix.`,
          });
        } else if (fontNames.length > 0) {
          issues.push({ level: "ok", message: `All ${fontNames.length} fonts appear embedded.` });
        }

        if (colorSpaces.includes("DeviceRGB") && !colorSpaces.includes("DeviceCMYK")) {
          issues.push({
            level: "warn",
            message: "RGB colour only — most litho printers expect CMYK or a tagged ICC profile.",
          });
        }
        if (colorSpaces.includes("DeviceCMYK")) {
          issues.push({ level: "ok", message: "CMYK colour present." });
        }

        if (pages.some((p) => p.rotation % 360 !== 0)) {
          issues.push({ level: "warn", message: "Some pages carry a rotation flag, which can confuse imposition." });
        }

        if (hasImages) {
          issues.push({
            level: "warn",
            message: `Raster images present — check each is at least ${minDpi} dpi at its placed size.`,
          });
        }

        setReport({
          pageCount: doc.getPageCount(),
          title: doc.getTitle() ?? "",
          author: doc.getAuthor() ?? "",
          producer: doc.getProducer() ?? "",
          creator: doc.getCreator() ?? "",
          created: doc.getCreationDate()?.toLocaleString() ?? "",
          modified: doc.getModificationDate()?.toLocaleString() ?? "",
          encrypted: doc.isEncrypted,
          version,
          pages,
          fonts: fontNames,
          embeddedFonts: embedded,
          hasImages,
          colorSpaces,
          issues,
        });
      } catch (e) {
        setError((e as Error).message || "Could not read that PDF.");
      } finally {
        setBusy(false);
      }
    },
    [minDpi]
  );

  const mm = (pt: number) => (pt * PT_TO_MM).toFixed(1);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setReport(null);
            setFile(null);
            setError(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="pdf-preflight">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!report ? (
          <>
            <PdfDrop
              onLoad={(p) => {
                setFile(p);
                void analyse(p);
              }}
              label={busy ? "Analysing…" : "Drop a PDF to preflight"}
              hint="Checked entirely in your browser — the file is never uploaded"
            />
            <Field label="Expected image resolution">
              <Range value={minDpi} onChange={setMinDpi} min={72} max={600} step={6} format={(v) => `${v} dpi`} />
            </Field>
          </>
        ) : (
          <>
            <Panel title="Checks">
              <div className="flex flex-col gap-1.5">
                {report.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-2 rounded-md px-3 py-2 text-ui",
                      issue.level === "error" && "bg-destructive/10 text-destructive",
                      issue.level === "warn" && "bg-amber-500/12 text-amber-700 dark:text-amber-400",
                      issue.level === "ok" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    <span className="mt-px shrink-0 text-label font-semibold uppercase">
                      {issue.level === "ok" ? "Pass" : issue.level === "warn" ? "Check" : "Fail"}
                    </span>
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="Document">
                <StatRow label="File" value={file?.name ?? "—"} />
                <StatRow label="Size" value={file ? formatBytes(file.size) : "—"} />
                <StatRow label="PDF version" value={report.version} />
                <StatRow label="Pages" value={report.pageCount} />
                <StatRow label="Encrypted" value={report.encrypted ? "Yes" : "No"} />
                <StatRow label="Title" value={report.title || "—"} />
                <StatRow label="Author" value={report.author || "—"} />
                <StatRow label="Producer" value={report.producer || "—"} />
                <StatRow label="Created" value={report.created || "—"} />
              </Panel>

              <Panel title="Content">
                <StatRow label="Fonts referenced" value={report.fonts.length} />
                <StatRow label="Subset-embedded" value={report.embeddedFonts.length} />
                <StatRow label="Raster images" value={report.hasImages ? "Yes" : "None found"} />
                <StatRow label="Colour spaces" value={report.colorSpaces.join(", ") || "—"} />
                {report.fonts.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-label uppercase text-muted-foreground">Fonts</p>
                    <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
                      {report.fonts.map((f) => (
                        <span
                          key={f}
                          className={cn(
                            "rounded-md px-1.5 py-0.5 font-mono text-kbd",
                            /^[A-Z]{6}\+/.test(f)
                              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <Panel title={`Pages · ${report.pages.length}`}>
              <div className="max-h-64 overflow-auto">
                <table className="w-full min-w-[26rem] text-caption">
                  <thead>
                    <tr className="border-b border-border text-left text-kbd uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-1.5 font-medium">Page</th>
                      <th className="px-2 py-1.5 font-medium">Size (mm)</th>
                      <th className="px-2 py-1.5 font-medium">Size (pt)</th>
                      <th className="px-2 py-1.5 font-medium">Rotation</th>
                      <th className="px-2 py-1.5 font-medium">Boxes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pages.map((p) => (
                      <tr key={p.index} className="border-b border-border last:border-0">
                        <td className="px-2 py-1.5 tabular-nums">{p.index + 1}</td>
                        <td className="px-2 py-1.5 tabular-nums text-muted-foreground">
                          {mm(p.widthPt)} × {mm(p.heightPt)}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums text-muted-foreground">
                          {p.widthPt.toFixed(0)} × {p.heightPt.toFixed(0)}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{p.rotation}°</td>
                        <td className="px-2 py-1.5 text-muted-foreground">
                          {[p.hasBleed && "Bleed", p.hasTrim && "Trim"].filter(Boolean).join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Print Imposer ───────────────────────────────────────────────────────────

type ImposeMode = "booklet" | "nup" | "duplicate";

export function PrintImposerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [file, setFile] = useState<LoadedPdf | null>(null);
  const [mode, setMode] = useState<ImposeMode>("booklet");
  const [sheet, setSheet] = useState("a4");
  const [nup, setNup] = useState(2);
  const [gap, setGap] = useState(0);
  const [margin, setMargin] = useState(0);
  const [cropMarks, setCropMarks] = useState(false);
  const [landscape, setLandscape] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const impose = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const source = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();

      const [sw, sh] = SHEETS[sheet] ?? SHEETS.a4;
      const sheetW = landscape ? Math.max(sw, sh) : Math.min(sw, sh);
      const sheetH = landscape ? Math.min(sw, sh) : Math.max(sw, sh);

      const pageCount = source.getPageCount();

      /** Draw one embedded page centred inside a slot on the sheet. */
      const place = (
        target: Awaited<ReturnType<typeof out.addPage>>,
        embedded: Awaited<ReturnType<typeof out.embedPage>>,
        slotX: number,
        slotY: number,
        slotW: number,
        slotH: number
      ) => {
        const scale = Math.min(slotW / embedded.width, slotH / embedded.height);
        const w = embedded.width * scale;
        const h = embedded.height * scale;
        target.drawPage(embedded, {
          x: slotX + (slotW - w) / 2,
          y: slotY + (slotH - h) / 2,
          width: w,
          height: h,
        });

        if (cropMarks) {
          const len = 12;
          const line = { thickness: 0.5, color: rgb(0, 0, 0) };
          const x0 = slotX + (slotW - w) / 2;
          const y0 = slotY + (slotH - h) / 2;
          for (const [cx, cy] of [
            [x0, y0],
            [x0 + w, y0],
            [x0, y0 + h],
            [x0 + w, y0 + h],
          ]) {
            target.drawLine({ start: { x: cx - len, y: cy }, end: { x: cx - 2, y: cy }, ...line });
            target.drawLine({ start: { x: cx, y: cy - len }, end: { x: cx, y: cy - 2 }, ...line });
          }
        }
      };

      if (mode === "booklet") {
        // Saddle stitch: pad to a multiple of four, then pair outer with inner.
        const padded = Math.ceil(pageCount / 4) * 4;
        const order: Array<number | null> = [];
        for (let i = 0; i < padded / 2; i += 2) {
          const last = padded - 1 - i;
          const first = i;
          // Front of sheet: last, first. Back of sheet: first+1, last-1.
          order.push(last < pageCount ? last : null, first < pageCount ? first : null);
          order.push(first + 1 < pageCount ? first + 1 : null, last - 1 < pageCount ? last - 1 : null);
        }

        const slotW = (sheetW - margin * 2 - gap) / 2;
        const slotH = sheetH - margin * 2;

        for (let i = 0; i < order.length; i += 2) {
          const page = out.addPage([sheetW, sheetH]);
          for (const [slot, sourceIndex] of [order[i], order[i + 1]].entries()) {
            if (sourceIndex === null || sourceIndex === undefined) continue;
            const embedded = await out.embedPage(source.getPage(sourceIndex));
            place(page, embedded, margin + slot * (slotW + gap), margin, slotW, slotH);
          }
        }
      } else if (mode === "duplicate") {
        const cols = Math.max(1, Math.round(Math.sqrt(nup)));
        const rows = Math.ceil(nup / cols);
        const slotW = (sheetW - margin * 2 - gap * (cols - 1)) / cols;
        const slotH = (sheetH - margin * 2 - gap * (rows - 1)) / rows;

        for (let p = 0; p < pageCount; p++) {
          const page = out.addPage([sheetW, sheetH]);
          const embedded = await out.embedPage(source.getPage(p));
          for (let i = 0; i < nup; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            place(
              page,
              embedded,
              margin + col * (slotW + gap),
              sheetH - margin - slotH - row * (slotH + gap),
              slotW,
              slotH
            );
          }
        }
      } else {
        const cols = Math.max(1, Math.round(Math.sqrt(nup)));
        const rows = Math.ceil(nup / cols);
        const slotW = (sheetW - margin * 2 - gap * (cols - 1)) / cols;
        const slotH = (sheetH - margin * 2 - gap * (rows - 1)) / rows;

        for (let p = 0; p < pageCount; p += nup) {
          const page = out.addPage([sheetW, sheetH]);
          for (let i = 0; i < nup && p + i < pageCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const embedded = await out.embedPage(source.getPage(p + i));
            place(
              page,
              embedded,
              margin + col * (slotW + gap),
              sheetH - margin - slotH - row * (slotH + gap),
              slotW,
              slotH
            );
          }
        }
      }

      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${file.name.replace(/\.pdf$/i, "")}-${mode}.pdf`
      );
    } catch (e) {
      setError((e as Error).message || "Imposition failed.");
    } finally {
      setBusy(false);
    }
  }, [file, mode, sheet, nup, gap, margin, cropMarks, landscape]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setFile(null);
            setError(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            file && (
              <Button variant="primary" size="sm" onClick={() => void impose()} disabled={busy}>
                {busy ? "Imposing…" : "Impose & download"}
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="print-imposer">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!file ? (
          <PdfDrop
            onLoad={setFile}
            label="Drop a PDF to impose"
            hint="Booklet, N-up and repeat layouts — all processed locally"
          />
        ) : (
          <>
            <Panel title="Source">
              <StatRow label="File" value={file.name} />
              <StatRow label="Size" value={formatBytes(file.size)} />
            </Panel>

            <Panel title="Imposition">
              <div className="flex flex-col gap-3">
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "booklet", label: "Booklet" },
                    { value: "nup", label: "N-up" },
                    { value: "duplicate", label: "Repeat" },
                  ]}
                />

                <p className="text-caption leading-relaxed text-muted-foreground">
                  {mode === "booklet" &&
                    "Two pages per side in saddle-stitch order. Print double-sided, flip on the short edge, fold and staple down the middle."}
                  {mode === "nup" &&
                    "Several sequential pages per sheet — the usual way to proof or save paper."}
                  {mode === "duplicate" &&
                    "Repeats each page across the sheet, for stickers, business cards or tickets."}
                </p>

                <ControlGrid className="sm:grid-cols-2">
                  <Field label="Sheet size">
                    <Select
                      value={sheet}
                      onChange={setSheet}
                      options={[
                        { value: "a4", label: "A4" },
                        { value: "a3", label: "A3" },
                        { value: "letter", label: "US Letter" },
                        { value: "legal", label: "US Legal" },
                        { value: "tabloid", label: "Tabloid" },
                      ]}
                    />
                  </Field>
                  {mode !== "booklet" && (
                    <Field label="Pages per sheet">
                      <Select
                        value={String(nup)}
                        onChange={(v) => setNup(Number(v))}
                        options={[
                          { value: "2", label: "2-up" },
                          { value: "4", label: "4-up" },
                          { value: "6", label: "6-up" },
                          { value: "9", label: "9-up" },
                          { value: "16", label: "16-up" },
                        ]}
                      />
                    </Field>
                  )}
                  <Field label="Margin">
                    <Range value={margin} onChange={setMargin} min={0} max={72} format={(v) => `${(v * PT_TO_MM).toFixed(0)}mm`} />
                  </Field>
                  <Field label="Gutter">
                    <Range value={gap} onChange={setGap} min={0} max={72} format={(v) => `${(v * PT_TO_MM).toFixed(0)}mm`} />
                  </Field>
                </ControlGrid>

                <div className="flex flex-wrap gap-4">
                  <Toggle checked={landscape} onChange={setLandscape} label="Landscape sheet" />
                  <Toggle checked={cropMarks} onChange={setCropMarks} label="Crop marks" />
                </div>
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

// ── Zine Imposer ────────────────────────────────────────────────────────────

type ZineKind = "mini8" | "accordion" | "quarter";

export function ZineImposerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [file, setFile] = useState<LoadedPdf | null>(null);
  const [kind, setKind] = useState<ZineKind>("mini8");
  const [sheet, setSheet] = useState("a4");
  const [foldGuides, setFoldGuides] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const impose = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const source = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();

      const [sw, sh] = SHEETS[sheet] ?? SHEETS.a4;
      // A mini-zine sheet is always landscape.
      const sheetW = Math.max(sw, sh);
      const sheetH = Math.min(sw, sh);

      const pageCount = source.getPageCount();
      const page = out.addPage([sheetW, sheetH]);

      const draw = async (
        sourceIndex: number,
        x: number,
        y: number,
        w: number,
        h: number,
        rotate180: boolean
      ) => {
        if (sourceIndex >= pageCount) return;
        const embedded = await out.embedPage(source.getPage(sourceIndex));
        const scale = Math.min(w / embedded.width, h / embedded.height);
        const dw = embedded.width * scale;
        const dh = embedded.height * scale;
        const dx = x + (w - dw) / 2;
        const dy = y + (h - dh) / 2;

        if (rotate180) {
          // pdf-lib rotates about the origin, so shift by the full size first.
          page.drawPage(embedded, {
            x: dx + dw,
            y: dy + dh,
            width: dw,
            height: dh,
            rotate: { type: "degrees", angle: 180 } as never,
          });
        } else {
          page.drawPage(embedded, { x: dx, y: dy, width: dw, height: dh });
        }
      };

      if (kind === "mini8") {
        // Classic 8-page single-sheet fold: top row is upside down, and the
        // cut runs along the middle of the two centre panels.
        const cellW = sheetW / 4;
        const cellH = sheetH / 2;
        // Bottom row, left→right: pages 5,4,3,2 → indices 4,3,2,1
        const bottom = [4, 3, 2, 1];
        // Top row, left→right (inverted): pages 6,7,8,1 → indices 5,6,7,0
        const top = [5, 6, 7, 0];

        for (let col = 0; col < 4; col++) {
          await draw(bottom[col], col * cellW, 0, cellW, cellH, false);
          await draw(top[col], col * cellW, cellH, cellW, cellH, true);
        }

        if (foldGuides) {
          const dash = { thickness: 0.5, color: rgb(0.65, 0.65, 0.65), dashArray: [4, 4] };
          for (let col = 1; col < 4; col++) {
            page.drawLine({ start: { x: col * cellW, y: 0 }, end: { x: col * cellW, y: sheetH }, ...dash });
          }
          page.drawLine({ start: { x: 0, y: cellH }, end: { x: sheetW, y: cellH }, ...dash });
          // Solid cut line across the two centre panels.
          page.drawLine({
            start: { x: cellW, y: cellH },
            end: { x: cellW * 3, y: cellH },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
        }
      } else if (kind === "accordion") {
        const panels = Math.min(8, Math.max(2, pageCount));
        const cellW = sheetW / panels;
        for (let i = 0; i < panels; i++) {
          await draw(i, i * cellW, 0, cellW, sheetH, false);
        }
        if (foldGuides) {
          for (let i = 1; i < panels; i++) {
            page.drawLine({
              start: { x: i * cellW, y: 0 },
              end: { x: i * cellW, y: sheetH },
              thickness: 0.5,
              color: rgb(0.65, 0.65, 0.65),
              dashArray: [4, 4],
            });
          }
        }
      } else {
        // Quarter fold: 4 panels, top row inverted.
        const cellW = sheetW / 2;
        const cellH = sheetH / 2;
        await draw(3, 0, cellH, cellW, cellH, true);
        await draw(0, cellW, cellH, cellW, cellH, true);
        await draw(1, 0, 0, cellW, cellH, false);
        await draw(2, cellW, 0, cellW, cellH, false);

        if (foldGuides) {
          const dash = { thickness: 0.5, color: rgb(0.65, 0.65, 0.65), dashArray: [4, 4] };
          page.drawLine({ start: { x: cellW, y: 0 }, end: { x: cellW, y: sheetH }, ...dash });
          page.drawLine({ start: { x: 0, y: cellH }, end: { x: sheetW, y: cellH }, ...dash });
        }
      }

      const bytes = await out.save();
      downloadBlob(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
        `${file.name.replace(/\.pdf$/i, "")}-zine.pdf`
      );
    } catch (e) {
      setError((e as Error).message || "Imposition failed.");
    } finally {
      setBusy(false);
    }
  }, [file, kind, sheet, foldGuides]);

  const INSTRUCTIONS: Record<ZineKind, string> = {
    mini8:
      "Print single-sided. Fold in half the long way, then in half twice more. Unfold to the half-fold, cut the solid centre line, then push the ends together and fold into a booklet.",
    accordion:
      "Print single-sided. Fold along each dashed line, alternating direction, to make a concertina.",
    quarter:
      "Print single-sided. Fold in half top to bottom, then left to right, to make a four-page card.",
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setFile(null);
            setError(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            file && (
              <Button variant="primary" size="sm" onClick={() => void impose()} disabled={busy}>
                {busy ? "Imposing…" : "Impose & download"}
              </Button>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="zine-imposer">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!file ? (
          <PdfDrop
            onLoad={setFile}
            label="Drop a PDF to fold into a zine"
            hint="8 pages for a mini-zine, up to 8 panels for an accordion"
          />
        ) : (
          <>
            <Panel title="Source">
              <StatRow label="File" value={file.name} />
              <StatRow label="Size" value={formatBytes(file.size)} />
            </Panel>

            <Panel title="Fold">
              <div className="flex flex-col gap-3">
                <Segmented
                  value={kind}
                  onChange={setKind}
                  options={[
                    { value: "mini8", label: "8-page mini-zine" },
                    { value: "accordion", label: "Accordion" },
                    { value: "quarter", label: "Quarter fold" },
                  ]}
                />
                <ControlGrid>
                  <Field label="Sheet size">
                    <Select
                      value={sheet}
                      onChange={setSheet}
                      options={[
                        { value: "a4", label: "A4" },
                        { value: "a3", label: "A3" },
                        { value: "letter", label: "US Letter" },
                        { value: "legal", label: "US Legal" },
                      ]}
                    />
                  </Field>
                  <div className="flex items-end pb-1">
                    <Toggle checked={foldGuides} onChange={setFoldGuides} label="Print fold & cut guides" />
                  </div>
                </ControlGrid>

                <div className="rounded-md bg-muted p-3">
                  <p className="mb-1 text-label font-semibold uppercase text-muted-foreground">
                    How to fold
                  </p>
                  <p className="text-caption leading-relaxed">{INSTRUCTIONS[kind]}</p>
                </div>
              </div>
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}
