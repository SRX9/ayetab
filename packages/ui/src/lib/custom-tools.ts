/** Tools that use a custom UI instead of the standard input/output runner. */
export const CUSTOM_UI_TOOL_IDS = new Set([
  "excalidraw",
  "todo-list",
  "kanban-board",
  "pomodoro",
  "quick-notes",
  "stopwatch",
  "habit-tracker",
]);

export function isCustomUiTool(toolId: string): boolean {
  return CUSTOM_UI_TOOL_IDS.has(toolId);
}
