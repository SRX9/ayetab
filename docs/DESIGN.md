# AyeTab design system

Shared visual language for the web app and extension (`packages/ui/src/styles/design-system.css`). Matches the liquid-glass brand mark and the marketing site (`apps/landing`).

## Principle

**Liquid glass throughout — readable sheets, not flat paper.**

| Layer | Material | Why |
|-------|----------|-----|
| Shell atmosphere | Caustic sky gradients + grain | Same backdrop language as the logo |
| Sidebar / top bar / menus | Thick refractive glass, specular edge | Hierarchy that feels like the mark |
| Content pane / panels | High-opacity floating glass | Soft depth without muddy text |
| Fields | Inset glass wells | Controls sit *in* the material |
| Primary actions | Luminous system-blue gradient | Logo tab + landing CTA |

## Palette

| Token | Role | Light |
|-------|------|-------|
| `--brand` / `--selection` | System blue (logo tab) | `#007AFF` |
| `--shell` | Near-white mist | whitish with a whisper of cool |
| `--background` / `--card` | Soft paper under glass | near-white |
| `--foreground` | Cool ink | deep navy |
| Glass borders | Specular white | white / soft gray |

## Materials

- `.app-shell` — near-white atmosphere with a whisper of cool blue
- `.app-sidebar` / `.app-topbar` / `.menu-surface` — refractive white glass, specular sheen
- `.content-pane` / `.panel` — high-opacity floating glass sheets
- `.field` — inset wells with focus glow
- `.nav-active` — luminous blue fill + rail
- `.btn-liquid-primary` — gradient + blue glow (landing CTA)
- `.ds-scroll` / `.fade-scroller` — 4px thumb, invisible until scrolling
- `prefers-reduced-transparency` — solid fills, no blur

## Type

Instrument Sans (UI + titles) · JetBrains Mono (code). Display sizes use tighter tracking.

## Do / don’t

- Do keep refractive gradients and specular top edges on chrome
- Do keep primary actions on luminous system blue
- Do keep tool content highly opaque so monospace stays readable
- Don’t flatten glass into cool-gray frost
- Don’t use purple gradients or heavy multi-layer drop shadows
- Don’t round everything into pills — soft squircles (8–14px) only
