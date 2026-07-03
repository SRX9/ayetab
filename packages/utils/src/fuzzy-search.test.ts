import { describe, it, expect } from "vitest";
import { fuzzyMatch, fuzzySearchTools } from "./fuzzy-search";
import { TOOL_REGISTRY } from "./registry";

describe("fuzzyMatch", () => {
  it("matches subsequence characters in order", () => {
    const match = fuzzyMatch("jf", "JSON Formatter");
    expect(match).not.toBeNull();
    expect(match!.indices.length).toBe(2);
  });

  it("returns null when characters are missing", () => {
    expect(fuzzyMatch("xyz", "JSON Formatter")).toBeNull();
  });

  it("prefers consecutive matches", () => {
    const consecutive = fuzzyMatch("json", "JSON Formatter")!.score;
    const sparse = fuzzyMatch("jsf", "JSON Formatter")!.score;
    expect(consecutive).toBeGreaterThan(sparse);
  });
});

describe("fuzzySearchTools", () => {
  it("returns all tools for empty query", () => {
    expect(fuzzySearchTools("", TOOL_REGISTRY)).toHaveLength(TOOL_REGISTRY.length);
  });

  it("finds tools by acronym-style query", () => {
    const results = fuzzySearchTools("jf", TOOL_REGISTRY);
    expect(results[0]?.tool.id).toBe("json-formatter");
  });

  it("finds tools by keyword abbreviation", () => {
    const results = fuzzySearchTools("b64", TOOL_REGISTRY);
    expect(results.some((r) => r.tool.id === "base64")).toBe(true);
  });

  it("finds JWT debugger with partial query", () => {
    const results = fuzzySearchTools("jwt", TOOL_REGISTRY);
    expect(results[0]?.tool.id).toBe("jwt-debugger");
  });
});
