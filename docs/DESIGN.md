# AyeTab design system

Shared visual language for the web app and extension (`packages/ui/src/styles/design-system.css`). The marketing site (`apps/landing`) already speaks the same liquid-glass brand.

## Principle

**Glass chrome, flat content.**

| Layer | Material | Why |
|-------|----------|-----|
| Shell / sidebar / top bar / menus | Frosted glass (`backdrop-filter`) | Matches the tab logo; hierarchy without heavy borders |
| Tool panes, fields, panels | Opaque paper | Dense documents stay readable; blur over text fails |

## Palette

| Token | Role | Light |
|-------|------|-------|
| `--brand` / `--selection` | System blue (logo tab) | `#007AFF` |
| `--shell` / `--sidebar` | Sky mist behind chrome | cool blue-gray |
| `--background` / `--card` | Content paper | white |
| `--foreground` | Cool ink | `#1a2333`-ish |
| `--border` | Hairline | `#d7e3f0`-ish |

## Materials

- `.app-shell` — soft sky mist atmosphere
- `.app-sidebar` / `.app-topbar` / `.menu-surface` — frosted glass
- `.content-pane` / `.panel` / `.field` — opaque
- `prefers-reduced-transparency` — solid sidebar/menu fills

## Type

Instrument Sans (UI + titles) · JetBrains Mono (code). Display sizes use tighter tracking.

## Do / don’t

- Do frost structural chrome and floating menus
- Do keep primary actions on system blue with a light inset sheen
- Don’t glass input/output panes or long-form tool content
- Don’t stack translucent surfaces on translucent surfaces
