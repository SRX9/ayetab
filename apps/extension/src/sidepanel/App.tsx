"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolDefinition,
  CATEGORY_LABELS,
} from "@ayetab/utils";
import {
  SearchBar,
  CategoryNav,
  CommandPalette,
  ThemeProvider,
  ThemeToggle,
  ToolRunner,
} from "@ayetab/ui";

const CATEGORIES: ToolCategory[] = ["format", "convert", "inspect", "generate", "encode"];

function AppContent() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [initialInput, setInitialInput] = useState("");

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

  const openTool = useCallback((tool: ToolDefinition, input = "") => {
    setSelectedTool(tool);
    setInitialInput(input);
  }, []);

  const handleNavigate = useCallback((tool: ToolDefinition, input: string) => {
    openTool(tool, input);
  }, [openTool]);

  if (selectedTool) {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground">
        <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
        <header className="border-b border-border px-3 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSelectedTool(null);
              setInitialInput("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <span className="text-xs font-medium truncate flex-1">{selectedTool.name}</span>
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-auto p-3">
          <ToolRunner
            key={`${selectedTool.id}-${initialInput}`}
            tool={selectedTool}
            initialInput={initialInput}
            onNavigate={handleNavigate}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <CommandPalette tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} />
      <header className="border-b border-border px-3 py-3 shrink-0 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-sm font-bold tracking-tight">AyeTab</h1>
          <p className="text-[10px] text-muted-foreground">Developer Utilities</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="p-3 border-b border-border">
          <SearchBar tools={TOOL_REGISTRY} onSelect={(t) => openTool(t)} placeholder="Search tools..." />
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
                  onClick={() => openTool(tool)}
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
