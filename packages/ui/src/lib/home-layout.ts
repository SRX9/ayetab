/** iPad-style SpringBoard layout — bento widgets + app icons + dock */

export type HomeWidgetType =
  | "search"
  | "quick-note"
  | "recents"
  | "favorites"
  | "todo"
  | "clock";

/** Bento tile sizes (columns × rows on the home grid) */
export type BentoSize = "2x2" | "4x2" | "2x4" | "4x4" | "4x1";

/** @deprecated use BentoSize — kept for prefs migration */
export type HomeWidgetSize = "sm" | "md" | "lg" | BentoSize;

export interface HomeWidget {
  id: string;
  type: HomeWidgetType;
  size: BentoSize;
}

export interface HomeLayout {
  /** Bento widgets on the home grid */
  widgets: HomeWidget[];
  /** App icons on the home grid (tool IDs) */
  pins: string[];
  /** Apps in the bottom dock (tool IDs) */
  dock: string[];
}

export interface WidgetCatalogItem {
  type: HomeWidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: BentoSize;
  unique?: boolean;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: "clock",
    name: "Clock",
    description: "Time and greeting",
    icon: "Clock",
    defaultSize: "2x2",
    unique: true,
  },
  {
    type: "search",
    name: "Search",
    description: "Jump to any tool",
    icon: "Search",
    defaultSize: "4x1",
    unique: true,
  },
  {
    type: "quick-note",
    name: "Quick Note",
    description: "Write inline",
    icon: "StickyNote",
    defaultSize: "2x2",
    unique: true,
  },
  {
    type: "todo",
    name: "To-Do",
    description: "Tasks at a glance",
    icon: "ListTodo",
    defaultSize: "2x2",
    unique: true,
  },
  {
    type: "recents",
    name: "Recents",
    description: "Recently opened",
    icon: "Clock",
    defaultSize: "2x2",
    unique: true,
  },
  {
    type: "favorites",
    name: "Favorites",
    description: "Starred tools",
    icon: "Star",
    defaultSize: "2x2",
    unique: true,
  },
];

export const DEFAULT_HOME_PINS = [
  "json-formatter",
  "base64",
  "uuid-generator",
  "hash-generator",
  "jwt-debugger",
  "regex-tester",
  "color-converter",
  "unix-time",
  "case-converter",
  "url-encode",
  "lorem-ipsum",
  "qr-code",
];

export const DEFAULT_HOME_DOCK = [
  "json-formatter",
  "base64",
  "uuid-generator",
  "hash-generator",
  "quick-notes",
];

export const DEFAULT_HOME_LAYOUT: HomeLayout = {
  pins: DEFAULT_HOME_PINS,
  dock: DEFAULT_HOME_DOCK,
  widgets: [
    { id: "home-clock", type: "clock", size: "2x2" },
    { id: "home-search", type: "search", size: "4x1" },
    { id: "home-note", type: "quick-note", size: "2x2" },
    { id: "home-todo", type: "todo", size: "2x2" },
    { id: "home-recents", type: "recents", size: "2x2" },
  ],
};

const VALID_TYPES = new Set<HomeWidgetType>(WIDGET_CATALOG.map((w) => w.type));
const VALID_SIZES = new Set<BentoSize>(["2x2", "4x2", "2x4", "4x4", "4x1"]);

/** Map legacy sm/md/lg (+ removed "pins") into bento sizes */
function migrateSize(raw: unknown, type: HomeWidgetType): BentoSize {
  if (typeof raw === "string" && VALID_SIZES.has(raw as BentoSize)) {
    return raw as BentoSize;
  }
  if (raw === "sm") return "2x2";
  if (raw === "md") return "2x2";
  if (raw === "lg") return type === "search" ? "4x1" : "4x2";
  return WIDGET_CATALOG.find((c) => c.type === type)?.defaultSize ?? "2x2";
}

