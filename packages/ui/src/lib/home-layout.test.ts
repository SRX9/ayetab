import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_LAYOUT,
  addWidgetToLayout,
  bentoSpanClass,
  canAddWidget,
  createWidget,
  cycleWidgetSize,
  normalizeHomeLayout,
  removeWidgetFromLayout,
  reorderWidgets,
  toggleHomePin,
} from "./home-layout";

describe("home layout", () => {
  it("normalizes missing home to defaults with dock", () => {
    const layout = normalizeHomeLayout(undefined);
    expect(layout.widgets.length).toBeGreaterThan(0);
    expect(layout.pins.length).toBeGreaterThan(0);
    expect(layout.dock.length).toBeGreaterThan(0);
  });

  it("migrates legacy sizes and drops pins widget", () => {
    const layout = normalizeHomeLayout({
      pins: ["base64"],
      widgets: [
        { id: "a", type: "search", size: "lg" },
        { id: "b", type: "pins", size: "md" },
        { id: "c", type: "quick-note", size: "sm" },
      ],
    });
    expect(layout.widgets.find((w) => (w as { type: string }).type === "pins")).toBeUndefined();
    expect(layout.widgets.find((w) => w.type === "search")?.size).toBe("4x1");
    expect(layout.widgets.find((w) => w.type === "quick-note")?.size).toBe("2x2");
  });

  it("rejects duplicate unique widgets", () => {
    let layout = DEFAULT_HOME_LAYOUT;
    expect(canAddWidget(layout, "search")).toBe(false);
    layout = addWidgetToLayout(layout, "favorites");
    expect(layout.widgets.some((w) => w.type === "favorites")).toBe(true);
    expect(canAddWidget(layout, "favorites")).toBe(false);
  });

  it("removes and reorders widgets", () => {
    const firstId = DEFAULT_HOME_LAYOUT.widgets[0]!.id;
    const removed = removeWidgetFromLayout(DEFAULT_HOME_LAYOUT, firstId);
    expect(removed.widgets.find((w) => w.id === firstId)).toBeUndefined();

    const reordered = reorderWidgets(DEFAULT_HOME_LAYOUT, 0, 2);
    expect(reordered.widgets[2]!.id).toBe(DEFAULT_HOME_LAYOUT.widgets[0]!.id);
  });

  it("cycles bento sizes and toggles pins", () => {
    expect(cycleWidgetSize("2x2")).toBe("4x1");
    expect(cycleWidgetSize("4x1")).toBe("4x2");
    expect(bentoSpanClass("2x2")).toContain("col-span-2");

    const withPin = toggleHomePin(DEFAULT_HOME_LAYOUT, "pomodoro");
    expect(withPin.pins).toContain("pomodoro");
  });

  it("creates widgets with catalog defaults", () => {
    const widget = createWidget("favorites");
    expect(widget.type).toBe("favorites");
    expect(widget.size).toBe("2x2");
  });
});
