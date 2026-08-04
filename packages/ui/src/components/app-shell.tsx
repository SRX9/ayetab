"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type ToolDefinition } from "@ayetab/utils";
import { useAutoHideScrollbar } from "../hooks/use-auto-hide-scrollbar";
import { Dock } from "./dock";

interface AppShellProps {
  tools: ToolDefinition[];
  /** Id of the tool currently open in the content pane, if any. */
  activeToolId?: string;
  onSelectTool: (tool: ToolDefinition) => void;
  /**
   * Real href for each dock tile. Tiles render as anchors so middle-click and
   * "open in new tab" work; plain left-clicks are intercepted for in-app
   * navigation. Omit to render plain buttons.
   */
  toolHref?: (tool: ToolDefinition) => string;
  /** Brand title used by the dock's home tile. */
  title?: string;
  onHome?: () => void;
  children: ReactNode;
}

/**
 * Personal-tab shell: a whitish atmosphere, a content surface, and a floating
 * bottom dock for launching tools. No sidebar — the surface belongs to the
 * user (widgets) and the dock handles navigation.
 */
export function AppShell({
  tools,
  activeToolId,
  onSelectTool,
  toolHref,
  title = "AyeTab",
  onHome,
  children,
}: AppShellProps) {
  const [hydrated, setHydrated] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  /*
   * Rows are server-rendered but only navigate once React attaches their
   * handlers. The shell publishes that moment so tests (and anything else
   * driving the page) can wait for it instead of clicking into the void.
   */
  useEffect(() => setHydrated(true), []);
  useAutoHideScrollbar(mainRef);

  return (
    <div
      className="app-shell flex h-screen flex-col overflow-hidden"
      data-testid="app-shell"
      data-hydrated={hydrated || undefined}
    >
      <main
        ref={mainRef}
        data-scrolling="false"
        className="ds-scroll min-h-0 min-w-0 flex-1 overflow-y-auto"
      >
        {children}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto">
          <Dock
            tools={tools}
            activeToolId={activeToolId}
            onSelectTool={onSelectTool}
            toolHref={toolHref}
            title={title}
            onHome={onHome}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Standard padding for whatever the shell frames. Kept here so the tool pane,
 * the empty state, and any future view share one measure and one gutter. The
 * extra bottom padding clears the floating dock.
 */
export function ShellContent({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "mx-auto w-full px-6 pb-36 pt-10 md:px-12 md:pt-14 " +
        (wide ? "max-w-5xl " : "max-w-3xl ") +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}
