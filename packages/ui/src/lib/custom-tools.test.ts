import { describe, expect, it } from "vitest";
import { TOOL_REGISTRY } from "@ayetab/utils";
import { CUSTOM_UI_TOOL_IDS } from "./custom-tools";
import { CUSTOM_TOOL_COMPONENTS, CUSTOM_TOOL_TEST_IDS } from "./custom-tool-components";

/**
 * These three lists have to stay in step or a tool silently renders nothing:
 * `ToolHost` returns null for a custom-UI tool with no component registered.
 */
describe("custom tool wiring", () => {
  it("every custom-UI tool exists in the registry", () => {
    const registryIds = new Set(TOOL_REGISTRY.map((t) => t.id));
    const missing = [...CUSTOM_UI_TOOL_IDS].filter((id) => !registryIds.has(id));
    expect(missing).toEqual([]);
  });

  it("every custom-UI tool has a component", () => {
    const missing = [...CUSTOM_UI_TOOL_IDS].filter((id) => !CUSTOM_TOOL_COMPONENTS[id]);
    expect(missing).toEqual([]);
  });

  it("every registered component is marked as a custom-UI tool", () => {
    const stray = Object.keys(CUSTOM_TOOL_COMPONENTS).filter((id) => !CUSTOM_UI_TOOL_IDS.has(id));
    expect(stray).toEqual([]);
  });

  it("every custom-UI tool has a test id", () => {
    const missing = [...CUSTOM_UI_TOOL_IDS].filter((id) => !CUSTOM_TOOL_TEST_IDS[id]);
    expect(missing).toEqual([]);
  });
});
