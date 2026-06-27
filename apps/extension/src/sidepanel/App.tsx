"use client";

import { useState, useMemo } from "react";
import {
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolDefinition,
  CATEGORY_LABELS,
} from "@ayetab/utils";
import { SearchBar, CategoryNav } from "@ayetab/ui";
import { ToolView } from "./tool-view";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode"];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);

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

  if (selectedTool) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <header className="border-b border-border px-3 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedTool(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <span className="text-xs font-medium truncate">{selectedTool.name}</span>
        </header>
        <div className="flex-1 overflow-auto p-3">
          <ToolView tool={selectedTool} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border px-3 py-3 shrink-0">
        <h1 className="text-sm font-bold tracking-tight">AyeTab</h1>
        <p className="text-[10px] text-muted-foreground">Developer Utilities</p>
      </header>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="p-3 border-b border-border">
          <SearchBar
            tools={TOOL_REGISTRY}
            onSelect={setSelectedTool}
            placeholder="Search tools..."
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <nav className="w-32 shrink-0 border-r border-border p-2 overflow-auto">
            <CategoryNav
              categories={CATEGORIES}
              active={activeCategory}
              onSelect={setActiveCategory}
              counts={counts}
            />
          </nav>

          <div className="flex-1 overflow-auto p-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {activeCategory === "all" ? "All Tools" : CATEGORY_LABELS[activeCategory]}
            </p>
            <div className="flex flex-col gap-1">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className="flex flex-col gap-0.5 rounded-md px-2 py-2 text-left hover:bg-accent transition-colors"
                >
                  <span className="text-xs font-medium">{tool.name}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {tool.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
