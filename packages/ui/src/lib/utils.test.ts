import { describe, expect, it } from "vitest";
import { cn } from "./utils";

/**
 * The named type scale collides with colour utilities under a stock
 * tailwind-merge, and the symptom is silent: the class just disappears and the
 * element renders at the inherited size. These pin the grouping.
 */
describe("cn", () => {
  it.each([
    ["text-kbd", "text-muted-foreground"],
    ["text-label", "text-muted-foreground"],
    ["text-caption", "text-muted-foreground"],
    ["text-ui", "text-foreground"],
    ["text-ui-md", "text-foreground"],
    ["text-ui-lg", "text-destructive"],
    ["text-subtitle", "text-foreground"],
    ["text-title", "text-foreground"],
    ["text-display", "text-foreground"],
    ["text-display-lg", "text-foreground"],
  ])("keeps %s alongside %s", (size, color) => {
    expect(cn(size, color)).toBe(`${size} ${color}`);
  });

  it("still collapses two sizes down to the last one", () => {
    expect(cn("text-ui", "text-caption")).toBe("text-caption");
    expect(cn("text-title", "text-display-lg")).toBe("text-display-lg");
  });

  it("still collapses two colours down to the last one", () => {
    expect(cn("text-muted-foreground", "text-foreground")).toBe("text-foreground");
  });

  it("keeps unrelated utilities", () => {
    expect(cn("text-caption font-medium uppercase", "text-muted-foreground")).toBe(
      "text-caption font-medium uppercase text-muted-foreground"
    );
  });
});
