"use client";

import { useCallback, useRef, useState } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { CustomToolProps, LoadingState, newId, ToolActions } from "./shared";

interface KanbanCard {
  id: string;
  title: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanState {
  columns: KanbanColumn[];
}

const DEFAULT_STATE: KanbanState = {
  columns: [
    { id: "todo", title: "To Do", cards: [] },
    { id: "doing", title: "In Progress", cards: [] },
    { id: "done", title: "Done", cards: [] },
  ],
};

export function KanbanTool({
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
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const dragCardIdRef = useRef<string | null>(null);

  const addCard = useCallback(
    (columnId: string) => {
      const title = (drafts[columnId] ?? "").trim();
      if (!title) return;
      saveState({
        columns: state.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, { id: newId(), title }] } : col
        ),
      });
      setDrafts((prev) => ({ ...prev, [columnId]: "" }));
    },
    [drafts, saveState, state.columns]
  );

  const deleteCard = useCallback(
    (columnId: string, cardId: string) => {
      saveState({
        columns: state.columns.map((col) =>
          col.id === columnId
            ? { ...col, cards: col.cards.filter((card) => card.id !== cardId) }
            : col
        ),
      });
    },
    [saveState, state.columns]
  );

  const moveCard = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      if (fromColumnId === toColumnId) return;
      let movedCard: KanbanCard | null = null;
      const columns = state.columns.map((col) => {
        if (col.id !== fromColumnId) return col;
        const card = col.cards.find((c) => c.id === cardId);
        if (!card) return col;
        movedCard = card;
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
      });
      if (!movedCard) return;
      saveState({
        columns: columns.map((col) => {
          if (col.id !== toColumnId) return col;
          const cards = [...col.cards];
          cards.splice(toIndex, 0, movedCard!);
          return { ...col, cards };
        }),
      });
    },
    [saveState, state.columns]
  );

  const handleDrop = useCallback(
    (columnId: string) => {
      const dragCardId = dragCardIdRef.current;
      if (!dragCardId) return;
      const fromColumn = state.columns.find((col) => col.cards.some((c) => c.id === dragCardId));
      if (!fromColumn) return;
      moveCard(dragCardId, fromColumn.id, columnId, state.columns.find((c) => c.id === columnId)?.cards.length ?? 0);
      dragCardIdRef.current = null;
    },
    [moveCard, state.columns]
  );

  const actions = (
    <ToolActions onClear={clearState} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[20rem]"
          data-testid="kanban-board"
        >
          {state.columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col rounded-lg border border-border bg-muted/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <h3 className="text-sm font-medium">{column.title}</h3>
                <span className="text-xs text-muted-foreground">{column.cards.length}</span>
              </div>

              <div className="flex flex-col gap-2 p-2 flex-1 min-h-[8rem]">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => {
                      dragCardIdRef.current = card.id;
                    }}
                    onDragEnd={() => {
                      dragCardIdRef.current = null;
                    }}
                    className="rounded-md border border-border bg-card px-3 py-2 text-sm cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span>{card.title}</span>
                      <button
                        type="button"
                        onClick={() => deleteCard(column.id, card.id)}
                        className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                        aria-label={`Delete card "${card.title}"`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-1 p-2 border-t border-border">
                <input
                  type="text"
                  value={drafts[column.id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [column.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addCard(column.id)}
                  placeholder="Add card…"
                  className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => addCard(column.id)}
                  className="rounded-md bg-primary px-2 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolShell>
  );
}
