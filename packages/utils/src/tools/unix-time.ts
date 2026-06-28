import type { ToolResult } from "../types";

export function convertUnixTime(input: string): ToolResult {
  const trimmed = input.trim();

  // If it looks like a timestamp
  if (/^\d{10,13}$/.test(trimmed)) {
    const num = trimmed.length === 13 ? parseInt(trimmed) : parseInt(trimmed) * 1000;
    const date = new Date(num);

    if (isNaN(date.getTime())) {
      return { output: "", error: "Invalid timestamp" };
    }

    return {
      output: [
        `Unix (seconds):  ${Math.floor(num / 1000)}`,
        `Unix (ms):       ${num}`,
        `ISO 8601:        ${date.toISOString()}`,
        `Local:           ${date.toLocaleString()}`,
        `UTC:             ${date.toUTCString()}`,
        `Relative:        ${formatRelative(date)}`,
      ].join("\n"),
    };
  }

  // Try parsing as date string
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    return { output: "", error: "Invalid date or timestamp" };
  }

  const unixSec = Math.floor(date.getTime() / 1000);
  return {
    output: [
      `Unix (seconds):  ${unixSec}`,
      `Unix (ms):       ${date.getTime()}`,
      `ISO 8601:        ${date.toISOString()}`,
      `Local:           ${date.toLocaleString()}`,
      `UTC:             ${date.toUTCString()}`,
      `Relative:        ${formatRelative(date)}`,
    ].join("\n"),
  };
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const suffix = diff > 0 ? "ago" : "from now";

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds} seconds ${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ${suffix}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ${suffix}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ${suffix}`;
  return `${Math.floor(months / 12)} years ${suffix}`;
}

export function nowTimestamp(): ToolResult {
  const now = new Date();
  return {
    output: [
      `Unix (seconds):  ${Math.floor(now.getTime() / 1000)}`,
      `Unix (ms):       ${now.getTime()}`,
      `ISO 8601:        ${now.toISOString()}`,
    ].join("\n"),
  };
}
