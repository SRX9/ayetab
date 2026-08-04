"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { getToolById, type ToolDefinition } from "@ayetab/utils";
import { ShellContent, ToolHost, usePreferences } from "@ayetab/ui";

function readInputFromLocation(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("input") ?? "";
  } catch {
    return "";
  }
}

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, addRecent } = usePreferences();
  // Avoid useSearchParams so static HTML includes the full tool shell for SEO.
  const [initialInput, setInitialInput] = useState("");

  useEffect(() => {
    setInitialInput(readInputFromLocation());
  }, []);

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
      <ShellContent>
        <h1 className="text-title font-semibold text-balance">Tool not found</h1>
        <p className="mt-2 text-ui text-pretty text-muted-foreground">
          This link doesn&rsquo;t match any tool in the library.
        </p>
        <Link href="/" className="mt-4 inline-block text-ui-md text-brand hover:underline">
          Browse all tools
        </Link>
      </ShellContent>
    );
  }

  const host = (
    <ToolHost
      key={`${tool.id}-${initialInput}`}
      tool={tool}
      initialInput={initialInput}
      onNavigate={handleNavigate}
      onRecent={handleRecent}
      isFavorite={isFavorite(tool.id)}
      onToggleFavorite={handleToggleFavorite}
      standalone
    />
  );

  // Excalidraw is a canvas, not a document — it wants the whole pane, unpadded.
  if (tool.id === "excalidraw") {
    return (
      <>
        <Script id="excalidraw-asset-path" strategy="beforeInteractive">
          {`window["EXCALIDRAW_ASSET_PATH"] = window.origin;`}
        </Script>
        <div className="flex h-full min-h-[60vh] w-full flex-col">{host}</div>
      </>
    );
  }

  return (
    <ShellContent wide>
      <div className="tool-surface p-5 md:p-7">{host}</div>
    </ShellContent>
  );
}
