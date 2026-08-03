# AyeTab — Documentation

A browser extension (new tab page + side panel) and web companion for everyday developer utilities,
inspired by [DevUtils](https://devutils.com).

## Documents

| Document | Description |
|----------|-------------|
| [DevUtils Analysis](./devutils-analysis.md) | Competitive analysis of DevUtils.com — features, UX patterns, and differentiators |
| [Utilities Catalog](./utilities-catalog.md) | Full catalog of 47+ utilities with categories, inputs/outputs, and priority tiers |
| [Architecture](./architecture.md) | Monorepo structure, Chrome extension design, and shared package strategy |
| [Implementation Roadmap](./implementation-roadmap.md) | Phased build plan from scaffold to full utility suite |
| [Privacy Policy](./PRIVACY.md) | Offline-first privacy policy (live at ayetab.dev/privacy) |
| [Terms of Use](./TERMS.md) | Terms of use (live at ayetab.dev/terms) |
| [Design System](./DESIGN.md) | Glass chrome + flat content tokens (matches the tab logo) |
| [Store Listing Guide](./STORE.md) | Chrome / Firefox store listing checklist |

## Project Vision

Build a **privacy-first, offline-capable** developer toolbox that:

- Replaces the **new tab page** with the full tool list beside the tool you picked
- Lives in a **side panel** for use without leaving the page you're on
- Mirrors the utility breadth of DevUtils (formatters, converters, generators, debuggers)
- Shares core logic between the **extension** and a **Next.js web app**
- Never sends user data to external servers — all processing runs locally in the browser

The two extension surfaces serve different jobs: the new tab is a destination you open dozens of
times a day; the side panel is a companion for in-context work. Both render the same
`@ayetab/ui` components against the same `chrome.storage.local` preferences.

## Monorepo Layout

```
ayetab/
├── apps/
│   ├── web/          # Next.js web app (full utility suite in browser)
│   ├── landing/      # Astro marketing site
│   └── extension/    # MV3 extension — new tab override + side panel
│       └── src/
│           ├── newtab/     # New tab page: hash-routed home / library / tool
│           ├── sidepanel/  # Side panel: state-driven navigation
│           └── lib/        # Shared across both surfaces
├── packages/
│   ├── utils/        # Pure utility functions (base64, json, hash, etc.)
│   ├── ui/           # Shared React components (tool shells, inputs, outputs)
│   └── tsconfig/     # Shared TypeScript configurations
└── docs/             # This folder
```

## Quick Start

```bash
pnpm install
pnpm dev          # Start all apps in dev mode
pnpm dev --filter web        # Next.js only
pnpm dev --filter extension  # Chrome extension only
```
