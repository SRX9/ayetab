import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOME_LAYOUT,
  addWidgetToLayout,
  canAddWidget,
  createWidget,
  cycleWidgetSize,
  normalizeHomeLayout,
  removeWidgetFromLayout,
  reorderWidgets,
  toggleHomePin,
} from "./home-layout";

describe("home layout", () => {
  it("normalizes missing home to defaults", () => {
    const layout = normalizeHomeLayout(undefined);
    expect(layout.widgets.length).toBeGreaterThan(0);
    expect(layout.pins).toEqual(DEFAULT_HOME_LAYOUT.pins);
  });

  it("rejects duplicate unique widgets", () => {
    let layout = DEFAULT_HOME_LAYOUT;
    expect(canAddWidget(layout, "search")).toBe(false);
    layout = addWidgetToLayout(layout, "todo");
    expect(layout.widgets.some((w) => w.type === "todo")).toBe(true);
    expect(canAddWidget(layout, "todo")).toBe(false);
  });

  it("removes and reorders widgets", () => {
    const firstId = DEFAULT_HOME_LAYOUT.widgets[0]!.id;
    const removed = removeWidgetFromLayout(DEFAULT_HOME_LAYOUT, firstId);
    expect(removed.widgets.find((w) => w.id === firstId)).toBeUndefined();

    const reordered = reorderWidgets(DEFAULT_HOME_LAYOUT, 0, 2);
    expect(reordered.widgets[2]!.id).toBe(DEFAULT_HOME_LAYOUT.widgets[0]!.id);
  });

  it("cycles sizes and toggles pins", () => {
    expect(cycleWidgetSize("sm")).toBe("md");
    expect(cycleWidgetSize("md")).toBe("lg");
    expect(cycleWidgetSize("lg")).toBe("sm");

    const withPin = toggleHomePin(DEFAULT_HOME_LAYOUT, "pomodoro");
    expect(withPin.pins).toContain("pomodoro");
    const without = toggleHomePin(withPin, "pomodoro");
    expect(without.pins).not.toContain("pomodoro");
  });

  it("creates widgets with catalog defaults", () => {
    const widget = createWidget("favorites");
    expect(widget.type).toBe("favorites");
    expect(widget.size).toBe("md");
    expect(widget.id).toMatch(/^w-favorites-/);
  });
});
