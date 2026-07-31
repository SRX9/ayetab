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
      data-testid="tool-output-code"
      className={cn(
        // Same surface as the plain-text output it replaces, so switching tools
        // doesn't swap the material under the panel.
        "field w-full overflow-auto px-3 py-2.5 font-mono text-base/[1.5] sm:text-sm/[1.5]",
        className
      )}
      /*
       * Same leading (1.5em), padding (1.25rem) and border (2px) as the input
       * textarea, so side by side the two panels share a bottom edge.
       */
      style={{
        minHeight: `calc(${rows} * 1.5em + 1.25rem + 2px)`,
        maxHeight: `calc(${rows} * 2.5em + 1.25rem + 2px)`,
      }}
    >
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
