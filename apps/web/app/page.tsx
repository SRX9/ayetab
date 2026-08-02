import type { Metadata } from "next";
import { TOOL_REGISTRY, buildToolsItemListJsonLd } from "@ayetab/utils";
import { homeMetadata } from "@/lib/seo-metadata";
import HomePageClient from "./home-page-client";

export const metadata: Metadata = homeMetadata();

export default function HomePage() {
  const jsonLd = buildToolsItemListJsonLd(TOOL_REGISTRY);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/*
        Server-rendered index for crawlers: every tool name + description as
        crawlable links. Visually hidden from the interactive UI (sr-only).
      */}
      <nav className="sr-only" aria-label="All AyeTab tools">
        <ul>
          {TOOL_REGISTRY.map((tool) => (
            <li key={tool.id}>
              <a href={`/tools/${tool.id}`}>
                {tool.name} — {tool.description}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <HomePageClient />
    </>
  );
}
