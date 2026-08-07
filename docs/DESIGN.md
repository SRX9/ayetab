# AyeTab — iOS 26 / macOS liquid-glass design system

This document defines the shared visual language for **web app**, **browser extension**, and **landing site** so all three feel like one product built on Apple's liquid-glass materials.

## North star

The app should feel like **your own new tab** — a calm, whitish, physical surface. Chrome and controls are glass; content stays readable. Brand blue (`#007AFF`) is reserved for meaning: active tabs, primary actions, focus.

**Materials over decoration.** Depth comes from translucency, specular edges, and tint over the wallpaper — never drop shadows.

### Wallpaper
The backdrop is a real layer (`WallpaperLayer`), like macOS. The default start is **Sequoia** — a soft photographic mist-hills wallpaper at `/wallpapers/macos-mist.jpg`. Settings also offers abstract presets (Mist, Blue Hills, Sonoma, Tahoe, Graphite, Dune) or your own image. Glass sits over it and refracts the color underneath; images get a soft cool veil for legibility.

---

## Foundations

### Light theme (primary)
| Token | Value | Use |
|---|---|---|
| `--shell` | `#fbfcfe` → `#f4f6f9` | Fallback wash — real backdrop is the wallpaper layer |
| Wallpaper | abstract preset / custom image | Rich backdrop the glass reads through |
| `--glass-fill` | white 72% → 38% | Default glass material (tinted by wallpaper) |
| `--glass-fill-strong` | white 88% → 70% | Floating sheets (dock, menus) |
| `--glass-border` | `rgba(255,255,255,.9)` | Specular edge — bright, not dark |
| Separation | tint + specular + faint cool outer ring | **No drop shadows** — iOS 26 reads depth through translucency |
| `--brand` | `#007AFF` | Active / primary only |
| Text | ink `#0c1420` / secondary `#45525f` / tertiary `#7d8894` | High contrast over glass |

### Radii (continuous-corner feel)
- `xs 6 · sm 10 · md 14 · lg 18 · xl 24 · 2xl 32 · full 9999`
- Cards/sheets use `xl/2xl`; controls `sm/md`; dock `2xl`.

### Motion (physical, interruptible)
- Press feedback: `scale(.97)` on `:active`, 100ms ease-out — instant on pointer-down.
- Springs for anything gesture-driven; CSS transitions only for non-gesture state.
- Durations: `fast 150ms / normal 250ms`; easing `cubic-bezier(.16,1,.3,1)`.
- Dock hover magnification + widget drag feel live in the widget layer (JS), with `prefers-reduced-motion` fallback.

---

## Primitives (CSS classes)

| Class | Material | Use |
|---|---|---|
| `.app-shell` | near-white atmosphere + faint grain | Root surface |
| `.glass` | refractive fill + specular + soft shadow | Generic glass sheet |
| `.glass-strong` | higher-opacity fill | Menus, dock, modals |
| `.panel` | glass sheet, `xl` radius | Content cards / panes |
| `.field` | inset well | Inputs, textareas, code panes |
| `.dock` | pill glass, strong blur, specular top | Bottom launcher |
| `.widget` | glass card, `2xl`, draggable | Personal-tab widgets |
| `.chip` | small glass pill | Filters, badges |
| `.btn-*` | system button styles | primary / secondary / ghost / danger |
| `.nav-active` | luminous blue fill | Active tool/tab |
| `.ds-scroll` | 4px thumb, visible only while scrolling | All scroll panes |

**Scroll edge effects, not hard dividers** — sticky chrome blurs content under it.

---

## Components

### Buttons
- **Primary**: blue gradient `180deg #3d9bff→#007aff→#0066d6`, specular inset + blue glow; hover brightens.
- **Secondary**: glass chip, subtle fill; hover raises opacity.
- **Ghost**: transparent, hover = soft white fill.
- All: `radius-md`, `scale(.97)` active, `disabled:opacity-45`.

### Fields
- Inset wells: soft inner shadow, faint cool border, white 60–70% fill.
- Focus: blue ring `0 0 0 3px accent-soft`, border → accent.

### Panels / content
- Floating glass sheets, `xl/2xl` radius, specular top edge, ambient shadow.
- High enough opacity for text/code to stay crisp.

### Dock (bottom launcher)
- Centered pill, strong blur + specular.
- Favorites first, then most-used tools, then "All tools".
- Active tool: luminous blue indicator.
- Hover: slight scale/magnification (JS spring), reduced-motion fallback.

### Widgets (personal tab surface)
- Glass cards on a loose grid; each hosts a **live tool surface** (not just an icon).
- Drag anywhere on the card header to reorder; persists to preferences.
- Optional live widgets: clock / quick-note.
- Minimal chrome: icon + name, favorite, remove.

---

## Surfaces

### Web app (`apps/web`)
- **No sidebar.** Home is the personal tab: greeting, search, widget grid of live tool surfaces + optional live widgets, dock at bottom.
- Tool pages open as content sheets over the same atmosphere; dock persists for switching.
- Command palette (`⌘K`) is the power path.

### Extension
- **New tab** = same personal tab as web (shared widget/dock components).
- **Side panel** = compact single-pane with the same glass materials; dock collapses to a compact bottom bar.

### Landing (`apps/landing`)
- Same whitish atmosphere + glass materials.
- Hero framed as the personal tab (dock + widgets) so the brand story matches the product.

---

## Accessibility
- `prefers-reduced-motion`: replace springs/scale with short opacity fades.
- `prefers-reduced-transparency`: solid fills, no blur.
- Focus always visible (accent ring).
- Drag is keyboard-reorderable (arrow keys in edit mode).

---

## Do / Don't
- **Do** keep the backdrop rich (wallpaper) and the glass tinted by it.
- **Do** separate surfaces with tint, specular edges, and faint rings — not shadows.
- **Do** put blue only where it means something.
- **Do** make every control physical: press, drag, snap.
- **Don't** add drop shadows — iOS 26 glass doesn't use them.
- **Don't** stack light glass on light glass.
- **Don't** add borders, gradients, or glow that doesn't serve hierarchy.
- **Don't** hide core navigation behind minimalism — dock + search stay one gesture away.
