/** Customizable home screen layout — phone-style widgets + pinned apps */

export type HomeWidgetType =
  | "search"
  | "pins"
  | "quick-note"
  | "recents"
  | "favorites"
  | "todo";

export type HomeWidgetSize = "sm" | "md" | "lg";

export interface HomeWidget {
  id: string;
  type: HomeWidgetType;
  size: HomeWidgetSize;
}

export interface HomeLayout {
  /** Ordered widget stack (top → bottom) */
  widgets: HomeWidget[];
  /** Tool IDs shown in the Pins widget (app icons) */
  pins: string[];
}

export interface WidgetCatalogItem {
  type: HomeWidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: HomeWidgetSize;
  /** Only one of this type allowed on the home */
  unique?: boolean;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: "search",
    name: "Search",
    description: "Jump to any tool instantly",
    icon: "Search",
    defaultSize: "lg",
    unique: true,
  },
  {
    type: "pins",
    name: "Apps",
    description: "Pinned tools as quick-launch icons",
    icon: "LayoutGrid",
    defaultSize: "lg",
    unique: true,
  },
  {
    type: "quick-note",
    name: "Quick Note",
    description: "Write and capture thoughts inline",
    icon: "StickyNote",
    defaultSize: "md",
    unique: true,
  },
  {
    type: "todo",
    name: "To-Do",
    description: "Check off tasks without leaving home",
    icon: "ListTodo",
    defaultSize: "md",
    unique: true,
  },
  {
    type: "recents",
    name: "Recents",
    description: "Tools you opened recently",
    icon: "Clock",
    defaultSize: "md",
    unique: true,
  },
  {
    type: "favorites",
    name: "Favorites",
    description: "Your starred tools",
    icon: "Star",
    defaultSize: "md",
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
];

export const DEFAULT_HOME_LAYOUT: HomeLayout = {
  pins: DEFAULT_HOME_PINS,
  widgets: [
    { id: "home-search", type: "search", size: "lg" },
    { id: "home-pins", type: "pins", size: "lg" },
    { id: "home-note", type: "quick-note", size: "md" },
    { id: "home-recents", type: "recents", size: "md" },
  ],
};

const VALID_TYPES = new Set<HomeWidgetType>(WIDGET_CATALOG.map((w) => w.type));
const VALID_SIZES = new Set<HomeWidgetSize>(["sm", "md", "lg"]);

function newWidgetId(type: HomeWidgetType): string {
  return `w-${type}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createWidget(type: HomeWidgetType, size?: HomeWidgetSize): HomeWidget {
  const catalog = WIDGET_CATALOG.find((w) => w.type === type);
  return {
    id: newWidgetId(type),
    type,
    size: size ?? catalog?.defaultSize ?? "md",
  };
}

export function normalizeHomeLayout(raw: unknown): HomeLayout {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_HOME_LAYOUT);
  const data = raw as Partial<HomeLayout>;

  const pins = Array.isArray(data.pins)
    ? data.pins.filter((id): id is string => typeof id === "string")
    : [...DEFAULT_HOME_PINS];

  let widgets: HomeWidget[] = [];
  if (Array.isArray(data.widgets)) {
    const seen = new Set<HomeWidgetType>();
    for (const item of data.widgets) {
      if (!item || typeof item !== "object") continue;
      const w = item as Partial<HomeWidget>;
      if (typeof w.type !== "string" || !VALID_TYPES.has(w.type as HomeWidgetType)) continue;
      const type = w.type as HomeWidgetType;
      const catalog = WIDGET_CATALOG.find((c) => c.type === type);
      if (catalog?.unique && seen.has(type)) continue;
      seen.add(type);
      const size =
        typeof w.size === "string" && VALID_SIZES.has(w.size as HomeWidgetSize)
          ? (w.size as HomeWidgetSize)
          : catalog?.defaultSize ?? "md";
      widgets.push({
        id: typeof w.id === "string" && w.id ? w.id : newWidgetId(type),
        type,
        size,
      });
    }
  }

  if (widgets.length === 0) {
    widgets = structuredClone(DEFAULT_HOME_LAYOUT.widgets);
  }

  return { pins, widgets };
}

export function cycleWidgetSize(size: HomeWidgetSize): HomeWidgetSize {
  if (size === "sm") return "md";
  if (size === "md") return "lg";
  return "sm";
}

export function canAddWidget(layout: HomeLayout, type: HomeWidgetType): boolean {
  const catalog = WIDGET_CATALOG.find((w) => w.type === type);
  if (!catalog) return false;
  if (catalog.unique && layout.widgets.some((w) => w.type === type)) return false;
  return true;
}

export function addWidgetToLayout(layout: HomeLayout, type: HomeWidgetType): HomeLayout {
  if (!canAddWidget(layout, type)) return layout;
  return {
    ...layout,
    widgets: [...layout.widgets, createWidget(type)],
  };
}

export function removeWidgetFromLayout(layout: HomeLayout, widgetId: string): HomeLayout {
  return {
    ...layout,
    widgets: layout.widgets.filter((w) => w.id !== widgetId),
  };
}

export function reorderWidgets(layout: HomeLayout, fromIndex: number, toIndex: number): HomeLayout {
  if (fromIndex === toIndex) return layout;
  if (fromIndex < 0 || toIndex < 0) return layout;
  if (fromIndex >= layout.widgets.length || toIndex >= layout.widgets.length) return layout;
  const widgets = [...layout.widgets];
  const [moved] = widgets.splice(fromIndex, 1);
  if (!moved) return layout;
  widgets.splice(toIndex, 0, moved);
  return { ...layout, widgets };
}

export function updateWidgetSize(
  layout: HomeLayout,
  widgetId: string,
  size: HomeWidgetSize
): HomeLayout {
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

export function widgetSpanClass(size: HomeWidgetSize): string {
  if (size === "sm") return "col-span-1";
  if (size === "md") return "col-span-2";
  return "col-span-2 sm:col-span-4";
}
