# Implementation Roadmap

Phased plan to go from scaffold to full DevUtils parity.

## Phase 0: Scaffold (Current)

- [x] Turborepo monorepo with pnpm workspaces
- [x] Shared packages: `tsconfig`, `utils`, `ui`
- [x] Next.js web app with home page and tool routing
- [x] Chrome extension with Side Panel + React
- [x] Tool registry with metadata for all 47+ tools
- [x] P0 utility implementations in `@ayetab/utils`
- [x] Documentation

## Phase 1: MVP Tools (P0 — 12 tools)

Ship the 12 highest-value, simplest tools:

| # | Tool | Package | Status |
|---|------|---------|--------|
| 1 | JSON Formatter | `utils/tools/json` | Scaffold |
| 2 | Base64 Encode/Decode | `utils/tools/base64` | Scaffold |
| 3 | URL Encode/Decode | `utils/tools/url-encode` | Scaffold |
| 4 | Hash Generator | `utils/tools/hash` | Scaffold |
| 5 | UUID Generator | `utils/tools/uuid` | Scaffold |
| 6 | Unix Time Converter | `utils/tools/unix-time` | Scaffold |
| 7 | JWT Debugger | `utils/tools/jwt` | Scaffold |
| 8 | RegExp Tester | `utils/tools/regex` | Scaffold |
| 9 | Color Converter | `utils/tools/color` | Scaffold |
| 10 | Number Base Converter | `utils/tools/number-base` | Scaffold |
| 11 | String Case Converter | `utils/tools/case` | Scaffold |
| 12 | Line Sort/Dedupe | `utils/tools/line-sort` | Scaffold |

### Phase 1 UI Features

- [ ] Tool grid on home page with category filters
- [ ] Individual tool pages with input/output panels
- [ ] Copy-to-clipboard on output
- [ ] Command palette search (`⌘K`)
- [ ] Dark/light theme toggle
- [ ] Smart paste detection (suggest tool from clipboard)
- [ ] Extension side panel with same tool set

## Phase 2: Core Tools (P1 — 15 tools)

| Tool | Library Needed |
|------|---------------|
| HTML/CSS/JS Formatter | `js-beautify` |
| SQL Formatter | `sql-formatter` |
| YAML ↔ JSON | `yaml` |
| JSON ↔ CSV | `papaparse` |
| Text Diff | `diff` (jsdiff) |
| Markdown Preview | `marked` |
| Cron Parser | `cronstrue`, `cron-parser` |
| String Inspector | Custom |
| Lorem Ipsum | `lorem-ipsum` |
| Random String | `crypto.getRandomValues` |
| HTML Entity Encode/Decode | `he` |
| URL Parser | Native `URL` API |

### Phase 2 UI Features

- [ ] Favorites system
- [ ] Recent tools history
- [ ] Syntax highlighting in output (Shiki)
- [ ] Side-by-side diff view
- [ ] File upload for input

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
