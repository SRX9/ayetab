"use client";

import { cn } from "../lib/utils";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt = "Preview", className }: ImagePreviewProps) {
  return (
    <div data-testid="tool-output-image" className={cn("rounded-md border border-input bg-muted/30 p-4 flex items-center justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} data-testid="tool-output-image-img" className="max-w-full max-h-64 object-contain" />
    </div>
  );
}
