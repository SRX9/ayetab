import { useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { getToolById, type ToolDefinition } from "@ayetab/utils";
import { ShellContent, ToolHost, ToolIcon, usePreferences } from "@ayetab/ui";
import { WEB_ONLY_TOOLS, isWebOnlyTool, webAppToolUrl } from "../lib/extension-tools";
import { homeHash } from "./route";

interface ToolViewProps {
  toolId: string;
  initialInput: string;
  onNavigate: (tool: ToolDefinition, input: string) => void;
}

export function ToolView({ toolId, initialInput, onNavigate }: ToolViewProps) {
  const { isFavorite, toggleFavorite, addRecent } = usePreferences();
  const tool = useMemo(() => getToolById(toolId), [toolId]);

  const handleToggleFavorite = useCallback(() => {
    if (tool) toggleFavorite(tool.id);
  }, [tool, toggleFavorite]);

  if (!tool) {
    return <ToolFallback title="Tool not found" />;
  }

  // Reachable by pasting or reloading a deep link — the tool itself is stubbed out.
  if (isWebOnlyTool(tool.id)) {
    return (
      <ToolFallback
        title={tool.name}
        body="Browser extension security rules block the libraries this tool needs. It runs in the AyeTab web app instead — same offline, on-device behaviour."
        action={
          <a
            href={webAppToolUrl(tool.id, initialInput)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-selection px-3 py-1.5 text-ui font-medium text-selection-foreground transition-opacity hover:opacity-90"
          >
            Open in web app
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={14}
              strokeWidth={1.75}
              color="currentColor"
              aria-hidden
            />
          </a>
        }
      />
    );
  }

  return (
    <div data-testid="newtab-tool-view">
      <ShellContent wide>
        <div className="tool-surface p-5 md:p-7">
          <ToolHost
            key={`${tool.id}-${initialInput}`}
            tool={tool}
            initialInput={initialInput}
            onNavigate={onNavigate}
            onRecent={addRecent}
            isFavorite={isFavorite(tool.id)}
            onToggleFavorite={handleToggleFavorite}
            standalone
          />
        </div>
      </ShellContent>
    </div>
  );
}

function ToolFallback({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <ShellContent>
      <h1 className="text-title font-semibold text-balance">{title}</h1>
      {body && (
        <p className="mt-2 max-w-[60ch] text-ui leading-relaxed text-pretty text-muted-foreground">
          {body}
        </p>
      )}
      {action}
      <p className="mt-6">
        <a href={homeHash()} className="text-ui text-muted-foreground hover:text-foreground">
          ← All tools
        </a>
      </p>
    </ShellContent>
  );
}

/**
 * Tools the extension can't run locally. Linking them out beats hiding them:
 * users searching for "draw" or "whiteboard" otherwise find nothing.
 */
export function WebOnlyToolsSection() {
  if (WEB_ONLY_TOOLS.length === 0) return null;

  return (
    <section>
      <h2 className="border-b border-border px-2 pb-1.5 text-label font-medium uppercase text-muted-foreground">
        Opens in the web app
      </h2>
      <p className="px-2 pt-2 text-caption text-pretty text-muted-foreground">
        Browser extension security rules block these libraries. They run at app.ayetab.dev with the
        same offline, on-device behaviour.
      </p>
      <ul className="mt-1">
        {WEB_ONLY_TOOLS.map((tool) => (
          <li key={tool.id}>
            <a
              href={webAppToolUrl(tool.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded px-2 py-1.5 row-idle transition-colors duration-100"
            >
              <ToolIcon
                name={tool.icon}
                className="h-[17px] w-[17px] shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ui-md font-medium">{tool.name}</span>
                <span className="mt-0.5 block truncate text-caption text-muted-foreground">
                  {tool.description}
                </span>
              </span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={15}
                strokeWidth={1.75}
                color="currentColor"
                className="shrink-0 text-muted-foreground"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
