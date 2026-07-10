"use client";

import { useMemo } from "react";
import { cn } from "../lib/utils";

interface HtmlPreviewProps {
  html: string;
  className?: string;
}

const PREVIEW_STYLES = `
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: CanvasText;
    background: transparent;
  }
  h1 { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
  h2 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; }
  h3 { font-size: 1rem; font-weight: 500; margin: 0.5rem 0; }
  p { margin: 0.5rem 0; }
  ul { list-style: disc; padding-left: 1.25rem; }
  ol { list-style: decimal; padding-left: 1.25rem; }
  code {
    background: color-mix(in srgb, CanvasText 10%, transparent);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
  pre {
    background: color-mix(in srgb, CanvasText 10%, transparent);
    padding: 0.5rem;
    border-radius: 0.25rem;
    overflow: auto;
  }
  a { color: #2563eb; text-decoration: underline; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid color-mix(in srgb, CanvasText 20%, transparent); padding: 0.25rem 0.5rem; }
`;

/**
 * Renders untrusted HTML/Markdown output inside a sandboxed iframe.
 * Empty sandbox blocks scripts, forms, popups, and same-origin access.
 */
export function HtmlPreview({ html, className }: HtmlPreviewProps) {
  const srcDoc = useMemo(
    () =>
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><style>${PREVIEW_STYLES}</style></head><body>${html}</body></html>`,
    [html]
  );

  return (
    <iframe
      data-testid="tool-output-html"
      title="HTML preview"
      sandbox=""
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
      className={cn(
        "w-full min-h-[8rem] max-h-96 rounded-md border border-input bg-background",
        className
      )}
    />
  );
}
