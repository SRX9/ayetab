"use client";

import { cn } from "../lib/utils";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt = "Preview", className }: ImagePreviewProps) {
  return (
    <div
      data-testid="tool-output-image"
      className={cn("field flex items-center justify-center p-4", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        data-testid="tool-output-image-img"
        /* Pure black/white at 10% — a tinted outline picks up the surface and reads as dirt. */
        className="max-h-64 max-w-full rounded-sm object-contain outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
      />
    </div>
  );
}
