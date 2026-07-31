"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DOC_FORMATS,
  computeWordStats,
  convertDocument,
  detectDocFormat,
  toShavian,
  SHAVIAN_ALPHABET,
  type DocFormat,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import {
  ControlGrid,
  CopyButton,
  CustomToolProps,
  Dropzone,
  EmptyNote,
  ErrorNote,
  Field,
  LoadingState,
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
  formatBytes,
} from "./shared";

// ── Markdown Editor ─────────────────────────────────────────────────────────

interface EditorState {
  text: string;
}

const EDITOR_DEFAULT: EditorState = { text: "" };

const STARTER = `# Untitled

Start writing. This editor saves to your browser as you type — nothing is sent anywhere.

## Formatting

- **Bold** and *italic*
- \`inline code\`
- [links](https://example.com)

> Blockquotes work too.
`;

export function MarkdownEditorTool({ tool, onRecent, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { state, saveState, clearState, isHydrated } = useJsonToolState(tool.id, EDITOR_DEFAULT, onRecent);
  const [view, setView] = useState<"split" | "write" | "read">("split");
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState(15);

  const text = state.text;
  // convertDocument emits a full HTML document; the preview only wants the body.
  const fullHtml = useMemo(() => {
    if (!text.trim()) return "";
    try {
      return convertDocument(text, "markdown", "html").output;
    } catch {
      return "";
    }
  }, [text]);

  const html = useMemo(
    () => fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1]?.trim() ?? fullHtml,
    [fullHtml]
  );

  const stats = useMemo(() => computeWordStats(text), [text]);
  const readingTime = Math.max(1, Math.round(stats.readingTimeSeconds / 60));

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={clearState}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <>
              <CopyButton text={text} label="Copy" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadText(text, "document.md", "text/markdown")}
              >
                .md
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadText(fullHtml, "document.html", "text/html")}
              >
                .html
              </Button>
            </>
          }
        />
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-3" data-testid="markdown-editor">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: "write", label: "Write" },
                { value: "split", label: "Split" },
                { value: "read", label: "Read" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Toggle checked={focusMode} onChange={setFocusMode} label="Focus" />
              <div className="w-36">
                <Range value={fontSize} onChange={setFontSize} min={12} max={24} format={(v) => `${v}px`} />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-3",
              view === "split" ? "lg:grid-cols-2" : "grid-cols-1",
              focusMode && "mx-auto w-full max-w-3xl"
            )}
          >
            {view !== "read" && (
              <textarea
                value={text}
                onChange={(e) => saveState({ text: e.target.value })}
                placeholder={STARTER}
                spellCheck
                className={cn(
                  "min-h-[26rem] w-full resize-y rounded-md border border-border bg-card p-5",
                  "font-mono leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                  focusMode && "border-transparent bg-transparent"
                )}
                style={{ fontSize: `${fontSize}px` }}
              />
            )}
            {view !== "write" && (
              <div
                className={cn(
                  "prose-tool min-h-[26rem] overflow-auto rounded-md border border-border bg-card p-5",
                  focusMode && "border-transparent bg-transparent"
                )}
                style={{ fontSize: `${fontSize}px` }}
                // Rendered from the user's own markdown in their own browser.
                dangerouslySetInnerHTML={{ __html: html || "<p class='opacity-50'>Nothing yet.</p>" }}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 px-1 text-caption tabular-nums text-muted-foreground">
            <span>{stats.words.toLocaleString()} words</span>
            <span>{stats.characters.toLocaleString()} characters</span>
            <span>{stats.paragraphs} paragraphs</span>
            <span>~{readingTime} min read</span>
            <span>Saved locally</span>
          </div>
        </div>
      )}
    </ToolShell>
  );
}

// ── Text Scratchpad ─────────────────────────────────────────────────────────

const SCRATCH_DEFAULT: EditorState = { text: "" };

type Transform =
  | "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab"
  | "trim" | "squeeze" | "stripBlank" | "sortAsc" | "sortDesc" | "dedupe"
  | "reverseLines" | "shuffle" | "numberLines" | "stripHtml" | "unwrap";

