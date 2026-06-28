# Architecture

## Monorepo Structure

```
ayetab/
├── apps/
│   ├── web/                    # Next.js 15 web application
│   │   ├── app/                # App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Home with tool grid
│   │   │   └── tools/[id]/     # Individual tool pages
│   │   ├── components/         # Web-specific components
│   │   └── package.json
│   │
│   └── extension/              # Chrome MV3 extension
│       ├── src/
│       │   ├── background/     # Service worker
│       │   ├── sidepanel/      # React side panel UI
│       │   ├── content/        # Content scripts (optional page interaction)
│       │   └── manifest.json
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── utils/                  # Pure utility functions
│   │   ├── src/
│   │   │   ├── tools/          # One file per tool (base64, json, jwt, etc.)
│   │   │   ├── registry.ts     # Tool metadata registry
│   │   │   ├── detector.ts     # Smart clipboard detection
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                     # Shared React components
│   │   ├── src/
│   │   │   ├── components/     # ToolShell, InputPanel, OutputPanel, SearchBar
│   │   │   ├── hooks/          # useClipboard, useToolState
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── tsconfig/               # Shared TS configs
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
│
├── docs/                       # Documentation
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml
└── package.json
```

## Chrome Extension Architecture

### Manifest V3 with Side Panel API

The extension uses Chrome's **Side Panel API** (Chrome 114+) — a persistent panel alongside the browser content, not an overlay injected into pages.

```
┌─────────────────────────────────────────────────────────┐
│  Browser Window                                         │
│  ┌──────────────────────────┐  ┌─────────────────────┐  │
│  │                          │  │  Side Panel         │  │
│  │   Web Page Content       │  │  ┌───────────────┐  │  │
│  │                          │  │  │ Search (⌘K)   │  │  │
│  │                          │  │  ├───────────────┤  │  │
│  │                          │  │  │ Tool Nav      │  │  │
│  │                          │  │  │ ├ Format      │  │  │
│  │                          │  │  │ ├ Convert     │  │  │
│  │                          │  │  │ ├ Inspect     │  │  │
│  │                          │  │  │ ├ Generate    │  │  │
│  │                          │  │  │ └ Encode      │  │  │
│  │                          │  │  ├───────────────┤  │  │
│  │                          │  │  │ Active Tool   │  │  │
│  │                          │  │  │ [Input]       │  │  │
│  │                          │  │  │ [Output]      │  │  │
│  │                          │  │  └───────────────┘  │  │
│  └──────────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Extension Components

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| **Service Worker** | TypeScript | Side panel behavior, tab events, message routing |
| **Side Panel** | React + Vite | Main UI — tool navigation and execution |
| **Content Script** | TypeScript | Optional: read page selection, inject helpers |
| **Build** | Vite + `@crxjs/vite-plugin` | HMR, manifest-as-source-of-truth |

### Message Flow

```
Side Panel ──sendMessage──▶ Service Worker ──sendMessage──▶ Content Script
     ▲                            │                              │
     └──────── response ──────────┘                              │
     │                                                           │
     └──────────── getSelectedText / pageContext ────────────────┘
```

### Permissions

```json
{
  "permissions": ["sidePanel", "storage", "clipboardRead", "activeTab"],
  "host_permissions": ["<all_urls>"]
}
```

## Web App Architecture

### Next.js App Router

- **Home page** (`/`): Tool grid with category filters and search
- **Tool pages** (`/tools/[id]`): Full-width tool interface
- **Shared layout**: Sidebar navigation, theme toggle, command palette

### Rendering Strategy

| Page | Strategy | Reason |
|------|----------|--------|
| Home, tool list | Static (SSG) | No dynamic data |
| Tool pages | Client components | All processing is client-side |
| Layout | Server component | SEO metadata, theme provider |

## Shared Packages

### `@ayetab/utils`

Pure functions with zero React/DOM dependencies. Each tool exports:

```typescript
// packages/utils/src/tools/base64.ts
export function encodeBase64(input: string): string { ... }
export function decodeBase64(input: string): string { ... }
```

### `@ayetab/ui`

React components consumed by both apps:

| Component | Purpose |
|-----------|---------|
| `ToolShell` | Layout wrapper: title, description, input/output panels |
| `InputPanel` | Textarea with paste, clear, file upload |
| `OutputPanel` | Read-only output with copy, download |
| `SearchBar` | Fuzzy search across tool registry |
| `CategoryNav` | Sidebar category navigation |
| `ThemeProvider` | Dark/light mode context |

### `@ayetab/tsconfig`

Shared TypeScript configurations extended by each package.

## Data Flow

```
User Input
    │
    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  UI Layer   │────▶│  @ayetab/ui  │────▶│ @ayetab/utils│
│ (web/ext)   │     │  components  │     │  pure funcs  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                                          Result (string)
                                                │
                                                ▼
                                          OutputPanel
```

**No data ever leaves the browser.** All utility functions operate on in-memory strings.

## State Management

| Concern | Extension | Web |
|---------|-----------|-----|
| Active tool | `chrome.storage.session` | URL path `/tools/[id]` |
| Favorites | `chrome.storage.local` | `localStorage` |
| Theme | `chrome.storage.local` | `localStorage` + `next-themes` |
| Recent tools | `chrome.storage.local` | `localStorage` |
| Tool input | React state (ephemeral) | React state (ephemeral) |

## Build & Dev

```bash
# Install
pnpm install

# Dev (all apps)
pnpm dev

# Dev (single app)
pnpm dev --filter web
pnpm dev --filter extension

# Build
pnpm build

# Load extension in Chrome
# 1. pnpm build --filter extension
# 2. chrome://extensions → Load unpacked → apps/extension/dist
```

## Tech Stack Summary

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | Turborepo + pnpm | Fast builds, shared deps |
| Web | Next.js 15 (App Router) | SSR for landing, client tools |
| Extension | Vite + React + CRXJS | HMR for extension dev |
| UI | Tailwind CSS + shadcn/ui | Consistent design system |
| Icons | Lucide React | Lightweight, comprehensive |
| Language | TypeScript (strict) | Type safety across packages |
| Testing | Vitest | Fast, works in all packages |
| Linting | ESLint + Prettier | Consistent code style |
