# DevUtils Sidebar — Documentation

A Chrome extension + web companion for everyday developer utilities, inspired by [DevUtils](https://devutils.com).

## Documents

| Document | Description |
|----------|-------------|
| [DevUtils Analysis](./devutils-analysis.md) | Competitive analysis of DevUtils.com — features, UX patterns, and differentiators |
| [Utilities Catalog](./utilities-catalog.md) | Full catalog of 47+ utilities with categories, inputs/outputs, and priority tiers |
| [Architecture](./architecture.md) | Monorepo structure, Chrome extension design, and shared package strategy |
| [Implementation Roadmap](./implementation-roadmap.md) | Phased build plan from scaffold to full utility suite |

## Project Vision

Build a **privacy-first, offline-capable** developer toolbox that:

- Lives in a **Chrome Side Panel** accessible on every page
- Mirrors the utility breadth of DevUtils (formatters, converters, generators, debuggers)
- Shares core logic between the **extension** and a **Next.js web app**
- Never sends user data to external servers — all processing runs locally in the browser

## Monorepo Layout

```
ayetab/
├── apps/
│   ├── web/          # Next.js web app (full utility suite in browser)
│   └── extension/    # Chrome MV3 extension with React side panel
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
