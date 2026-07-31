import { TOOL_REGISTRY, WEB_APP_ORIGIN, type ToolDefinition } from "@ayetab/utils";

export { WEB_APP_ORIGIN };

/**
 * Tools that rely on CSP-unsafe libraries. Excalidraw uses `Function`/`eval`
 * constructs that MV3 CSP and AMO both reject, so the bundle aliases it to a
 * stub — see `vite.config.ts`. This applies to every extension page, new tab
 * included. Rather than hide these, we hand them off to the web app.
 */
export const EXTENSION_EXCLUDED_TOOL_IDS = new Set(["excalidraw"]);

/** Registry minus the tools that can't run here — use for in-extension lists. */
export const EXTENSION_TOOLS = TOOL_REGISTRY.filter(
  (t) => !EXTENSION_EXCLUDED_TOOL_IDS.has(t.id)
);

/** The complement — surfaced as outbound links rather than hidden. */
export const WEB_ONLY_TOOLS = TOOL_REGISTRY.filter((t) =>
  EXTENSION_EXCLUDED_TOOL_IDS.has(t.id)
);

export function isWebOnlyTool(toolId: string): boolean {
  return EXTENSION_EXCLUDED_TOOL_IDS.has(toolId);
}

export function webAppToolUrl(toolId: string, input?: string): string {
  const url = `${WEB_APP_ORIGIN}/tools/${toolId}`;
  return input ? `${url}?${new URLSearchParams({ input }).toString()}` : url;
}

/** Open a web-only tool in a new browser tab. Returns false if the tool runs locally. */
export function openWebOnlyTool(tool: ToolDefinition, input?: string): boolean {
  if (!isWebOnlyTool(tool.id)) return false;
  window.open(webAppToolUrl(tool.id, input), "_blank", "noopener,noreferrer");
  return true;
}
