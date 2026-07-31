import Link from "next/link";
import {
  TOOL_REGISTRY,
  getToolById,
  buildToolJsonLd,
  CATEGORY_LABELS,
  type ToolDefinition,
} from "@ayetab/utils";
import type { Metadata } from "next";
import { notFoundToolMetadata, toolMetadata } from "@/lib/seo-metadata";
import ToolPageClient from "./tool-page-client";

export function generateStaticParams() {
  return TOOL_REGISTRY.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);
  if (!tool) return notFoundToolMetadata();
  return toolMetadata(tool);
}

function relatedTools(tool: ToolDefinition, limit = 8): ToolDefinition[] {
  return TOOL_REGISTRY.filter((t) => t.category === tool.category && t.id !== tool.id).slice(
    0,
    limit
  );
}

function RelatedTools({ tool }: { tool: ToolDefinition }) {
  const related = relatedTools(tool);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-border px-6 py-8" aria-labelledby="related-tools-heading">
      <h2 id="related-tools-heading" className="text-ui-md font-semibold text-foreground">
        More {CATEGORY_LABELS[tool.category].toLowerCase()} tools
      </h2>
      <p className="mt-1 max-w-[60ch] text-ui text-muted-foreground">
        Free online utilities in the same category — all run locally in your browser.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tools/${t.id}`}
              className="block text-ui text-brand hover:underline"
            >
              {t.name}
            </Link>
            <p className="text-ui text-muted-foreground">{t.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = getToolById(id);
  const jsonLd = tool ? buildToolJsonLd(tool) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ToolPageClient toolId={id} />
      {tool && tool.id !== "excalidraw" && <RelatedTools tool={tool} />}
    </>
  );
}
