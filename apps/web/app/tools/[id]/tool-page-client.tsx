"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getToolById } from "@ayetab/utils";
import { ToolRunner } from "@/components/tool-runner";

export default function ToolPageClient({ toolId }: { toolId: string }) {
  const tool = useMemo(() => getToolById(toolId), [toolId]);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Tool not found</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">
            ← Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← All Tools
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{tool.name}</span>
      </header>
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <ToolRunner tool={tool} />
        </div>
      </main>
    </div>
  );
}
