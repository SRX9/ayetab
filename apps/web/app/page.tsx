"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingModal, ToolIndex } from "@ayetab/ui";
import { TOOL_REGISTRY, type ToolDefinition } from "@ayetab/utils";

export default function HomePage() {
  const router = useRouter();

  const handleOpen = useCallback(
    (tool: ToolDefinition) => router.push(`/tools/${tool.id}`),
    [router]
  );

  return (
    <div data-testid="home-page">
      <OnboardingModal />
      <ToolIndex tools={TOOL_REGISTRY} onSelect={handleOpen} />
    </div>
  );
}
