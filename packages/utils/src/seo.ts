import type { ToolDefinition } from "./types";
import { CATEGORY_LABELS } from "./types";

/** Canonical origin for the Next.js web app (indexed tool pages). */
export const WEB_APP_ORIGIN = "https://app.ayetab.dev";

/** Marketing site origin. */
export const MARKETING_ORIGIN = "https://ayetab.dev";

const SITE_NAME = "AyeTab";

export interface ToolSeoContent {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  canonicalUrl: string;
  categoryLabel: string;
}

/** Build unique, search-oriented copy for a tool page. */
export function getToolSeo(tool: ToolDefinition, origin = WEB_APP_ORIGIN): ToolSeoContent {
  const categoryLabel = CATEGORY_LABELS[tool.category];
  const title = `${tool.name} — Free Online ${categoryLabel} Tool | ${SITE_NAME}`;
  const description = [
    `${tool.description}.`,
    `Free ${tool.name.toLowerCase()} — runs entirely in your browser, no signup, no data leaves your device.`,
    `Part of ${SITE_NAME}, the offline developer toolbox.`,
  ].join(" ");

  const keywords = Array.from(
    new Set([
      tool.name,
      ...tool.keywords,
      categoryLabel,
      "online",
      "free",
      "developer tool",
      "offline",
      SITE_NAME,
    ])
  );

  const canonicalPath = `/tools/${tool.id}`;
  return {
    title,
    description,
    keywords,
    canonicalPath,
    canonicalUrl: `${origin}${canonicalPath}`,
    categoryLabel,
  };
}

export function getHomeSeo(origin = WEB_APP_ORIGIN) {
  return {
    title: `${SITE_NAME} — Developer Utilities Online`,
    description:
      "All-in-one developer toolbox: format JSON, decode JWT, encode Base64, generate UUIDs, and 90+ more utilities. Free, private, runs offline in your browser.",
    canonicalUrl: origin,
    keywords: [
      "developer tools",
      "json formatter",
      "base64",
      "jwt debugger",
      "uuid generator",
      "online utilities",
      "offline",
      SITE_NAME,
    ],
  };
}

/** JSON-LD for a tool page (WebApplication + BreadcrumbList). */
export function buildToolJsonLd(tool: ToolDefinition, origin = WEB_APP_ORIGIN) {
  const seo = getToolSeo(tool, origin);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${seo.canonicalUrl}#app`,
        name: tool.name,
        description: seo.description,
        url: seo.canonicalUrl,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: origin,
        },
        featureList: tool.keywords,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${seo.canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: seo.categoryLabel,
            item: `${origin}/?category=${tool.category}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: seo.canonicalUrl,
          },
        ],
      },
    ],
  };
}

/** JSON-LD ItemList of all tools for the home / sitemap consumers. */
export function buildToolsItemListJsonLd(
  tools: ToolDefinition[],
  origin = WEB_APP_ORIGIN
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} developer tools`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${origin}/tools/${tool.id}`,
      description: tool.description,
    })),
  };
}
