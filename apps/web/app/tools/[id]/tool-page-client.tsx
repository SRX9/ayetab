"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { getToolById, type ToolDefinition } from "@ayetab/utils";
import { ToolHost, ThemeToggle, usePreferences } from "@ayetab/ui";

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
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center animate-fade-up motion-reduce:animate-none">
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
    <div className="flex min-h-screen flex-col">
      {tool.id === "excalidraw" && (
        <Script id="excalidraw-asset-path" strategy="beforeInteractive">
          {`window["EXCALIDRAW_ASSET_PATH"] = window.origin;`}
        </Script>
      )}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/80 bg-background/80 px-6 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-colors duration-150 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground"
        >
          ← All Tools
        </Link>
        <span className="text-border">/</span>
        <span className="flex-1 text-sm font-medium tracking-tight">{tool.name}</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-6 md:p-8">
        <div className={tool.id === "excalidraw" ? "w-full" : "mx-auto max-w-3xl"}>
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
  );
}
