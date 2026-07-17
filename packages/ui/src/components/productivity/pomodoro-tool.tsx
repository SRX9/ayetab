"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { CustomToolProps, formatClock, LoadingState, ToolActions } from "./shared";

type PomodoroPhase = "work" | "break" | "longBreak";

interface PomodoroState {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  sessionsCompleted: number;
}

const DEFAULT_STATE: PomodoroState = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  sessionsCompleted: 0,
};

function phaseDuration(state: PomodoroState, phase: PomodoroPhase): number {
  if (phase === "work") return state.workMinutes * 60;
  if (phase === "longBreak") return state.longBreakMinutes * 60;
  return state.breakMinutes * 60;
}

function nextPhase(state: PomodoroState, current: PomodoroPhase): PomodoroPhase {
  if (current !== "work") return "work";
  const nextSessions = state.sessionsCompleted + 1;
  if (nextSessions % state.sessionsBeforeLongBreak === 0) return "longBreak";
  return "break";
}

export function PomodoroTool({
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
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_STATE.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const stateRef = useRef(state);
  const phaseRef = useRef(phase);
  const secondsLeftRef = useRef(secondsLeft);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    if (!isHydrated || running) return;
    const next = phaseDuration(state, phase);
    secondsLeftRef.current = next;
    setSecondsLeft(next);
  }, [isHydrated, state.workMinutes, state.breakMinutes, state.longBreakMinutes, phase, running, state]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const prev = secondsLeftRef.current;
      if (prev > 1) {
        const next = prev - 1;
        secondsLeftRef.current = next;
        setSecondsLeft(next);
        return;
      }

      const currentState = stateRef.current;
      const currentPhase = phaseRef.current;
      const upcoming = nextPhase(currentState, currentPhase);
      if (currentPhase === "work") {
        saveState({ ...currentState, sessionsCompleted: currentState.sessionsCompleted + 1 });
      }
      const nextSeconds = phaseDuration(currentState, upcoming);
      phaseRef.current = upcoming;
      secondsLeftRef.current = nextSeconds;
      setPhase(upcoming);
      setRunning(false);
      setSecondsLeft(nextSeconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, saveState]);

  const resetTimer = useCallback(
    (nextPhase: PomodoroPhase = "work") => {
      setRunning(false);
      setPhase(nextPhase);
      setSecondsLeft(phaseDuration(state, nextPhase));
    },
    [state]
  );

  const updateSetting = useCallback(
    (patch: Partial<PomodoroState>) => {
      const next = { ...state, ...patch };
      saveState(next);
      if (!running) {
        setSecondsLeft(phaseDuration(next, phase));
      }
    },
    [phase, running, saveState, state]
  );

  const handleClear = useCallback(() => {
    clearState();
    setRunning(false);
    setPhase("work");
    setSecondsLeft(DEFAULT_STATE.workMinutes * 60);
  }, [clearState]);

  const totalSeconds = phaseDuration(state, phase);
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const phaseLabel =
    phase === "work" ? "Focus" : phase === "longBreak" ? "Long Break" : "Break";

  const actions = (
    <ToolActions onClear={handleClear} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col items-center gap-6" data-testid="pomodoro-timer">
          <div className="flex gap-2 text-xs">
            {(["work", "break", "longBreak"] as PomodoroPhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => resetTimer(p)}
                disabled={running}
                className={`rounded-md px-3 py-1.5 capitalize transition-[transform,background-color,color] duration-150 ease-out-strong active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 ${
                  phase === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent"
                }`}
              >
                {p === "longBreak" ? "Long break" : p}
              </button>
            ))}
          </div>

          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="text-brand transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
              />
            </svg>
            <div className="text-center z-10">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{phaseLabel}</p>
              <p className="text-4xl font-mono font-semibold tabular-nums tracking-tight">{formatClock(secondsLeft)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary/90 motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={() => resetTimer(phase)}
              className="rounded-md border border-border px-6 py-2 text-sm transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              Reset
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {state.sessionsCompleted} session{state.sessionsCompleted !== 1 ? "s" : ""} completed
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Work (min)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={state.workMinutes}
                onChange={(e) => updateSetting({ workMinutes: Number(e.target.value) || 25 })}
                className="rounded-md border border-border bg-background px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Break (min)</span>
              <input
                type="number"
                min={1}
                max={30}
                value={state.breakMinutes}
                onChange={(e) => updateSetting({ breakMinutes: Number(e.target.value) || 5 })}
                className="rounded-md border border-border bg-background px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Long break (min)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={state.longBreakMinutes}
                onChange={(e) => updateSetting({ longBreakMinutes: Number(e.target.value) || 15 })}
                className="rounded-md border border-border bg-background px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Sessions / long</span>
              <input
                type="number"
                min={2}
                max={10}
                value={state.sessionsBeforeLongBreak}
                onChange={(e) =>
                  updateSetting({ sessionsBeforeLongBreak: Number(e.target.value) || 4 })
                }
                className="rounded-md border border-border bg-background px-2 py-1"
              />
            </label>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
