/**
 * CSP-safe stub for @excalidraw/excalidraw in the browser extension build.
 * Excalidraw uses `new Function` / eval-like constructs that MV3 CSP blocks
 * and that Firefox AMO rejects. Draw & Write remains available on the web app.
 */
import type { ComponentType } from "react";

export const Excalidraw: ComponentType<Record<string, unknown>> = () => null;

export default { Excalidraw };
