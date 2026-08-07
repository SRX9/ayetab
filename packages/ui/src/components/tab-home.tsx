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
 * Google-style personal new-tab: bare logo, AyeTab wordmark, one big liquid-
 * glass smart bar for tools + web search.
 */
export function TabHome({ tools, onOpenTool, children }: TabHomeProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 pb-40 pt-16">
      {children}

      <div className="home-hero mb-10 flex flex-col items-center gap-3">
        <BrandMark bare size={96} className="home-hero-mark" />
        <h1 className="home-hero-title text-display-lg font-semibold tracking-tight text-foreground">
          AyeTab
        </h1>
      </div>

      <SmartBar tools={tools} onOpenTool={onOpenTool} size="hero" />

      <p className="mt-7 text-center text-caption text-muted-foreground">
        Type to find a tool, or search Google, Bing, or Perplexity.
      </p>
    </div>
  );
}
