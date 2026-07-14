"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
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
            "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground",
            "transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:bg-black/[0.04] [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
            "dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.06]"
          )}
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Library
        </Link>
      }
    />
  );
}