const TRANSFORMS: Array<{ id: Transform; label: string; group: string }> = [
  { id: "upper", label: "UPPERCASE", group: "Case" },
  { id: "lower", label: "lowercase", group: "Case" },
  { id: "title", label: "Title Case", group: "Case" },
  { id: "sentence", label: "Sentence case", group: "Case" },
  { id: "camel", label: "camelCase", group: "Case" },
  { id: "snake", label: "snake_case", group: "Case" },
  { id: "kebab", label: "kebab-case", group: "Case" },
  { id: "trim", label: "Trim lines", group: "Whitespace" },
  { id: "squeeze", label: "Collapse spaces", group: "Whitespace" },
  { id: "stripBlank", label: "Remove blank lines", group: "Whitespace" },
  { id: "unwrap", label: "Unwrap paragraphs", group: "Whitespace" },
  { id: "sortAsc", label: "Sort A→Z", group: "Lines" },
  { id: "sortDesc", label: "Sort Z→A", group: "Lines" },
  { id: "dedupe", label: "Remove duplicates", group: "Lines" },
  { id: "reverseLines", label: "Reverse order", group: "Lines" },
  { id: "shuffle", label: "Shuffle", group: "Lines" },
  { id: "numberLines", label: "Number lines", group: "Lines" },
  { id: "stripHtml", label: "Strip HTML", group: "Clean" },
];

function applyTransform(text: string, t: Transform): string {
  const lines = text.split("\n");

  switch (t) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    case "sentence":
      return text
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case "camel":
      return text
        .replace(/[-_\s]+(.)?/g, (_m, c: string | undefined) => (c ? c.toUpperCase() : ""))
        .replace(/^(.)/, (c) => c.toLowerCase());
    case "snake":
      return text
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();
    case "kebab":
      return text
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[_\s]+/g, "-")
        .toLowerCase();
    case "trim": return lines.map((l) => l.trim()).join("\n");
    case "squeeze": return text.replace(/[ \t]{2,}/g, " ");
    case "stripBlank": return lines.filter((l) => l.trim()).join("\n");
    case "unwrap":
      // Join wrapped lines within a paragraph, keeping blank-line breaks.
      return text
        .split(/\n\s*\n/)
        .map((p) => p.split("\n").map((l) => l.trim()).join(" "))
        .join("\n\n");
    case "sortAsc": return [...lines].sort((a, b) => a.localeCompare(b)).join("\n");
    case "sortDesc": return [...lines].sort((a, b) => b.localeCompare(a)).join("\n");
    case "dedupe": return [...new Set(lines)].join("\n");
    case "reverseLines": return [...lines].reverse().join("\n");
    case "shuffle": {
      const out = [...lines];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out.join("\n");
    }
    case "numberLines": {
      const width = String(lines.length).length;
      return lines.map((l, i) => `${String(i + 1).padStart(width, " ")}. ${l}`).join("\n");
    }
    case "stripHtml":
      return text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\n{3,}/g, "\n\n");
  }
}

export function TextScratchpadTool({ tool, onRecent, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { state, saveState, clearState, isHydrated } = useJsonToolState(tool.id, SCRATCH_DEFAULT, onRecent);
  const [history, setHistory] = useState<string[]>([]);

  const text = state.text;
  const stats = useMemo(() => computeWordStats(text), [text]);

  const run = (t: Transform) => {
    setHistory((h) => [...h, text].slice(-30));
    saveState({ text: applyTransform(text, t) });
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      saveState({ text: h[h.length - 1] });
      return h.slice(0, -1);
    });
  };

  const groups = useMemo(() => {
    const map = new Map<string, typeof TRANSFORMS>();
    for (const t of TRANSFORMS) map.set(t.group, [...(map.get(t.group) ?? []), t]);
    return [...map.entries()];
  }, []);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            clearState();
            setHistory([]);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <>
              <Button variant="outline" size="sm" onClick={undo} disabled={history.length === 0}>
                Undo
              </Button>
              <CopyButton text={text} />
            </>
          }
        />
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-3" data-testid="text-scratchpad">
          <textarea
            value={text}
            onChange={(e) => saveState({ text: e.target.value })}
            placeholder="Paste or type anything. Use the buttons below to reshape it."
            spellCheck={false}
            className="min-h-[20rem] w-full resize-y rounded-md border border-border bg-card p-4 font-mono text-ui leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />

          <div className="flex flex-wrap gap-x-5 gap-y-1 px-1 text-caption tabular-nums text-muted-foreground">
            <span>{stats.words.toLocaleString()} words</span>
            <span>{stats.characters.toLocaleString()} chars</span>
            <span>{stats.lines} lines</span>
            <span>{stats.uniqueWords.toLocaleString()} unique</span>
            <span>Saved locally</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map(([group, items]) => (
              <Panel key={group} title={group} className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <Button key={t.id} variant="outline" size="sm" onClick={() => run(t.id)}>
                      {t.label}
                    </Button>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </ToolShell>
  );
}

