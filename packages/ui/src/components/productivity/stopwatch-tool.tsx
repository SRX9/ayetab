"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { CustomToolProps, formatDuration, LoadingState, ToolActions } from "./shared";

interface Lap {
  id: string;
  elapsedMs: number;
  lapMs: number;
  at: number;
}

interface StopwatchState {
  laps: Lap[];
}

const DEFAULT_STATE: StopwatchState = { laps: [] };

export function StopwatchTool({
  tool,
  onRecent,
  isFavorite,
  onToggleFavorite,
}: CustomToolProps) {
  const { state, saveState, clearState, isHydrated } = useJsonToolState(
    tool.id,
    DEFAULT_STATE,
    onRecent
  );
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now() - elapsedMs;
    const loop = () => {
      setElapsedMs(Date.now() - startedAt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // elapsedMs intentionally omitted — only re-start loop when running toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleStartStop = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const handleLap = useCallback(() => {
    const lastLapTotal = state.laps[0]?.elapsedMs ?? 0;
    const lap: Lap = {
      id: crypto.randomUUID(),
      elapsedMs,
      lapMs: elapsedMs - lastLapTotal,
      at: Date.now(),
    };
    saveState({ laps: [lap, ...state.laps] });
  }, [elapsedMs, saveState, state.laps]);

  const handleReset = useCallback(() => {
    setRunning(false);
    setElapsedMs(0);
  }, []);

  const handleClear = useCallback(() => {
    handleReset();
    clearState();
  }, [clearState, handleReset]);

  const actions = (
    <ToolActions onClear={handleClear} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-6" data-testid="stopwatch">
          <p className="text-center text-5xl font-mono font-semibold tabular-nums tracking-tight">
            {formatDuration(elapsedMs)}
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleStartStop}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary/90 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {running ? "Stop" : "Start"}
            </button>
            <button
              type="button"
              onClick={handleLap}
              disabled={!running && elapsedMs === 0}
              className="rounded-md border border-border px-6 py-2 text-sm transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Lap
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-border px-6 py-2 text-sm transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Reset
            </button>
          </div>

          {state.laps.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Lap</th>
                    <th className="px-3 py-2 font-medium">Split</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {state.laps.map((lap, index) => (
                    <tr key={lap.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-muted-foreground">{state.laps.length - index}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatDuration(lap.lapMs)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{formatDuration(lap.elapsedMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}
