"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutGridIcon } from "@hugeicons/core-free-icons";
import { HomeScreen, cn } from "@ayetab/ui";
import type { ToolDefinition } from "@ayetab/utils";

export default function HomePage() {
  const router = useRouter();

  const handleOpen = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  return (
    <HomeScreen
      onOpenTool={handleOpen}
      libraryHref="/library"
      libraryLink={
        <Link
          href="/library"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1.5 text-[13px] font-medium text-foreground backdrop-blur-md",
            "dark:bg-white/10",
            "transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/40 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/15"
          )}
        >
          <HugeiconsIcon icon={LayoutGridIcon} size={14} strokeWidth={1.75} color="currentColor" aria-hidden />
          Library
        </Link>
      }
    />
  );
}
