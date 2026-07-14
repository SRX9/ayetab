"use client";

import { useCallback, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { cn } from "../../lib/utils";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: number;
}

interface TodoState {
  items: TodoItem[];
  filter: "all" | "active" | "completed";
}

const DEFAULT_STATE: TodoState = { items: [], filter: "all" };

function newId(): string {
  return crypto.randomUUID();
}

interface TodoWidgetProps {
  maxItems?: number;
}

export function TodoWidget({ maxItems = 5 }: TodoWidgetProps) {
  const { state, saveState, isHydrated } = useJsonToolState("todo-list", DEFAULT_STATE);
  const [draft, setDraft] = useState("");

  const active = state.items.filter((i) => !i.completed).slice(0, maxItems);

  const addItem = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    saveState({
      ...state,
      items: [
        {
          id: newId(),
          text,
          completed: false,
          priority: "medium",
          createdAt: Date.now(),
        },
        ...state.items,
      ],
    });
    setDraft("");
  }, [draft, saveState, state]);

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

  if (!isHydrated) {
    return <div className="min-h-[6rem] rounded-xl bg-muted/30" data-testid="home-todo" />;
  }

  return (
    <div className="flex flex-col gap-2" data-testid="home-todo">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          className="material-field h-9 flex-1 rounded-xl px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-selection/30"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-selection text-selection-foreground transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
      {active.length === 0 ? (
        <p className="px-1 py-3 text-center text-[12px] text-muted-foreground">No open tasks</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {active.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.03] dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.05]"
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    item.completed
                      ? "border-selection bg-selection text-selection-foreground"
                      : "border-border/70"
                  )}
                >
                  {item.completed && <Check className="h-3 w-3" strokeWidth={2.5} />}
                </span>
                <span className="truncate text-[13px]">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
