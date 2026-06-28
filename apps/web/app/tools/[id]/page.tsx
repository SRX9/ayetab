import { Suspense } from "react";
import { TOOL_REGISTRY } from "@ayetab/utils";
import ToolPageClient from "./tool-page-client";

export function generateStaticParams() {
  return TOOL_REGISTRY.map((tool) => ({ id: tool.id }));
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ToolPageClient toolId={id} />
    </Suspense>
  );
}
