import { Suspense } from "react";
import type { Metadata } from "next";
import { getToolById, TOOL_REGISTRY } from "@ayetab/utils";
import ToolPageClient from "./tool-page-client";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return TOOL_REGISTRY.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    return {
      title: "Tool not found",
      description: "This AyeTab tool link does not match any tool in the library.",
      robots: { index: false, follow: false },
    };
  }

  const title = tool.name;
  const description = `${tool.description} — runs offline in AyeTab.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://app.ayetab.dev/tools/${tool.id}`,
    },
    openGraph: {
      title: `${tool.name} · AyeTab`,
      description,
      url: `https://app.ayetab.dev/tools/${tool.id}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${tool.name} — AyeTab`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} · AyeTab`,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense>
      <ToolPageClient toolId={id} />
    </Suspense>
  );
}
