"use client";

import { cn } from "../lib/utils";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJson(code: string): string {
  const escaped = escapeHtml(code);
  return escaped
    .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>:')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="text-green-600 dark:text-green-400">$1</span>')
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="text-purple-600 dark:text-purple-400">$1</span>');
}

function highlightSql(code: string): string {
  const escaped = escapeHtml(code);
  const keywords =
    /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|CREATE|TABLE|INDEX|DROP|ALTER|ADD|PRIMARY|KEY|FOREIGN|REFERENCES|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|IN|EXISTS|BETWEEN|LIKE|IS|COUNT|SUM|AVG|MIN|MAX)\b/gi;
  return escaped.replace(keywords, '<span class="text-purple-600 dark:text-purple-400 font-medium">$1</span>');
}

function highlightCode(code: string, language?: string): string {
  if (language === "json") return highlightJson(code);
  if (language === "sql") return highlightSql(code);
  if (language === "typescript" || language === "javascript") {
    const escaped = escapeHtml(code);
    return escaped.replace(
      /\b(interface|type|const|let|var|function|export|import|from|return|async|await)\b/g,
      '<span class="text-purple-600 dark:text-purple-400">$1</span>'
    );
  }
  return escapeHtml(code);
}

interface CodeOutputProps {
  value: string;
  language?: string;
  className?: string;
  rows?: number;
}

export function CodeOutput({ value, language, className, rows = 8 }: CodeOutputProps) {
  const html = highlightCode(value, language);

  return (
    <pre
      className={cn(
        "w-full overflow-auto rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-mono",
        className
      )}
      style={{ minHeight: `${rows * 1.5}rem`, maxHeight: `${rows * 1.75}rem` }}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