function newWidgetId(type: HomeWidgetType): string {
  return `w-${type}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createWidget(type: HomeWidgetType, size?: BentoSize): HomeWidget {
  const catalog = WIDGET_CATALOG.find((w) => w.type === type);
  return {
    id: newWidgetId(type),
    type,
    size: size ?? catalog?.defaultSize ?? "2x2",
  };
}

export function normalizeHomeLayout(raw: unknown): HomeLayout {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_HOME_LAYOUT);
  const data = raw as Partial<HomeLayout> & { widgets?: Array<Partial<HomeWidget> & { type?: string }> };

  const pins = Array.isArray(data.pins)
    ? data.pins.filter((id): id is string => typeof id === "string")
    : [...DEFAULT_HOME_PINS];

  const dock = Array.isArray(data.dock)
    ? data.dock.filter((id): id is string => typeof id === "string").slice(0, 6)
    : [...DEFAULT_HOME_DOCK];

  let widgets: HomeWidget[] = [];
  if (Array.isArray(data.widgets)) {
    const seen = new Set<HomeWidgetType>();
    for (const item of data.widgets) {
      if (!item || typeof item !== "object") continue;
      const rawType = String((item as { type?: unknown }).type ?? "");
      // Drop legacy "pins" widget — apps live on the grid now
      if (rawType === "pins" || !rawType) continue;
      if (!VALID_TYPES.has(rawType as HomeWidgetType)) continue;
      const type = rawType as HomeWidgetType;
      const catalog = WIDGET_CATALOG.find((c) => c.type === type);
      if (catalog?.unique && seen.has(type)) continue;
      seen.add(type);
      widgets.push({
        id: typeof item.id === "string" && item.id ? item.id : newWidgetId(type),
        type,
        size: migrateSize((item as { size?: unknown }).size, type),
      });
    }
  }

  if (widgets.length === 0) {
    widgets = structuredClone(DEFAULT_HOME_LAYOUT.widgets);
  }

  return { pins, dock, widgets };
}

export function cycleWidgetSize(size: BentoSize): BentoSize {
  const order: BentoSize[] = ["2x2", "4x1", "4x2", "2x4", "4x4"];
  const i = order.indexOf(size);
  return order[(i + 1) % order.length]!;
}

export function canAddWidget(layout: HomeLayout, type: HomeWidgetType): boolean {
  const catalog = WIDGET_CATALOG.find((w) => w.type === type);
  if (!catalog) return false;
  if (catalog.unique && layout.widgets.some((w) => w.type === type)) return false;
  return true;
}

export function addWidgetToLayout(layout: HomeLayout, type: HomeWidgetType): HomeLayout {
  if (!canAddWidget(layout, type)) return layout;
  return { ...layout, widgets: [...layout.widgets, createWidget(type)] };
}

export function removeWidgetFromLayout(layout: HomeLayout, widgetId: string): HomeLayout {
  return { ...layout, widgets: layout.widgets.filter((w) => w.id !== widgetId) };
}

export function reorderWidgets(layout: HomeLayout, fromIndex: number, toIndex: number): HomeLayout {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return layout;
  if (fromIndex >= layout.widgets.length || toIndex >= layout.widgets.length) return layout;
  const widgets = [...layout.widgets];
  const [moved] = widgets.splice(fromIndex, 1);
  if (!moved) return layout;
  widgets.splice(toIndex, 0, moved);
  return { ...layout, widgets };
}

export function reorderPins(layout: HomeLayout, fromIndex: number, toIndex: number): HomeLayout {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return layout;
  if (fromIndex >= layout.pins.length || toIndex >= layout.pins.length) return layout;
  const pins = [...layout.pins];
  const [moved] = pins.splice(fromIndex, 1);
  if (!moved) return layout;
  pins.splice(toIndex, 0, moved);
  return { ...layout, pins };
}

export function updateWidgetSize(layout: HomeLayout, widgetId: string, size: BentoSize): HomeLayout {
  return {
    ...layout,
    widgets: layout.widgets.map((w) => (w.id === widgetId ? { ...w, size } : w)),
  };
}

export function setHomePins(layout: HomeLayout, pins: string[]): HomeLayout {
  return { ...layout, pins: [...new Set(pins)] };
}

export function toggleHomePin(layout: HomeLayout, toolId: string): HomeLayout {
  const pins = layout.pins.includes(toolId)
    ? layout.pins.filter((id) => id !== toolId)
    : [...layout.pins, toolId];
  return { ...layout, pins };
}

export function setHomeDock(layout: HomeLayout, dock: string[]): HomeLayout {
  return { ...layout, dock: [...new Set(dock)].slice(0, 6) };
}

export function toggleHomeDock(layout: HomeLayout, toolId: string): HomeLayout {
  const dock = layout.dock.includes(toolId)
    ? layout.dock.filter((id) => id !== toolId)
    : [...layout.dock, toolId].slice(0, 6);
  return { ...layout, dock };
}

/** Tailwind grid placement for a bento tile */
export function bentoSpanClass(size: BentoSize): string {
  switch (size) {
    case "4x1":
      return "col-span-4 row-span-1 sm:col-span-4 lg:col-span-4";
    case "2x2":
      return "col-span-2 row-span-2";
    case "4x2":
      return "col-span-4 row-span-2";
    case "2x4":
      return "col-span-2 row-span-4";
    case "4x4":
      return "col-span-4 row-span-4";
    default:
      return "col-span-2 row-span-2";
  }
}

/** @deprecated */
export function widgetSpanClass(size: HomeWidgetSize): string {
  if (size === "sm") return bentoSpanClass("2x2");
  if (size === "md") return bentoSpanClass("2x2");
  if (size === "lg") return bentoSpanClass("4x2");
  return bentoSpanClass(size);
}
