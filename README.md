# AyeTab

All-in-one developer toolbox — a Chrome extension side panel + Next.js web app, inspired by [DevUtils](https://devutils.com).

## What's inside

| App / Package | Description |
|---------------|-------------|
| `apps/web` | Next.js 15 web app with full tool grid and individual tool pages |
| `apps/extension` | Chrome MV3 extension with React side panel (Chrome 114+) |
| `packages/utils` | Pure utility functions (JSON, Base64, JWT, hash, etc.) |
| `packages/ui` | Shared React components (ToolShell, InputPanel, SearchBar, etc.) |
| `docs/` | DevUtils analysis, architecture, utilities catalog, roadmap |

## Quick start

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Start individually
pnpm dev --filter web         # http://localhost:3000
pnpm dev --filter extension   # Vite dev server + HMR
```

## Load the Chrome extension

1. Build the extension: `pnpm build --filter extension`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `apps/extension/dist`

Click the extension icon to open the side panel on any page.

## Available tools (P0 — MVP)

12 tools implemented and working:

- JSON Formatter
- Base64 Encode/Decode
- URL Encode/Decode
- Hash Generator (SHA-1, SHA-256, SHA-512)
- UUID Generator
- Unix Time Converter
- JWT Debugger
- RegExp Tester
- Color Converter
- Number Base Converter
- String Case Converter
- Line Sort/Dedupe

27 more tools are registered in the catalog and ready for Phase 1–3 implementation. See `docs/utilities-catalog.md`.

## Architecture

```
User Input → @ayetab/ui components → @ayetab/utils (pure functions) → Output
```

All processing runs **client-side**. No data leaves the browser.

## Documentation

- [DevUtils Analysis](docs/devutils-analysis.md)
- [Utilities Catalog](docs/utilities-catalog.md)
- [Architecture](docs/architecture.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)

## Tech stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js 15 (App Router) + Tailwind CSS
- **Extension:** Vite + React + @crxjs/vite-plugin + Chrome Side Panel API
- **Shared:** TypeScript (strict), shared UI + utils packages
