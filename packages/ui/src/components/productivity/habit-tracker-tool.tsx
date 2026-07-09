"use client";

import { useCallback, useMemo } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { CustomToolProps, LoadingState, newId, todayKey, ToolActions } from "./shared";

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

interface HabitState {
  habits: Habit[];
}

const DEFAULT_STATE: HabitState = { habits: [] };

function streakFor(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = todayKey();
  let cursor = today;

  for (const date of sorted) {
    if (date > today) continue;
    if (date === cursor) {
      streak += 1;
      const d = new Date(cursor + "T12:00:00");
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    } else if (streak === 0 && date === prevDay(today)) {
      streak = 1;
      cursor = date;
      const d = new Date(cursor + "T12:00:00");
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}

function prevDay(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function last7Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

export function HabitTrackerTool({
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
  const weekDays = useMemo(() => last7Days(), []);
  const today = todayKey();

  const addHabit = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      saveState({
        habits: [...state.habits, { id: newId(), name: trimmed, completedDates: [] }],
      });
    },
    [saveState, state.habits]
  );

  const toggleToday = useCallback(
    (habitId: string) => {
      saveState({
        habits: state.habits.map((habit) => {
          if (habit.id !== habitId) return habit;
          const hasToday = habit.completedDates.includes(today);
          return {
            ...habit,
            completedDates: hasToday
              ? habit.completedDates.filter((d) => d !== today)
              : [...habit.completedDates, today],
          };
        }),
      });
    },
    [saveState, state.habits, today]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      saveState({
        habits: state.habits.filter((habit) => habit.id !== habitId),
      });
    },
    [saveState, state.habits]
  );

  const handleAddSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.elements.namedItem("habit-name") as HTMLInputElement;
      addHabit(input.value);
      input.value = "";
    },
    [addHabit]
  );

  const actions = (
    <ToolActions onClear={clearState} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-4" data-testid="habit-tracker">
          <form onSubmit={handleAddSubmit} className="flex gap-2">
            <input
              name="habit-name"
              type="text"
              placeholder="Add a new habit…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="habit-input"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add
            </button>
          </form>

          {state.habits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No habits yet. Add one to start tracking.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {state.habits.map((habit) => {
                const streak = streakFor(habit.completedDates);
                const doneToday = habit.completedDates.includes(today);
                return (
                  <div
                    key={habit.id}
                    className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleToday(habit.id)}
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 text-xs transition-[transform,background-color,border-color,color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                          doneToday
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border [@media(hover:hover)_and_(pointer:fine)]:hover:border-brand"
                        }`}
                        aria-label={`Mark "${habit.name}" for today`}
                      >
                        {doneToday ? "✓" : ""}
                      </button>
                      <span className="flex-1 text-sm font-medium">{habit.name}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{streak} day streak</span>
                      <button
                        type="button"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-xs text-muted-foreground transition-[transform,color] duration-150 ease-out-strong active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:text-destructive motion-reduce:transition-none"
                        aria-label={`Delete habit "${habit.name}"`}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex gap-1 pl-9">
                      {weekDays.map((day) => {
                        const done = habit.completedDates.includes(day);
                        const isToday = day === today;
                        return (
                          <div
                            key={day}
                            title={day}
                            className={`h-6 flex-1 rounded-sm transition-[background-color,border-color] duration-150 ease-out-strong ${
                              done
                                ? "bg-brand"
                                : isToday
                                  ? "border border-dashed border-border bg-muted"
                                  : "bg-muted/50"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}
