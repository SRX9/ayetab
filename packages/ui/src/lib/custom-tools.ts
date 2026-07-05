/** Tools that use a custom UI instead of the standard input/output runner. */
export const CUSTOM_UI_TOOL_IDS = new Set(["excalidraw"]);

export function isCustomUiTool(toolId: string): boolean {
  return CUSTOM_UI_TOOL_IDS.has(toolId);
}
