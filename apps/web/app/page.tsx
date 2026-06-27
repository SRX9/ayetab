"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolDefinition,
  CATEGORY_LABELS,
} from "@ayetab/utils";
import { ToolCard, SearchBar, CategoryNav } from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode"];

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");

  const filteredTools = useMemo(() => {
    if (activeCategory === "all") return TOOL_REGISTRY;
    return TOOL_REGISTRY.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const counts = useMemo(() => {
    const c: Record<ToolCategory | "all", number> = {
      all: TOOL_REGISTRY.length,
      format: 0,
      convert: 0,
      inspect: 0,
      generate: 0,
      encode: 0,
    };
    for (const t of TOOL_REGISTRY) c[t.category]++;
    return c;
  }, []);

  const handleSelect = (tool: ToolDefinition) => {
    router.push(`/tools/${tool.id}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border p-4 flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">AyeTab</h1>
          <p className="text-xs text-muted-foreground">Developer Utilities</p>
        </div>
        <CategoryNav
          categories={CATEGORIES}
          active={activeCategory}
          onSelect={setActiveCategory}
          counts={counts}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {activeCategory === "all" ? "All Tools" : CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <SearchBar tools={TOOL_REGISTRY} onSelect={handleSelect} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onClick={handleSelect} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