// ── Word Counter ────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} sec`;
  const mins = Math.floor(seconds / 60);
  const rem = Math.round(seconds % 60);
  if (mins < 60) return rem === 0 ? `${mins} min` : `${mins} min ${rem} sec`;
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
}

export function WordCounterTool({ tool, onRecent, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { state, saveState, clearState, isHydrated } = useJsonToolState(tool.id, EDITOR_DEFAULT, onRecent);
  const text = state.text;
  const s = useMemo(() => computeWordStats(text), [text]);

  const BIG: Array<[string, string]> = [
    ["Words", s.words.toLocaleString()],
    ["Characters", s.characters.toLocaleString()],
    ["Sentences", s.sentences.toLocaleString()],
    ["Paragraphs", s.paragraphs.toLocaleString()],
  ];

  /** Length limits people actually write against. */
  const LIMITS: Array<[string, number]> = [
    ["Bluesky post", 300],
    ["X post", 280],
    ["Meta description", 160],
    ["Page title", 60],
    ["SMS", 160],
  ];

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions onClear={clearState} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-4" data-testid="word-counter">
          <textarea
            value={text}
            onChange={(e) => saveState({ text: e.target.value })}
            placeholder="Paste or type your text…"
            className="min-h-[14rem] w-full resize-y rounded-md border border-border bg-card p-4 text-ui-md leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BIG.map(([label, value]) => (
              <Panel key={label} className="text-center">
                <p className="text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
                <p className="mt-1 text-label uppercase text-muted-foreground">{label}</p>
              </Panel>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Panel title="Detail">
              <StatRow label="Characters (no spaces)" value={s.charactersNoSpaces.toLocaleString()} />
              <StatRow label="Lines" value={s.lines.toLocaleString()} />
              <StatRow label="Unique words" value={s.uniqueWords.toLocaleString()} />
              <StatRow label="Avg. word length" value={`${s.averageWordLength.toFixed(1)} chars`} />
              <StatRow label="Longest word" value={s.longestWord || "—"} />
            </Panel>

            <Panel title="Time">
              <StatRow label="Reading" value={formatSeconds(s.readingTimeSeconds)} />
              <StatRow label="Speaking" value={formatSeconds(s.speakingTimeSeconds)} />
              <p className="mt-2 text-caption leading-relaxed text-muted-foreground">
                Based on 238 words per minute reading and 140 speaking.
              </p>
            </Panel>

            <Panel title="Against limits">
              {LIMITS.map(([label, limit]) => {
                const pct = Math.min(100, (s.characters / limit) * 100);
                const over = s.characters > limit;
                return (
                  <div key={label} className="mb-2 last:mb-0">
                    <div className="mb-1 flex items-baseline justify-between text-caption">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn("tabular-nums", over && "text-destructive")}>
                        {s.characters} / {limit}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full transition-[width] duration-200", over ? "bg-destructive" : "bg-brand")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Panel>
          </div>

          {s.topWords.length > 0 && (
            <Panel title="Most frequent words">
              <div className="flex flex-wrap gap-1.5">
                {s.topWords.map(({ word, count }) => (
                  <span
                    key={word}
                    className="rounded-lg bg-background px-2.5 py-1 text-caption"
                  >
                    {word}
                    <span className="ml-1.5 tabular-nums text-muted-foreground">{count}</span>
                  </span>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}
    </ToolShell>
  );
}

// ── Document Converter ──────────────────────────────────────────────────────

export function DocConverterTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [input, setInput] = useState("");
  const [from, setFrom] = useState<DocFormat>("markdown");
  const [to, setTo] = useState<DocFormat>("html");
  const [autoDetect, setAutoDetect] = useState(true);

  const effectiveFrom = autoDetect && input.trim() ? detectDocFormat(input) : from;

  const result = useMemo(() => {
    if (!input.trim()) return { output: "" };
    try {
      return convertDocument(input, effectiveFrom, to);
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, effectiveFrom, to]);

  const target = DOC_FORMATS.find((f) => f.id === to);

  const readFile = async (file: File) => {
    const text = await file.text();
    setInput(text);
    if (autoDetect) setFrom(detectDocFormat(text));
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setInput("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            result.output && (
              <>
                <CopyButton text={result.output} />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    downloadText(result.output, `document.${target?.extension ?? "txt"}`, target?.mime)
                  }
                >
                  Download
                </Button>
              </>
            )
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="doc-converter">
        <Panel>
          <div className="flex flex-col gap-3">
            <ControlGrid className="sm:grid-cols-2">
              <Field label="From" hint={autoDetect ? `Detected: ${effectiveFrom}` : undefined}>
                <Select
                  value={effectiveFrom}
                  onChange={(v) => {
                    setAutoDetect(false);
                    setFrom(v);
                  }}
                  options={DOC_FORMATS.map((f) => ({ value: f.id, label: f.label }))}
                />
              </Field>
              <Field label="To">
                <Select
                  value={to}
                  onChange={setTo}
                  options={DOC_FORMATS.map((f) => ({ value: f.id, label: f.label }))}
                />
              </Field>
            </ControlGrid>
            <Toggle checked={autoDetect} onChange={setAutoDetect} label="Detect the source format automatically" />
            <p className="text-caption leading-relaxed text-muted-foreground">
              Handles headings, emphasis, links, images, lists, quotes, code blocks and rules.
              Tables and footnotes pass through as plain text.
            </p>
          </div>
        </Panel>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel
            title="Input"
            actions={
              <label className="cursor-pointer text-caption text-brand underline-offset-2 hover:underline">
                Open file
                <input
                  type="file"
                  accept=".md,.markdown,.html,.htm,.txt,.tex,.rtf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void readFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
            }
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a document, or open a file…"
              spellCheck={false}
              className="min-h-[22rem] w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-caption leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </Panel>

          <Panel title="Output">
            {result.error ? (
              <ErrorNote>{result.error}</ErrorNote>
            ) : result.output ? (
              <pre className="min-h-[22rem] max-h-[30rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 font-mono text-caption leading-relaxed">
                {result.output}
              </pre>
            ) : (
              <EmptyNote>Converted output appears here.</EmptyNote>
            )}
            {result.output && (
              <p className="mt-2 text-caption text-muted-foreground">
                {formatBytes(new Blob([result.output]).size)}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </ToolShell>
  );
}

// ── Shavian Transliterator ──────────────────────────────────────────────────

export function ShavianTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [input, setInput] = useState("");
  const [namingDots, setNamingDots] = useState(true);
  const [fontSize, setFontSize] = useState(22);
  const [showChart, setShowChart] = useState(false);

  const result = useMemo(() => toShavian(input, { namingDots }), [input, namingDots]);
  const coverage =
    result.meta.total > 0 ? (result.meta.fromDictionary / result.meta.total) * 100 : 0;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setInput("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={result.output && <CopyButton text={result.output} />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="shavian-transliterator">
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="English">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste English text…"
              className="min-h-[14rem] w-full resize-y rounded-md border border-border bg-background p-3 text-ui-md leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </Panel>
          <Panel title="Shavian">
            <div
              className="min-h-[14rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
            >
              {result.output || <span className="opacity-40">𐑖𐑱𐑝𐑾𐑯 𐑑𐑧𐑒𐑕𐑑 𐑩𐑐𐑽𐑟 𐑣𐑽</span>}
            </div>
          </Panel>
        </div>

        <Panel title="Options">
          <div className="flex flex-col gap-3">
            <ControlGrid>
              <Field label="Display size">
                <Range value={fontSize} onChange={setFontSize} min={14} max={48} format={(v) => `${v}px`} />
              </Field>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <Toggle checked={namingDots} onChange={setNamingDots} label="Naming dots on proper nouns" />
                <Toggle checked={showChart} onChange={setShowChart} label="Show the alphabet chart" />
              </div>
            </ControlGrid>

            {result.meta.total > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatRow label="Words" value={result.meta.total} />
                <StatRow label="From dictionary" value={`${coverage.toFixed(0)}%`} />
                <StatRow label="Approximated" value={result.meta.approximated} />
              </div>
            )}

            <p className="rounded-md bg-muted p-2.5 text-caption leading-relaxed text-muted-foreground">
              Shavian is phonemic, so a faithful transliteration needs pronunciation data. Common
              words come from a checked dictionary; the rest use spelling rules and may be wrong —
              particularly for names and loan words.
            </p>

            {result.meta.unknownWords.length > 0 && (
              <div>
                <p className="mb-1.5 text-label uppercase text-muted-foreground">
                  Approximated words
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.meta.unknownWords.map((w) => (
                    <span key={w} className="rounded-md bg-background px-1.5 py-0.5 text-caption">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>

        {showChart && (
          <Panel title="Shavian alphabet">
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))" }}
            >
              {SHAVIAN_ALPHABET.map((l) => (
                <button
                  key={l.letter}
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(l.letter)}
                  title={`Copy ${l.letter}`}
                  className="rounded-lg border border-border bg-background p-2 text-center transition-colors hover:bg-[hsl(var(--hover-fill))]"
                >
                  <p className="text-xl leading-tight">{l.letter}</p>
                  <p className="text-caption font-medium">{l.name}</p>
                  <p className="text-kbd text-muted-foreground">{l.sound}</p>
                </button>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </ToolShell>
  );
}

// ── Font File Explorer ──────────────────────────────────────────────────────

interface FontInfo {
  familyName: string;
  styleName: string;
  version: string;
  designer: string;
  manufacturer: string;
  copyright: string;
  license: string;
  numGlyphs: number;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  format: string;
  features: string[];
  variableAxes: Array<{ tag: string; name: string; min: number; default: number; max: number }>;
  supportedRanges: Array<{ name: string; count: number }>;
}

const RANGE_CHECKS: Array<{ name: string; start: number; end: number }> = [
  { name: "Basic Latin", start: 0x0020, end: 0x007e },
  { name: "Latin-1", start: 0x00a0, end: 0x00ff },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017f },
  { name: "Greek", start: 0x0370, end: 0x03ff },
  { name: "Cyrillic", start: 0x0400, end: 0x04ff },
  { name: "Punctuation", start: 0x2000, end: 0x206f },
  { name: "Currency", start: 0x20a0, end: 0x20bf },
  { name: "Arrows", start: 0x2190, end: 0x21ff },
  { name: "Maths", start: 0x2200, end: 0x22ff },
];

export function FontExplorerTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [info, setInfo] = useState<FontInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [sample, setSample] = useState("The quick brown fox jumps over the lazy dog");
  const [previewSize, setPreviewSize] = useState(40);

  useEffect(
    () => () => {
      if (fontUrl) URL.revokeObjectURL(fontUrl);
    },
    [fontUrl]
  );

  const load = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      // opentype.js is large; load it only when a font is actually opened.
      const opentype = await import("opentype.js");
      const buffer = await file.arrayBuffer();
      const font = opentype.parse(buffer);

      const name = (key: string): string => {
        const table = (font.names as unknown as Record<string, Record<string, string> | undefined>)[key];
        if (!table) return "";
        return table.en ?? Object.values(table)[0] ?? "";
      };

      // Register the font so the preview can actually render with it.
      const family = `preview-${Date.now()}`;
      const blob = new Blob([buffer], { type: "font/opentype" });
      const url = URL.createObjectURL(blob);
      const face = new FontFace(family, `url(${url})`);
      await face.load();
      document.fonts.add(face);

      const gsub = (font.tables as Record<string, unknown>).gsub as
        | { features?: Array<{ tag: string }> }
        | undefined;
      const features = [...new Set((gsub?.features ?? []).map((f) => f.tag))].sort();

      const fvar = (font.tables as Record<string, unknown>).fvar as
        | { axes?: Array<{ tag: string; name?: Record<string, string>; minValue: number; defaultValue: number; maxValue: number }> }
        | undefined;
      const variableAxes = (fvar?.axes ?? []).map((a) => ({
        tag: a.tag,
        name: a.name?.en ?? a.tag,
        min: a.minValue,
        default: a.defaultValue,
        max: a.maxValue,
      }));

      const supportedRanges = RANGE_CHECKS.map((r) => {
        let count = 0;
        for (let cp = r.start; cp <= r.end; cp++) {
          const glyph = font.charToGlyphIndex(String.fromCodePoint(cp));
          if (glyph > 0) count++;
        }
        return { name: r.name, count };
      }).filter((r) => r.count > 0);

      setFontUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setFontFamily(family);
      setInfo({
        familyName: name("fontFamily") || file.name,
        styleName: name("fontSubfamily"),
        version: name("version"),
        designer: name("designer"),
        manufacturer: name("manufacturer"),
        copyright: name("copyright"),
        license: name("license"),
        numGlyphs: font.numGlyphs,
        unitsPerEm: font.unitsPerEm,
        ascender: font.ascender,
        descender: font.descender,
        format: font.outlinesFormat ?? "unknown",
        features,
        variableAxes,
        supportedRanges,
      });
    } catch (e) {
      setError(
        (e as Error).message ||
          "Could not parse that font. TTF, OTF and WOFF are supported; WOFF2 is not."
      );
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setInfo(null);
            setError(null);
            setFontFamily(null);
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="font-explorer">
        {error && <ErrorNote>{error}</ErrorNote>}

        {!info ? (
          <Dropzone
            onFiles={(f) => {
              const file = [...f][0];
              if (file) void load(file);
            }}
            accept=".ttf,.otf,.woff,font/*"
            icon="Type"
            label={busy ? "Parsing…" : "Drop a font file"}
            hint="TTF, OTF and WOFF — WOFF2 is not supported in the browser"
          />
        ) : (
          <>
            <Panel title="Preview">
              <TextInput value={sample} onChange={setSample} className="mb-3" />
              <div className="mb-3">
                <Range value={previewSize} onChange={setPreviewSize} min={12} max={140} format={(v) => `${v}px`} />
              </div>
              <p
                className="break-words rounded-md bg-background p-4 leading-tight"
                style={{ fontFamily: fontFamily ?? undefined, fontSize: `${previewSize}px` }}
              >
                {sample || "The quick brown fox"}
              </p>
              <p
                className="mt-2 rounded-md bg-background p-4 text-ui-lg leading-relaxed"
                style={{ fontFamily: fontFamily ?? undefined }}
              >
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz
                <br />
                0123456789 !?@#$%&amp;*()[]&#123;&#125; “”‘’—–…
              </p>
            </Panel>

            <div className="grid gap-3 lg:grid-cols-2">
              <Panel title="Identity">
                <StatRow label="Family" value={info.familyName} />
                <StatRow label="Style" value={info.styleName || "—"} />
                <StatRow label="Version" value={info.version || "—"} />
                <StatRow label="Designer" value={info.designer || "—"} />
                <StatRow label="Foundry" value={info.manufacturer || "—"} />
              </Panel>

              <Panel title="Metrics">
                <StatRow label="Glyphs" value={info.numGlyphs.toLocaleString()} />
                <StatRow label="Units per em" value={info.unitsPerEm} />
                <StatRow label="Ascender" value={info.ascender} />
                <StatRow label="Descender" value={info.descender} />
                <StatRow label="Outline format" value={info.format} />
              </Panel>

              {info.variableAxes.length > 0 && (
                <Panel title="Variable axes">
                  {info.variableAxes.map((a) => (
                    <StatRow
                      key={a.tag}
                      label={`${a.name} (${a.tag})`}
                      value={`${a.min} → ${a.max}, default ${a.default}`}
                    />
                  ))}
                </Panel>
              )}

              {info.features.length > 0 && (
                <Panel title={`OpenType features · ${info.features.length}`}>
                  <div className="flex flex-wrap gap-1">
                    {info.features.map((f) => (
                      <span key={f} className="rounded-md bg-background px-1.5 py-0.5 font-mono text-caption">
                        {f}
                      </span>
                    ))}
                  </div>
                </Panel>
              )}

              <Panel title="Character coverage">
                {info.supportedRanges.map((r) => (
                  <StatRow key={r.name} label={r.name} value={`${r.count} glyphs`} />
                ))}
              </Panel>

              {(info.copyright || info.license) && (
                <Panel title="Licence">
                  <p className="whitespace-pre-wrap text-caption leading-relaxed text-muted-foreground">
                    {info.copyright}
                    {info.copyright && info.license ? "\n\n" : ""}
                    {info.license}
                  </p>
                </Panel>
              )}
            </div>
          </>
        )}
      </div>
    </ToolShell>
  );
}
