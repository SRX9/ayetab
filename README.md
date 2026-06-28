# AyeTab

All-in-one developer toolbox — a Chrome/Firefox extension side panel + Next.js web app, inspired by [DevUtils](https://devutils.com).

**43 tools** — all processing runs locally in your browser. Your data never leaves your device.

## Quick start

```bash
pnpm install
pnpm dev                    # all apps
pnpm dev --filter web       # http://localhost:3000
pnpm dev --filter extension # Vite + HMR
pnpm test                   # unit tests
pnpm test:e2e               # Playwright E2E (web app)
pnpm build                  # production build
```

### Load the extension

```bash
pnpm build --filter extension
```

Chrome: `chrome://extensions` → Load unpacked → `apps/extension/dist`  
Firefox: `about:debugging` → Load Temporary Add-on → `apps/extension/dist/manifest.json`

## Tool categories (43 tools)

| Category | Tools |
|----------|-------|
| **Format** | JSON, HTML, CSS, JS, XML, SQL, ERB, LESS, SCSS, Line Sort |
| **Encode** | Base64, Base64 Image, URL, HTML Entity, Backslash Escape |
| **Convert** | YAML↔JSON, JSON↔CSV, HTML→JSX, SVG→CSS, Case, Color, Hex↔ASCII, Number Base, URL Parser, Query String, PHP Serialize, cURL→Code, JSON→Code |
| **Inspect** | JWT, Unix Time, RegExp, String Inspector, Text Diff, Markdown, HTML Preview, Cron, Certificate |
| **Generate** | Hash (MD5/SHA/Keccak), UUID, ULID, Random String, Lorem Ipsum, QR Code |

## Features

- **Command palette** — `⌘K` / `Ctrl+K` fuzzy search
- **Favorites & recents** — star tools, quick-access history
- **Smart paste** — auto-detect JWT, JSON, Base64, URLs
- **Dark/light theme** — persisted locally
- **Export/import** — backup favorites as JSON
- **Onboarding** — first-visit welcome tour
- **Keyboard shortcuts** — press `?` to view
- **Rich outputs** — syntax highlighting, diff view, markdown/HTML/image previews
- **File upload** — load input from files
- **Firefox support** — `sidebar_action` in manifest

## Monorepo

```
apps/web          → Next.js 15
apps/extension    → Chrome MV3 + Firefox sidebar
packages/utils    → executeTool() + 41 tool implementations
packages/ui       → Shared React components
docs/             → Analysis, architecture, store listing guide
```

## Documentation

- [DevUtils Analysis](docs/devutils-analysis.md)
- [Utilities Catalog](docs/utilities-catalog.md)
- [Architecture](docs/architecture.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [Store Listing Guide](docs/STORE.md)
