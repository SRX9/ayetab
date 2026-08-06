"use client";

import type { ReactNode } from "react";
import { type ToolDefinition } from "@ayetab/utils";
import { BrandMark } from "./brand-mark";
import { SmartBar } from "./smart-bar";

interface TabHomeProps {
  tools: ToolDefinition[];
  onOpenTool: (tool: ToolDefinition) => void;
  title?: string;
  /** Extra content (e.g. first-run notices) shown above the bar. */
  children?: ReactNode;
}

/**
 * The personal new-tab surface: one smart bar for everything. Type to launch
 * a tool, or pick a search engine to query the web in a new tab.
 */
export function TabHome({ tools, onOpenTool, children }: TabHomeProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-5 pb-40 pt-16">
      {children}

      <div className="mb-8 flex flex-col items-center gap-3">
        <BrandMark className="h-14 w-14" size={56} src="/logo-icon.png" />
      </div>

      <SmartBar tools={tools} onOpenTool={onOpenTool} />

      <p className="mt-6 text-center text-caption text-muted-foreground">
        Type to find a tool, or search Google, Bing, or Perplexity.
      </p>
    </div>
  );
}
