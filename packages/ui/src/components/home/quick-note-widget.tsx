"use client";

import { useCallback } from "react";
import { useJsonToolState } from "../../hooks/use-json-tool-state";
import { cn } from "../../lib/utils";

interface NotesState {
  content: string;
}

const DEFAULT_STATE: NotesState = { content: "" };

interface QuickNoteWidgetProps {
  className?: string;
  rows?: number;
}

export function QuickNoteWidget({ className, rows = 5 }: QuickNoteWidgetProps) {
  const { state, saveState, isHydrated } = useJsonToolState("quick-notes", DEFAULT_STATE);

  const updateContent = useCallback(
    (content: string) => {
      saveState({ content });
    },
    [saveState]
  );

  if (!isHydrated) {
    return (
      <div
        className={cn("min-h-[7rem] rounded-xl bg-muted/30", className)}
        data-testid="home-quick-note"
      />
    );
  }

  return (
    <textarea
      value={state.content}
      onChange={(e) => updateContent(e.target.value)}
      placeholder="Write something…"
      rows={rows}
      data-testid="home-quick-note"
      className={cn(
        "material-field w-full resize-y rounded-xl px-3.5 py-3 text-[14px] leading-relaxed",
        "placeholder:text-muted-foreground/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selection/30",
        className
      )}
      spellCheck
    />
  );
}
