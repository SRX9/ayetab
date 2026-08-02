import type { Metadata } from "next";
import {
  WEB_APP_ORIGIN,
  getHomeSeo,
  getToolSeo,
  type ToolDefinition,
} from "@ayetab/utils";

const OG_IMAGE = `${WEB_APP_ORIGIN}/og-image.jpg`;

export function homeMetadata(): Metadata {
  const seo = getHomeSeo();
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      type: "website",
      url: seo.canonicalUrl,
      siteName: "AyeTab",
      title: seo.title,
      description: seo.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "AyeTab" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [OG_IMAGE],
    },
  };
}

export function toolMetadata(tool: ToolDefinition): Metadata {
  const seo = getToolSeo(tool);
  return {
    title: {
      absolute: seo.title,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      type: "website",
      url: seo.canonicalUrl,
      siteName: "AyeTab",
      title: seo.title,
      description: seo.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: tool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function notFoundToolMetadata(): Metadata {
  return {
    title: "Tool not found",
    description: "This AyeTab tool link does not match any utility in the library.",
    robots: { index: false, follow: true },
  };
}
