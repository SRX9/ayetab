"use client";

import { cn } from "../lib/utils";

interface HtmlPreviewProps {
  html: string;
  className?: string;
}

export function HtmlPreview({ html, className }: HtmlPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background px-4 py-3 text-sm overflow-auto max-h-96",
        "[&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold",
        "[&_h3]:text-base [&_h3]:font-medium [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded",
        "[&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_a]:text-blue-600 [&_a]:underline",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
