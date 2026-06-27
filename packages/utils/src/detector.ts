import { TOOL_REGISTRY } from "./registry";
import type { ToolDefinition } from "./types";

export interface DetectionResult {
  tool: ToolDefinition;
  confidence: "high" | "medium";
}

export function detectTool(input: string): DetectionResult | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // JWT — high confidence (three dot-separated segments)
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
    const tool = TOOL_REGISTRY.find((t) => t.id === "jwt-debugger");
    if (tool) return { tool, confidence: "high" };
  }

  // JSON — high confidence
  if (/^[\s]*[{[]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      const tool = TOOL_REGISTRY.find((t) => t.id === "json-formatter");
      if (tool) return { tool, confidence: "high" };
    } catch {
      // Not valid JSON, continue
    }
  }

  // Unix timestamp — high confidence
  if (/^\d{10}$/.test(trimmed) || /^\d{13}$/.test(trimmed)) {
    const tool = TOOL_REGISTRY.find((t) => t.id === "unix-time");
    if (tool) return { tool, confidence: "high" };
  }

  // URL — high confidence
  if (/^https?:\/\//.test(trimmed)) {
    const tool = TOOL_REGISTRY.find((t) => t.id === "url-parser");
    if (tool) return { tool, confidence: "high" };
  }

  // Base64 — medium confidence
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length >= 4) {
    const tool = TOOL_REGISTRY.find((t) => t.id === "base64");
    if (tool) return { tool, confidence: "medium" };
  }

  // Hex — medium confidence
  if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= 2) {
    const tool = TOOL_REGISTRY.find((t) => t.id === "hex-ascii");
    if (tool) return { tool, confidence: "medium" };
  }

  return null;
}
