# Implementation Roadmap

## Phase 0: Scaffold ✅

## Phase 1: MVP Tools ✅

12 P0 tools + command palette, theme, smart paste, shared runner

## Phase 2: Core Tools ✅

HTML/CSS/JS/SQL formatters, YAML↔JSON, JSON↔CSV, Text Diff, Markdown, Cron, Lorem Ipsum + favorites, recents, syntax highlighting, diff view, file upload

## Phase 3: Extended Tools ✅

| Tool | Status |
|------|--------|
| XML Formatter | ✅ |
| HTML → JSX | ✅ |
| HTML Preview | ✅ |
| QR Code Generator | ✅ |
| Backslash Escape | ✅ |
| Certificate Decoder | ✅ |
| SVG → CSS | ✅ |
| Base64 Image | ✅ |

## Phase 4: Advanced Tools ✅

| Tool | Status |
|------|--------|
| cURL → Code (fetch/Python) | ✅ |
| JSON → Code (TypeScript/Go) | ✅ |
| PHP Serialize/Unserialize | ✅ |
| ERB/LESS/SCSS Formatters | ✅ |
| ULID Generator/Decoder | ✅ |
| Query String ↔ JSON | ✅ |
| MD5 + Keccak-256 hashes | ✅ |

## Phase 5: Polish & Launch ✅

- [x] Chrome Web Store listing guide (`docs/STORE.md`)
- [x] Privacy policy (`docs/PRIVACY.md`)
- [x] Firefox extension support (`sidebar_action` + `browser_specific_settings`)
- [x] Separate Chrome / Firefox production builds + zip packaging
- [x] Extension omits CSP-unsafe Draw & Write (Excalidraw) tool
- [x] Keyboard shortcuts modal (`?`)
- [x] Export/import favorites (JSON)
- [x] Onboarding tour (first-visit modal)
- [x] Vitest unit tests for core utilities
- [x] Dynamic imports in executor for code splitting
- [x] Image preview output for QR / Base64 image tools
- [x] Accessibility: dialog roles on modals

### Remaining (manual / post-launch)

- [ ] Submit to Chrome Web Store (`pnpm --filter extension zip`)
- [ ] Submit to Firefox Add-ons
- [ ] Host public privacy policy URL from `docs/PRIVACY.md`
- [ ] E2E tests (Playwright) for extension side panel
- [ ] Lighthouse performance audit
- [ ] WCAG 2.1 AA formal audit

## Tool count: 41 implemented

All tools in the registry are fully implemented via `executeTool()`.
