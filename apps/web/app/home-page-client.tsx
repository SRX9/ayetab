"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal, TabHome } from "@ayetab/ui";
import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";

export default function HomePageClient() {
  const router = useRouter();

  const handleOpen = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  return (
    <div data-testid="home-page" className="page-enter">
      <OnboardingModal />
      <TabHome tools={TOOL_REGISTRY} onOpenTool={handleOpen} />
    </div>
  );
}
