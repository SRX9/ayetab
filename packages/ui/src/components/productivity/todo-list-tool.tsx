"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
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
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="Add a new task…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="todo-input"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              aria-label="Priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {(["all", "active", "completed"] as TodoFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setFilter(filter)}
                className={`rounded-full px-3 py-1 capitalize transition-colors ${
                  state.filter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {filter}
              </button>
            ))}
            <span className="ml-auto text-muted-foreground">{activeCount} active</span>
          </div>

          <ul className="flex flex-col gap-2 min-h-[12rem]">
            {visibleItems.length === 0 ? (
              <li className="text-sm text-muted-foreground text-center py-8">
                No tasks yet. Add one above.
              </li>
            ) : (
              visibleItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 rounded border-border"
                    aria-label={`Mark "${item.text}" as ${item.completed ? "incomplete" : "complete"}`}
                  />
                  <span
                    className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {item.text}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${PRIORITY_STYLES[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Delete "${item.text}"`}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </ToolShell>
  );
}
