# Implementation Roadmap

Phased plan to go from scaffold to full DevUtils parity.

## Phase 0: Scaffold ✅

- [x] Turborepo monorepo with pnpm workspaces
- [x] Shared packages: `tsconfig`, `utils`, `ui`
- [x] Next.js web app with home page and tool routing
- [x] Chrome extension with Side Panel + React
- [x] Tool registry with metadata for all 47+ tools
- [x] P0 utility implementations in `@ayetab/utils`
- [x] Documentation

## Phase 1: MVP Tools (P0 — 12 tools) ✅

All 12 P0 tools implemented via centralized `executeTool()` executor.

### Phase 1 UI Features ✅

- [x] Tool grid on home page with category filters
- [x] Individual tool pages with input/output panels
- [x] Copy-to-clipboard on output
- [x] Command palette search (`⌘K`)
- [x] Dark/light theme toggle
- [x] Smart paste detection (suggest tool from clipboard)
- [x] Extension side panel with same tool set

### Phase 1 Bonus Tools (simple P1)

- [x] URL Parser
- [x] Hex ↔ ASCII
- [x] String Inspector
- [x] Random String Generator
- [x] HTML Entity Encode/Decode

## Phase 2: Core Tools (P1) ✅

| Tool | Status |
|------|--------|
| HTML/CSS/JS Formatter | ✅ |
| SQL Formatter | ✅ |
| YAML ↔ JSON | ✅ |
| JSON ↔ CSV | ✅ |
| Text Diff | ✅ |
| Markdown Preview | ✅ |
| Cron Parser | ✅ |
| Lorem Ipsum | ✅ |
| String Inspector | ✅ (Phase 1) |
| Random String | ✅ (Phase 1) |
| HTML Entity | ✅ (Phase 1) |
| URL Parser | ✅ (Phase 1) |

### Phase 2 UI Features ✅

- [x] Favorites system (localStorage / chrome.storage)
- [x] Recent tools history
- [x] Syntax highlighting in output (JSON, SQL)
- [x] Side-by-side diff view
- [x] File upload for input
- [x] Markdown HTML preview

## Phase 3: Extended Tools (P2 — 12 tools)

| Tool | Notes |
|------|-------|
| XML Formatter | `js-beautify` |
| HTML → JSX | `htmltojsx` |
| HTML Preview | Sandboxed iframe |
| QR Code Generator | `qrcode` |
| Backslash Escape | JSON trick |
| Certificate Decoder | `@peculiar/x509` |
| Hex ↔ ASCII | Pure |
| SVG → CSS | Custom |
| Base64 Image | Canvas API |

## Phase 4: Advanced Tools (P3 — 10+ tools)

| Tool | Notes |
|------|-------|
| cURL → Code | `curlconverter` |
| JSON → Code | Custom templates |
| PHP Serializer | Custom |
| ERB/LESS/SCSS Formatters | `js-beautify` |
| ULID Generate/Decode | `ulid` |
| Keccak-256 | `js-sha3` |

## Phase 5: Polish & Launch

- [ ] Chrome Web Store listing
- [ ] Firefox extension (sidebar_action API)
- [ ] Keyboard shortcut customization
- [ ] Export/import favorites
- [ ] Onboarding tour
- [ ] Performance audit (all tools < 50ms)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] E2E tests (Playwright for web, manual for extension)

## Success Metrics

| Metric | Target |
|--------|--------|
| P0 tools working | 12/12 |
| Extension load time | < 500ms |
| Tool execution time | < 50ms (P0 tools) |
| Bundle size (extension) | < 2MB |
| Lighthouse (web) | > 95 performance |
