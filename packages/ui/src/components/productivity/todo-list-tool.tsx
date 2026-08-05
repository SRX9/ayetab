"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolShell } from "../tool-shell";
import { Button } from "../button";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { cn } from "../../lib/utils";
import { FOCUS_RING } from "../../lib/pressable";
import { CustomToolProps, LoadingState, newId, ToolActions } from "./shared";

type TodoPriority = "low" | "medium" | "high";
type TodoFilter = "all" | "active" | "completed";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: number;
}

interface TodoState {
  items: TodoItem[];
  filter: TodoFilter;
}

const DEFAULT_STATE: TodoState = { items: [], filter: "all" };

/** Same 32px control height the design tools use, so the add row lines up. */
const CONTROL_CLASS =
  "h-8 min-w-0 rounded border border-border bg-background px-2 text-ui " +
  "transition-colors duration-100 placeholder:text-muted-foreground " +
  "focus:border-[hsl(var(--ring)/0.6)] " +
  FOCUS_RING;

const PRIORITY_STYLES: Record<TodoPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function TodoListTool({
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
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");

  const visibleItems = useMemo(() => {
    if (state.filter === "active") return state.items.filter((item) => !item.completed);
    if (state.filter === "completed") return state.items.filter((item) => item.completed);
    return state.items;
  }, [state.filter, state.items]);

  const activeCount = state.items.filter((item) => !item.completed).length;

  const addItem = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    saveState({
      ...state,
      items: [
        { id: newId(), text, completed: false, priority, createdAt: Date.now() },
        ...state.items,
      ],
    });
    setDraft("");
  }, [draft, priority, saveState, state]);

  const toggleItem = useCallback(
    (id: string) => {
      saveState({
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ),
      });
    },
    [saveState, state]
  );

  const deleteItem = useCallback(
    (id: string) => {
      saveState({
        ...state,
        items: state.items.filter((item) => item.id !== id),
      });
    },
    [saveState, state]
  );

  const setFilter = useCallback(
    (filter: TodoFilter) => {
      saveState({ ...state, filter });
    },
    [saveState, state]
  );

  const handleClear = useCallback(() => {
    clearState();
    setDraft("");
  }, [clearState]);

  const actions = (
    <ToolActions onClear={handleClear} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-4" data-testid="todo-list">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add a new task…"
              aria-label="Add a new task"
              className={cn(CONTROL_CLASS, "flex-1")}
              data-testid="todo-input"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className={cn(CONTROL_CLASS, "cursor-pointer")}
              aria-label="Priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button variant="primary" size="md" onClick={addItem}>
              Add
            </Button>
          </div>

          <div role="radiogroup" aria-label="Filter tasks" className="flex items-center gap-1">
            {(["all", "active", "completed"] as TodoFilter[]).map((filter) => {
              const active = state.filter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFilter(filter)}
                  className={cn(
                    "rounded border px-2 py-1 text-caption font-medium capitalize transition-colors duration-100",
                    FOCUS_RING,
                    active
                      ? "border-ring bg-selection-soft text-foreground"
                      : "border-border text-muted-foreground hover:bg-[hsl(var(--hover-fill))] hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              );
            })}
            <span className="ms-auto text-caption tabular-nums text-muted-foreground">
              {activeCount} active
            </span>
          </div>

          <ul className="flex min-h-[12rem] flex-col gap-1.5">
            {visibleItems.length === 0 ? (
              <li className="py-8 text-center text-ui text-muted-foreground">
                No tasks yet. Add one above.
              </li>
            ) : (
              visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded border border-border bg-card px-2 py-1.5 transition-colors duration-100"
                >
                  {/* The box stays 16px; the label carries it to a 24px target. */}
                  <label className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(item.id)}
                      className={cn(
                        "h-4 w-4 cursor-pointer rounded-sm border-border accent-[hsl(var(--selection))]",
                        FOCUS_RING
                      )}
                      aria-label={`Mark "${item.text}" as ${item.completed ? "incomplete" : "complete"}`}
                    />
                  </label>
                  <span
                    className={cn(
                      "flex-1 text-ui",
                      item.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {item.text}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-label uppercase ${PRIORITY_STYLES[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="hover:text-destructive"
                    aria-label={`Delete "${item.text}"`}
                  >
                    Delete
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </ToolShell>
  );
}
