"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TEMPERATURE_UNITS,
  UNIT_DIMENSIONS,
  convertTemperature,
  convertUnit,
  formatUnitValue,
  type TemperatureUnit,
} from "@ayetab/utils";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { cn } from "../../lib/utils";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import {
  ColorInput,
  ControlGrid,
  CopyButton,
  CustomToolProps,
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
} from "./shared";

/** Load mathjs once and reuse it across the calculators that need it. */
let mathPromise: Promise<typeof import("mathjs")> | null = null;
function loadMath() {
  mathPromise ??= import("mathjs");
  return mathPromise;
}

// ── Scientific Calculator ───────────────────────────────────────────────────

interface CalcState {
  history: Array<{ expression: string; result: string }>;
}

const CALC_DEFAULT: CalcState = { history: [] };

const KEYS: Array<Array<{ label: string; insert?: string; action?: "clear" | "back" | "equals" }>> = [
  [
    { label: "AC", action: "clear" },
    { label: "⌫", action: "back" },
    { label: "(", insert: "(" },
    { label: ")", insert: ")" },
    { label: "÷", insert: "/" },
  ],
  [
    { label: "sin", insert: "sin(" },
    { label: "7", insert: "7" },
    { label: "8", insert: "8" },
    { label: "9", insert: "9" },
    { label: "×", insert: "*" },
  ],
  [
    { label: "cos", insert: "cos(" },
    { label: "4", insert: "4" },
    { label: "5", insert: "5" },
    { label: "6", insert: "6" },
    { label: "−", insert: "-" },
  ],
  [
    { label: "tan", insert: "tan(" },
    { label: "1", insert: "1" },
    { label: "2", insert: "2" },
    { label: "3", insert: "3" },
    { label: "+", insert: "+" },
  ],
  [
    { label: "√", insert: "sqrt(" },
    { label: "0", insert: "0" },
    { label: ".", insert: "." },
    { label: "^", insert: "^" },
    { label: "=", action: "equals" },
  ],
];

const FUNCTION_KEYS = [
  { label: "π", insert: "pi" },
  { label: "e", insert: "e" },
  { label: "ln", insert: "log(" },
  { label: "log₁₀", insert: "log10(" },
  { label: "x!", insert: "!" },
  { label: "%", insert: "%" },
  { label: "abs", insert: "abs(" },
  { label: "exp", insert: "exp(" },
  { label: "asin", insert: "asin(" },
  { label: "acos", insert: "acos(" },
  { label: "atan", insert: "atan(" },
  { label: "round", insert: "round(" },
];

