"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { getToolById, type ToolDefinition } from "@ayetab/utils";
import { ToolHost, ThemeToggle, usePreferences, cn } from "@ayetab/ui";

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInput = searchParams.get("input") ?? "";
  const { isFavorite, toggleFavorite, addRecent } = usePreferences();

  const tool = useMemo(() => getToolById(toolId), [toolId]);

  const handleNavigate = useCallback(
    (nextTool: ToolDefinition, input: string) => {
      const params = new URLSearchParams({ input });
      router.push(`/tools/${nextTool.id}?${params.toString()}`);
    },
    [router]
  );

  const handleRecent = useCallback((id: string) => addRecent(id), [addRecent]);

  const handleToggleFavorite = useCallback(() => {
    if (tool) toggleFavorite(tool.id);
  }, [tool, toggleFavorite]);

  if (!tool) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
        <div className="material-window max-w-sm rounded-[24px] px-8 py-10 text-center animate-fade-up motion-reduce:animate-none">
          <h1 className="text-2xl font-semibold tracking-tight">Tool not found</h1>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-muted-foreground transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
          >
            ← Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-stretch justify-center p-0 md:p-4 lg:p-6">
      {tool.id === "excalidraw" && (
        <Script id="excalidraw-asset-path" strategy="beforeInteractive">
          {`window["EXCALIDRAW_ASSET_PATH"] = window.origin;`}
        </Script>
      )}
      <div
        className={cn(
          "app-shell flex w-full max-w-[1180px] flex-1 flex-col overflow-hidden rounded-none md:rounded-[28px] animate-shell-in motion-reduce:animate-none",
          tool.id === "excalidraw" && "min-h-[calc(100vh-2rem)]"
        )}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/30 bg-card/25 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="hidden items-center gap-1.5 md:flex" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]/90 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35)]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]/90 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35)]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]/90 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35)]" />
          </div>
          <Link
            href="/"
            className="rounded-[10px] px-2.5 py-1.5 text-[13px] text-muted-foreground transition-[background-color,color,transform] duration-100 ease-out-strong active:scale-[0.98] material-chip [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
          >
            ← All Tools
          </Link>
          <span className="text-muted-foreground/35">/</span>
          <span className="flex-1 truncate text-[13px] font-medium tracking-tight">{tool.name}</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-7">
          <div
            className={
              tool.id === "excalidraw"
                ? "flex h-full min-h-[60vh] w-full flex-col"
                : "material-window mx-auto max-w-3xl rounded-[22px] p-5 md:p-7"
            }
          >
            <ToolHost
              key={`${tool.id}-${initialInput}`}
              tool={tool}
              initialInput={initialInput}
              onNavigate={handleNavigate}
              onRecent={handleRecent}
              isFavorite={isFavorite(tool.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
