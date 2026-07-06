"use client";

import { useCallback } from "react";
import { ToolShell } from "../tool-shell";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { CustomToolProps, LoadingState, ToolActions } from "./shared";

interface NotesState {
  content: string;
}

const DEFAULT_STATE: NotesState = { content: "" };

export function QuickNotesTool({
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

  const updateContent = useCallback(
    (content: string) => {
      saveState({ content });
    },
    [saveState]
  );

  const wordCount = state.content.trim() ? state.content.trim().split(/\s+/).length : 0;

  const actions = (
    <ToolActions onClear={clearState} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
  );

  return (
    <ToolShell title={tool.name} description={tool.description} actions={actions}>
      {!isHydrated ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-2" data-testid="quick-notes">
          <textarea
            value={state.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Start typing your notes…"
            className="min-h-[20rem] w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="notes-textarea"
          />
          <p className="text-xs text-muted-foreground text-right">
            {state.content.length} characters · {wordCount} words
          </p>
        </div>
      )}
    </ToolShell>
  );
}