export function SciCalcTool({ tool, onRecent, isFavorite, onToggleFavorite }: CustomToolProps) {
  const { state, saveState, clearState, isHydrated } = useJsonToolState(tool.id, CALC_DEFAULT, onRecent);
  const [expression, setExpression] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [degrees, setDegrees] = useState(false);

  /** Wrap trig arguments so the degree toggle works without a custom scope. */
  const prepare = useCallback(
    (expr: string) => {
      if (!degrees) return expr;
      return expr.replace(/\b(sin|cos|tan)\(/g, "$1(pi/180*");
    },
    [degrees]
  );

  useEffect(() => {
    if (!expression.trim()) {
      setPreview("");
      setError(null);
      return;
    }
    let cancelled = false;

    void loadMath().then((math) => {
      if (cancelled) return;
      try {
        const value = math.evaluate(prepare(expression));
        setPreview(typeof value === "number" ? math.format(value, { precision: 12 }) : String(value));
        setError(null);
      } catch {
        setPreview("");
        setError(null); // Only surface errors once the user commits.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [expression, prepare]);

  const evaluate = useCallback(async () => {
    if (!expression.trim()) return;
    try {
      const math = await loadMath();
      const value = math.evaluate(prepare(expression));
      const formatted = typeof value === "number" ? math.format(value, { precision: 12 }) : String(value);
      saveState({ history: [{ expression, result: formatted }, ...state.history].slice(0, 40) });
      setExpression(formatted);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [expression, prepare, saveState, state.history]);

  const press = (key: { insert?: string; action?: "clear" | "back" | "equals" }) => {
    if (key.action === "clear") {
      setExpression("");
      setError(null);
      return;
    }
    if (key.action === "back") {
      setExpression((e) => e.slice(0, -1));
      return;
    }
    if (key.action === "equals") {
      void evaluate();
      return;
    }
    if (key.insert) setExpression((e) => e + key.insert);
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setExpression("");
            clearState();
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={preview && <CopyButton text={preview} label="Copy result" />}
        />
      }
    >
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]" data-testid="sci-calc">
          <div className="flex flex-col gap-3">
            <Panel className="p-4">
              <input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void evaluate();
                  }
                }}
                placeholder="0"
                spellCheck={false}
                autoFocus
                className="w-full bg-transparent text-right font-mono text-3xl tabular-nums focus-visible:outline-none"
              />
              <p className="mt-1 h-6 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {error ? <span className="text-destructive">{error}</span> : preview && `= ${preview}`}
              </p>
            </Panel>

            <div className="flex items-center justify-between gap-3">
              <Segmented
                value={degrees ? "deg" : "rad"}
                onChange={(v) => setDegrees(v === "deg")}
                options={[
                  { value: "rad", label: "RAD" },
                  { value: "deg", label: "DEG" },
                ]}
              />
              <p className="text-caption text-muted-foreground">Type directly or use the keypad</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {FUNCTION_KEYS.map((k) => (
                <Button key={k.label} variant="outline" size="sm" onClick={() => press(k)}>
                  {k.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {KEYS.flat().map((k, i) => (
                <Button
                  key={`${k.label}-${i}`}
                  variant={k.action === "equals" ? "primary" : k.action ? "secondary" : "outline"}
                  size="md"
                  onClick={() => press(k)}
                  className="h-11 text-ui-lg"
                >
                  {k.label}
                </Button>
              ))}
            </div>
          </div>

          <Panel
            title="History"
            actions={
              state.history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearState}>
                  Clear
                </Button>
              )
            }
          >
            {state.history.length === 0 ? (
              <EmptyNote>Results land here.</EmptyNote>
            ) : (
              <div className="flex max-h-[26rem] flex-col gap-1 overflow-y-auto">
                {state.history.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExpression(h.expression)}
                    className="rounded-lg bg-background px-2.5 py-1.5 text-right transition-colors hover:bg-[hsl(var(--hover-fill))]"
                  >
                    <p className="truncate font-mono text-caption text-muted-foreground">{h.expression}</p>
                    <p className="truncate font-mono text-ui font-medium tabular-nums">{h.result}</p>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </ToolShell>
  );
}

// ── Algebra Calculator ──────────────────────────────────────────────────────

type AlgebraOp = "simplify" | "expand" | "derivative" | "solve" | "evaluate" | "rationalize";

const ALGEBRA_EXAMPLES: Record<AlgebraOp, string> = {
  simplify: "2x + 3x - x + 4",
  expand: "(x + 2)(x - 3)",
  derivative: "x^3 + 2x^2 - 5x",
  solve: "2x + 6",
  evaluate: "x^2 + y^2",
  rationalize: "(x^2 + 2x + 1) / (x + 1)",
};

export function AlgebraCalcTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [op, setOp] = useState<AlgebraOp>("simplify");
  const [input, setInput] = useState(ALGEBRA_EXAMPLES.simplify);
  const [variable, setVariable] = useState("x");
  const [scope, setScope] = useState("x = 2, y = 3");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setResult("");
      setError(null);
      return;
    }
    let cancelled = false;

    void loadMath().then((math) => {
      if (cancelled) return;
      try {
        let out: string;
        switch (op) {
          case "simplify":
            out = math.simplify(input).toString();
            break;
          case "expand":
            // mathjs has no expand(); simplify with distribution rules gets there.
            out = math.simplify(input, [], {}, { exactFractions: false }).toString();
            break;
          case "derivative":
            out = math.derivative(input, variable || "x").toString();
            break;
          case "rationalize":
            out = math.rationalize(input).toString();
            break;
          case "solve": {
            // mathjs has no symbolic solver; handle linear and quadratic forms.
            out = solvePolynomial(math, input, variable || "x");
            break;
          }
          case "evaluate": {
            const parsed: Record<string, number> = {};
            for (const pair of scope.split(",")) {
              const [k, v] = pair.split("=").map((s) => s.trim());
              if (k && v) parsed[k] = Number(math.evaluate(v));
            }
            out = String(math.evaluate(input, parsed));
            break;
          }
        }
        setResult(out);
        setError(null);
      } catch (e) {
        setResult("");
        setError((e as Error).message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [op, input, variable, scope]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setInput("")}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={result && <CopyButton text={result} />}
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="algebra-calc">
        <Panel>
          <div className="flex flex-col gap-3">
            <Segmented
              value={op}
              onChange={(v) => {
                setOp(v);
                setInput(ALGEBRA_EXAMPLES[v]);
              }}
              options={[
                { value: "simplify", label: "Simplify" },
                { value: "expand", label: "Expand" },
                { value: "derivative", label: "Derivative" },
                { value: "solve", label: "Solve = 0" },
                { value: "rationalize", label: "Rationalise" },
                { value: "evaluate", label: "Evaluate" },
              ]}
            />

            <Field label="Expression">
              <TextInput
                value={input}
                onChange={setInput}
                placeholder={ALGEBRA_EXAMPLES[op]}
                className="font-mono"
              />
            </Field>

            {(op === "derivative" || op === "solve") && (
              <Field label="With respect to">
                <TextInput value={variable} onChange={setVariable} className="font-mono" />
              </Field>
            )}
            {op === "evaluate" && (
              <Field label="Variable values" hint="Comma separated, e.g. x = 2, y = 3">
                <TextInput value={scope} onChange={setScope} className="font-mono" />
              </Field>
            )}
          </div>
        </Panel>

        <Panel title="Result">
          {error ? (
            <ErrorNote>{error}</ErrorNote>
          ) : result ? (
            <p className="break-all rounded-md bg-background p-4 font-mono text-lg">{result}</p>
          ) : (
            <EmptyNote>Enter an expression above.</EmptyNote>
          )}
        </Panel>

        <Panel title="Syntax">
          <div className="grid gap-x-6 gap-y-1 text-caption sm:grid-cols-2">
            <StatRow label="Multiplication" value="2*x or 2x" />
            <StatRow label="Power" value="x^2" />
            <StatRow label="Roots" value="sqrt(x), nthRoot(x, 3)" />
            <StatRow label="Fractions" value="(x + 1) / 2" />
            <StatRow label="Functions" value="sin, cos, log, exp, abs" />
            <StatRow label="Constants" value="pi, e" />
          </div>
          <p className="mt-3 text-caption leading-relaxed text-muted-foreground">
            Solving handles linear and quadratic expressions set equal to zero. Higher-degree
            polynomials are reported as unsupported rather than approximated.
          </p>
        </Panel>
      </div>
    </ToolShell>
  );
}

/**
 * Solve `expr = 0` for linear and quadratic cases by sampling the simplified
 * polynomial: evaluating at 0, 1 and -1 recovers the coefficients exactly.
 */
function solvePolynomial(math: typeof import("mathjs"), expr: string, variable: string): string {
  const at = (v: number) => Number(math.evaluate(expr, { [variable]: v }));

  const f0 = at(0);
  const f1 = at(1);
  const fm1 = at(-1);

  // For ax² + bx + c: c = f(0), a = (f(1) + f(-1) - 2c)/2, b = (f(1) - f(-1))/2
  const c = f0;
  const a = (f1 + fm1 - 2 * c) / 2;
  const b = (f1 - fm1) / 2;

  // Confirm the sampled quadratic actually matches the expression.
  const check = (v: number) => Math.abs(a * v * v + b * v + c - at(v)) < 1e-9;
  if (!check(2) || !check(-3)) {
    return "Only linear and quadratic expressions are supported.";
  }

  const round = (n: number) => Number(n.toFixed(10));

  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) {
      return Math.abs(c) < 1e-12 ? "Every value of " + variable + " is a solution." : "No solution.";
    }
    return `${variable} = ${round(-c / b)}`;
  }

  const disc = b * b - 4 * a * c;
  if (disc < 0) {
    const re = round(-b / (2 * a));
    const im = round(Math.sqrt(-disc) / (2 * a));
    return `${variable} = ${re} + ${Math.abs(im)}i,  ${variable} = ${re} − ${Math.abs(im)}i`;
  }
  if (Math.abs(disc) < 1e-12) return `${variable} = ${round(-b / (2 * a))} (double root)`;

  const root = Math.sqrt(disc);
  return `${variable} = ${round((-b + root) / (2 * a))},  ${variable} = ${round((-b - root) / (2 * a))}`;
}

// ── Graph Calculator ────────────────────────────────────────────────────────

interface Curve {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

const CURVE_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#ef4444"];

export function GraphCalcTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [curves, setCurves] = useState<Curve[]>([
    { id: "1", expression: "sin(x)", color: CURVE_COLORS[0], visible: true },
  ]);
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [showGrid, setShowGrid] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const plot = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const math = await loadMath();

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 800;
    const cssH = 420;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const spanX = xMax - xMin || 1;
    const spanY = yMax - yMin || 1;
    const toPx = (x: number) => ((x - xMin) / spanX) * cssW;
    const toPy = (y: number) => cssH - ((y - yMin) / spanY) * cssH;

    // Grid: pick a step that lands on 1, 2 or 5 times a power of ten.
    const niceStep = (span: number) => {
      const raw = span / 10;
      const power = Math.pow(10, Math.floor(Math.log10(raw)));
      const norm = raw / power;
      return (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * power;
    };

    if (showGrid) {
      const stepX = niceStep(spanX);
      const stepY = niceStep(spanY);
      ctx.strokeStyle = "rgba(128,128,128,.18)";
      ctx.lineWidth = 1;
      ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "rgba(128,128,128,.75)";

      for (let x = Math.ceil(xMin / stepX) * stepX; x <= xMax; x += stepX) {
        const px = toPx(x);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, cssH);
        ctx.stroke();
        if (Math.abs(x) > 1e-9) ctx.fillText(String(Number(x.toFixed(4))), px + 3, toPy(0) - 4);
      }
      for (let y = Math.ceil(yMin / stepY) * stepY; y <= yMax; y += stepY) {
        const py = toPy(y);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(cssW, py);
        ctx.stroke();
        if (Math.abs(y) > 1e-9) ctx.fillText(String(Number(y.toFixed(4))), toPx(0) + 4, py - 3);
      }
    }

    // Axes
    ctx.strokeStyle = "rgba(128,128,128,.65)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toPy(0));
    ctx.lineTo(cssW, toPy(0));
    ctx.moveTo(toPx(0), 0);
    ctx.lineTo(toPx(0), cssH);
    ctx.stroke();

    const nextErrors: Record<string, string> = {};

    for (const curve of curves) {
      if (!curve.visible || !curve.expression.trim()) continue;
      let compiled: { evaluate: (s: Record<string, number>) => unknown };
      try {
        compiled = math.compile(curve.expression);
      } catch (e) {
        nextErrors[curve.id] = (e as Error).message;
        continue;
      }

      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let penDown = false;
      const samples = Math.max(200, Math.round(cssW));
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (spanX * i) / samples;
        let y: number;
        try {
          const value = compiled.evaluate({ x });
          y = typeof value === "number" ? value : NaN;
        } catch {
          y = NaN;
        }

        // Lift the pen across discontinuities and out-of-range excursions.
        if (!Number.isFinite(y) || y < yMin - spanY * 3 || y > yMax + spanY * 3) {
          penDown = false;
          continue;
        }
        const px = toPx(x);
        const py = toPy(y);
        if (penDown) ctx.lineTo(px, py);
        else {
          ctx.moveTo(px, py);
          penDown = true;
        }
      }
      ctx.stroke();
    }

    setErrors(nextErrors);
  }, [curves, xMin, xMax, yMin, yMax, showGrid]);

  useEffect(() => {
    void plot();
  }, [plot]);

  const update = (id: string, patch: Partial<Curve>) =>
    setCurves((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const zoom = (factor: number) => {
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const hx = ((xMax - xMin) / 2) * factor;
    const hy = ((yMax - yMin) / 2) * factor;
    setXMin(Number((cx - hx).toFixed(4)));
    setXMax(Number((cx + hx).toFixed(4)));
    setYMin(Number((cy - hy).toFixed(4)));
    setYMax(Number((cy + hy).toFixed(4)));
  };

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setCurves([{ id: "1", expression: "sin(x)", color: CURVE_COLORS[0], visible: true }])}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <>
              <Button variant="outline" size="sm" onClick={() => zoom(0.7)}>
                Zoom in
              </Button>
              <Button variant="outline" size="sm" onClick={() => zoom(1.4)}>
                Zoom out
              </Button>
            </>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="graph-calc">
        <Panel className="p-2">
          <canvas ref={canvasRef} className="w-full rounded-md" style={{ height: 420 }} />
        </Panel>

        <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
          <Panel title="Functions">
            <div className="flex flex-col gap-2">
              {curves.map((curve) => (
                <div key={curve.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => update(curve.id, { visible: !curve.visible })}
                      aria-label={curve.visible ? "Hide curve" : "Show curve"}
                      className={cn(
                        "h-6 w-6 shrink-0 rounded-md border-2 transition-opacity",
                        !curve.visible && "opacity-30"
                      )}
                      style={{ backgroundColor: curve.color, borderColor: curve.color }}
                    />
                    <span className="shrink-0 font-mono text-ui text-muted-foreground">y =</span>
                    <TextInput
                      value={curve.expression}
                      onChange={(v) => update(curve.id, { expression: v })}
                      placeholder="sin(x)"
                      className="font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurves((prev) => prev.filter((c) => c.id !== curve.id))}
                      disabled={curves.length === 1}
                    >
                      ✕
                    </Button>
                  </div>
                  {errors[curve.id] && (
                    <p className="pl-8 text-caption text-destructive">{errors[curve.id]}</p>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                disabled={curves.length >= 6}
                onClick={() =>
                  setCurves((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      expression: "",
                      color: CURVE_COLORS[prev.length % CURVE_COLORS.length],
                      visible: true,
                    },
                  ])
                }
              >
                Add function
              </Button>
            </div>
          </Panel>

          <Panel title="Window">
            <div className="grid grid-cols-2 gap-2">
              <Field label="x min">
                <NumberInput value={xMin} onChange={setXMin} step={1} />
              </Field>
              <Field label="x max">
                <NumberInput value={xMax} onChange={setXMax} step={1} />
              </Field>
              <Field label="y min">
                <NumberInput value={yMin} onChange={setYMin} step={1} />
              </Field>
              <Field label="y max">
                <NumberInput value={yMax} onChange={setYMax} step={1} />
              </Field>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Toggle checked={showGrid} onChange={setShowGrid} label="Show grid" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setXMin(-10);
                  setXMax(10);
                  setYMin(-5);
                  setYMax(5);
                }}
              >
                Reset window
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </ToolShell>
  );
}

// ── Unit Converter ──────────────────────────────────────────────────────────

export function UnitConverterTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [dimensionId, setDimensionId] = useState("length");
  const [value, setValue] = useState(1);
  const [fromId, setFromId] = useState("m");
  const [toId, setToId] = useState("ft");

  const isTemperature = dimensionId === "temperature";
  const dimension = UNIT_DIMENSIONS.find((d) => d.id === dimensionId);

  // Keep the selected units valid whenever the dimension changes.
  useEffect(() => {
    if (isTemperature) {
      setFromId("c");
      setToId("f");
      return;
    }
    const d = UNIT_DIMENSIONS.find((x) => x.id === dimensionId);
    if (!d) return;
    if (!d.units.some((u) => u.id === fromId)) setFromId(d.units[0].id);
    if (!d.units.some((u) => u.id === toId)) setToId(d.units[Math.min(1, d.units.length - 1)].id);
    // fromId/toId intentionally omitted — this only realigns on dimension change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensionId, isTemperature]);

  const n = Number.isFinite(value) ? value : 0;

  const result = useMemo(() => {
    if (isTemperature) return convertTemperature(n, fromId as TemperatureUnit, toId as TemperatureUnit);
    const from = dimension?.units.find((u) => u.id === fromId);
    const to = dimension?.units.find((u) => u.id === toId);
    if (!from || !to) return 0;
    return convertUnit(n, from, to);
  }, [n, isTemperature, dimension, fromId, toId]);

  const allConversions = useMemo(() => {
    if (isTemperature) {
      return TEMPERATURE_UNITS.map((u) => ({
        id: u.id,
        label: u.label,
        symbol: u.symbol,
        value: convertTemperature(n, fromId as TemperatureUnit, u.id),
      }));
    }
    const from = dimension?.units.find((u) => u.id === fromId);
    if (!from || !dimension) return [];
    return dimension.units.map((u) => ({
      id: u.id,
      label: u.label,
      symbol: u.symbol,
      value: convertUnit(n, from, u),
    }));
  }, [n, isTemperature, dimension, fromId]);

  const unitOptions = isTemperature
    ? TEMPERATURE_UNITS.map((u) => ({ value: u.id as string, label: `${u.label} (${u.symbol})` }))
    : (dimension?.units ?? []).map((u) => ({ value: u.id, label: `${u.label} (${u.symbol})` }));

  const fromSymbol = isTemperature
    ? TEMPERATURE_UNITS.find((u) => u.id === fromId)?.symbol
    : dimension?.units.find((u) => u.id === fromId)?.symbol;
  const toSymbol = isTemperature
    ? TEMPERATURE_UNITS.find((u) => u.id === toId)?.symbol
    : dimension?.units.find((u) => u.id === toId)?.symbol;

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => setValue(1)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromId(toId);
                  setToId(fromId);
                }}
              >
                Swap
              </Button>
              <CopyButton text={`${formatUnitValue(result)} ${toSymbol ?? ""}`} label="Copy" />
            </>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="unit-converter">
        <div className="flex flex-wrap gap-1.5">
          {[...UNIT_DIMENSIONS.map((d) => ({ id: d.id, label: d.label })), { id: "temperature", label: "Temperature" }].map(
            (d) => (
              <Button
                key={d.id}
                variant="outline"
                size="sm"
                onClick={() => setDimensionId(d.id)}
                className={cn(d.id === dimensionId && "border-brand text-brand")}
              >
                {d.label}
              </Button>
            )
          )}
        </div>

        <Panel>
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-3">
              <Field label="Value">
                <NumberInput value={value} onChange={setValue} step={0.001} />
              </Field>
              <Field label="From">
                <Select value={fromId} onChange={setFromId} options={unitOptions} />
              </Field>
            </div>

            <div className="hidden pb-2 text-center text-2xl text-muted-foreground sm:block">=</div>

            <div className="flex flex-col gap-3">
              <Field label="Result">
                <div className="flex h-9 items-center rounded-md border border-border bg-background px-2.5 font-mono text-sm tabular-nums">
                  {formatUnitValue(result)}
                </div>
              </Field>
              <Field label="To">
                <Select value={toId} onChange={setToId} options={unitOptions} />
              </Field>
            </div>
          </div>

          <p className="mt-3 text-center text-ui text-muted-foreground">
            {formatUnitValue(n)} {fromSymbol} = <strong className="text-foreground">{formatUnitValue(result)}</strong>{" "}
            {toSymbol}
          </p>
        </Panel>

        <Panel title="All units">
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {allConversions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setToId(c.id)}
                className={cn(
                  "flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
                  c.id === toId ? "bg-brand/8 ring-1 ring-brand/40" : "bg-background hover:bg-[hsl(var(--hover-fill))]"
                )}
              >
                <span className="min-w-0 truncate text-caption text-muted-foreground">{c.label}</span>
                <span className="shrink-0 font-mono text-caption font-medium tabular-nums">
                  {formatUnitValue(c.value)}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </ToolShell>
  );
}

// ── Time Calculator ─────────────────────────────────────────────────────────

type TimeMode = "difference" | "add" | "duration" | "timestamp" | "timezone";

const TIMEZONES = [
  "UTC", "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Africa/Lagos", "Africa/Johannesburg", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney", "Pacific/Auckland",
];

const localIso = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function TimeCalcTool({ tool, isFavorite, onToggleFavorite }: CustomToolProps) {
  const [mode, setMode] = useState<TimeMode>("difference");
  const [start, setStart] = useState(() => localIso(new Date()));
  const [end, setEnd] = useState(() => localIso(new Date(Date.now() + 86400000 * 7)));
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<"minutes" | "hours" | "days" | "weeks" | "months" | "years">("days");
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [multiplier, setMultiplier] = useState(3);
  const [timestamp, setTimestamp] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [zone, setZone] = useState("UTC");

  const startDate = new Date(start);
  const endDate = new Date(end);
  const valid = !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime());

  const diff = useMemo(() => {
    if (!valid) return null;
    const ms = Math.abs(endDate.getTime() - startDate.getTime());
    const totalSeconds = Math.floor(ms / 1000);

    // Calendar-accurate months and years need stepping, not division.
    const [a, b] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
    let years = b.getFullYear() - a.getFullYear();
    let months = b.getMonth() - a.getMonth();
    let days = b.getDate() - a.getDate();
    if (days < 0) {
      months--;
      days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      ms,
      totalSeconds,
      totalMinutes: ms / 60000,
      totalHours: ms / 3600000,
      totalDays: ms / 86400000,
      totalWeeks: ms / (86400000 * 7),
      years,
      months,
      days,
      businessDays: countBusinessDays(a, b),
      backwards: endDate < startDate,
    };
  }, [startDate, endDate, valid]);

  const added = useMemo(() => {
    if (Number.isNaN(startDate.getTime())) return null;
    const d = new Date(startDate);
    const n = (direction === "add" ? 1 : -1) * (Number.isFinite(amount) ? amount : 0);
    switch (unit) {
      case "minutes": d.setMinutes(d.getMinutes() + n); break;
      case "hours": d.setHours(d.getHours() + n); break;
      case "days": d.setDate(d.getDate() + n); break;
      case "weeks": d.setDate(d.getDate() + n * 7); break;
      case "months": d.setMonth(d.getMonth() + n); break;
      case "years": d.setFullYear(d.getFullYear() + n); break;
    }
    return d;
  }, [startDate, amount, unit, direction]);

  const durationSeconds =
    (Number.isFinite(hours) ? hours : 0) * 3600 +
    (Number.isFinite(minutes) ? minutes : 0) * 60 +
    (Number.isFinite(seconds) ? seconds : 0);
  const scaled = durationSeconds * (Number.isFinite(multiplier) ? multiplier : 1);

  const fmtDuration = (total: number) => {
    const sign = total < 0 ? "-" : "";
    const t = Math.abs(Math.round(total));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${sign}${h}h ${m}m ${s}s`;
  };

  const tsDate = useMemo(() => {
    const raw = timestamp.trim();
    if (!raw) return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    // Heuristic: 13 digits is milliseconds, 10 is seconds.
    return new Date(raw.replace(/\D/g, "").length > 11 ? n : n * 1000);
  }, [timestamp]);

  return (
    <ToolShell
      title={tool.name}
      description={tool.description}
      actions={
        <ToolActions
          onClear={() => {
            setStart(localIso(new Date()));
            setEnd(localIso(new Date(Date.now() + 86400000 * 7)));
          }}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          extra={
            <Button variant="outline" size="sm" onClick={() => setStart(localIso(new Date()))}>
              Now
            </Button>
          }
        />
      }
    >
      <div className="flex flex-col gap-4" data-testid="time-calc">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "difference", label: "Difference" },
            { value: "add", label: "Add / subtract" },
            { value: "duration", label: "Durations" },
            { value: "timestamp", label: "Timestamp" },
            { value: "timezone", label: "Timezones" },
          ]}
        />

        {mode === "difference" && (
          <>
            <Panel>
              <ControlGrid>
                <Field label="From">
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>
                <Field label="To">
                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>
              </ControlGrid>
            </Panel>

            {diff ? (
              <>
                <Panel className="text-center">
                  <p className="text-2xl font-semibold tracking-tight">
                    {diff.years > 0 && `${diff.years} year${diff.years === 1 ? "" : "s"}, `}
                    {diff.months > 0 && `${diff.months} month${diff.months === 1 ? "" : "s"}, `}
                    {diff.days} day{diff.days === 1 ? "" : "s"}
                  </p>
                  {diff.backwards && (
                    <p className="mt-1 text-caption text-muted-foreground">The end date is before the start.</p>
                  )}
                </Panel>
                <Panel title="Total">
                  <div className="grid gap-x-6 sm:grid-cols-2">
                    <StatRow label="Weeks" value={diff.totalWeeks.toFixed(2)} />
                    <StatRow label="Days" value={diff.totalDays.toFixed(2)} />
                    <StatRow label="Business days" value={diff.businessDays.toLocaleString()} />
                    <StatRow label="Hours" value={diff.totalHours.toFixed(2)} />
                    <StatRow label="Minutes" value={Math.round(diff.totalMinutes).toLocaleString()} />
                    <StatRow label="Seconds" value={diff.totalSeconds.toLocaleString()} />
                  </div>
                </Panel>
              </>
            ) : (
              <ErrorNote>Enter two valid dates.</ErrorNote>
            )}
          </>
        )}

        {mode === "add" && (
          <>
            <Panel>
              <div className="flex flex-col gap-3">
                <Field label="Starting from">
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>
                <ControlGrid className="sm:grid-cols-3">
                  <Field label="Direction">
                    <Segmented
                      value={direction}
                      onChange={setDirection}
                      options={[
                        { value: "add", label: "Add" },
                        { value: "subtract", label: "Subtract" },
                      ]}
                    />
                  </Field>
                  <Field label="Amount">
                    <NumberInput value={amount} onChange={setAmount} />
                  </Field>
                  <Field label="Unit">
                    <Select
                      value={unit}
                      onChange={setUnit}
                      options={[
                        { value: "minutes", label: "Minutes" },
                        { value: "hours", label: "Hours" },
                        { value: "days", label: "Days" },
                        { value: "weeks", label: "Weeks" },
                        { value: "months", label: "Months" },
                        { value: "years", label: "Years" },
                      ]}
                    />
                  </Field>
                </ControlGrid>
              </div>
            </Panel>

            {added && !Number.isNaN(added.getTime()) && (
              <Panel title="Result">
                <p className="mb-3 text-center text-xl font-semibold">
                  {added.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
                </p>
                <StatRow label="ISO 8601" value={added.toISOString()} />
                <StatRow label="Unix seconds" value={Math.floor(added.getTime() / 1000)} />
                <StatRow label="Day of week" value={added.toLocaleDateString(undefined, { weekday: "long" })} />
              </Panel>
            )}
          </>
        )}

        {mode === "duration" && (
          <>
            <Panel title="Duration">
              <ControlGrid className="sm:grid-cols-4">
                <Field label="Hours">
                  <NumberInput value={hours} onChange={setHours} min={0} />
                </Field>
                <Field label="Minutes">
                  <NumberInput value={minutes} onChange={setMinutes} min={0} />
                </Field>
                <Field label="Seconds">
                  <NumberInput value={seconds} onChange={setSeconds} min={0} />
                </Field>
                <Field label="Multiply by">
                  <NumberInput value={multiplier} onChange={setMultiplier} step={0.5} />
                </Field>
              </ControlGrid>
            </Panel>
            <Panel title="Result">
              <div className="grid gap-x-6 sm:grid-cols-2">
                <StatRow label="One unit" value={fmtDuration(durationSeconds)} />
                <StatRow label={`× ${multiplier}`} value={fmtDuration(scaled)} />
                <StatRow label="Total seconds" value={Math.round(scaled).toLocaleString()} />
                <StatRow label="Total minutes" value={(scaled / 60).toFixed(2)} />
                <StatRow label="Total hours" value={(scaled / 3600).toFixed(3)} />
                <StatRow label="Total days" value={(scaled / 86400).toFixed(4)} />
              </div>
            </Panel>
          </>
        )}

        {mode === "timestamp" && (
          <>
            <Panel>
              <div className="flex flex-col gap-3">
                <Field label="Unix timestamp" hint="Seconds or milliseconds — both are detected">
                  <TextInput value={timestamp} onChange={setTimestamp} className="font-mono" />
                </Field>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setTimestamp(String(Math.floor(Date.now() / 1000)))}>
                    Now (s)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTimestamp(String(Date.now()))}>
                    Now (ms)
                  </Button>
                </div>
              </div>
            </Panel>
            {tsDate && !Number.isNaN(tsDate.getTime()) ? (
              <Panel title="Resolved">
                <StatRow label="Local" value={tsDate.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })} />
                <StatRow label="UTC" value={tsDate.toUTCString()} />
                <StatRow label="ISO 8601" value={tsDate.toISOString()} />
                <StatRow label="Unix seconds" value={Math.floor(tsDate.getTime() / 1000)} />
                <StatRow label="Unix ms" value={tsDate.getTime()} />
                <StatRow label="Relative" value={relativeTime(tsDate)} />
              </Panel>
            ) : (
              timestamp.trim() && <ErrorNote>That is not a valid timestamp.</ErrorNote>
            )}
          </>
        )}

        {mode === "timezone" && (
          <>
            <Panel>
              <ControlGrid>
                <Field label="Moment">
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>
                <Field label="Highlight zone">
                  <Select
                    value={zone}
                    onChange={setZone}
                    options={TIMEZONES.map((z) => ({ value: z, label: z.replace(/_/g, " ") }))}
                  />
                </Field>
              </ControlGrid>
            </Panel>
            <Panel title="Around the world">
              {Number.isNaN(startDate.getTime()) ? (
                <ErrorNote>Enter a valid date and time.</ErrorNote>
              ) : (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {TIMEZONES.map((tz) => {
                    let formatted: string;
                    try {
                      formatted = startDate.toLocaleString(undefined, {
                        timeZone: tz,
                        dateStyle: "medium",
                        timeStyle: "short",
                      });
                    } catch {
                      formatted = "unsupported";
                    }
                    return (
                      <div
                        key={tz}
                        className={cn(
                          "flex items-baseline justify-between gap-2 rounded-lg px-2.5 py-1.5",
                          tz === zone ? "bg-brand/8 ring-1 ring-brand/40" : "bg-background"
                        )}
                      >
                        <span className="min-w-0 truncate text-caption text-muted-foreground">
                          {tz.replace(/_/g, " ")}
                        </span>
                        <span className="shrink-0 text-caption tabular-nums">{formatted}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </>
        )}
      </div>
    </ToolShell>
  );
}

/** Count Mon–Fri days between two dates, inclusive of the start. */
function countBusinessDays(a: Date, b: Date): number {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function relativeTime(date: Date): string {
  const seconds = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size || unit === "second") {
      return rtf.format(Math.round(seconds / size), unit);
    }
  }
  return "now";
}
