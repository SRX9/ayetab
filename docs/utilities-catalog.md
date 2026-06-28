# Utilities Catalog

Complete specification for all developer utilities, organized by category and implementation priority.

## Priority Tiers

| Tier | Label | Criteria | Count |
|------|-------|----------|-------|
| **P0** | MVP | High-frequency, simple to implement, no external deps | 12 |
| **P1** | Core | Commonly used, moderate complexity | 15 |
| **P2** | Extended | Specialized or requires heavy libraries | 12 |
| **P3** | Advanced | Complex parsers, code generators | 10+ |

---

## Category 1: Format, Validate, Minify

### JSON Formatter `json-formatter` — P0

| Field | Value |
|-------|-------|
| **ID** | `json-formatter` |
| **Input** | Raw JSON string |
| **Output** | Formatted/minified JSON with validation errors |
| **Actions** | Format, Minify, Validate, Copy |
| **Library** | Native `JSON.parse` / `JSON.stringify` |
| **Smart detect** | Starts with `{` or `[` |

### HTML Beautify/Minify `html-formatter` — P1

| Field | Value |
|-------|-------|
| **Input** | HTML string |
| **Output** | Formatted or minified HTML |
| **Library** | `js-beautify` |

### CSS Beautify/Minify `css-formatter` — P1

| Field | Value |
|-------|-------|
| **Input** | CSS string |
| **Output** | Formatted or minified CSS |
| **Library** | `js-beautify` |

### JS Beautify/Minify `js-formatter` — P1

| Field | Value |
|-------|-------|
| **Input** | JavaScript string |
| **Output** | Formatted or minified JS |
| **Library** | `js-beautify` / `terser` (minify) |

### XML Beautify/Minify `xml-formatter` — P2

| Field | Value |
|-------|-------|
| **Library** | `js-beautify` |

### SQL Formatter `sql-formatter` — P1

| Field | Value |
|-------|-------|
| **Input** | SQL query string |
| **Output** | Formatted SQL with keyword casing |
| **Library** | `sql-formatter` |
| **Dialects** | PostgreSQL, MySQL, MariaDB, SQLite |

### Line Sort/Dedupe `line-sort` — P0

| Field | Value |
|-------|-------|
| **Input** | Multi-line text |
| **Output** | Sorted lines, optionally deduplicated |
| **Options** | Ascending, descending, case-sensitive, unique only |
| **Library** | Pure string manipulation |

---

## Category 2: Data Converter

### YAML ↔ JSON `yaml-json` — P1

| Field | Value |
|-------|-------|
| **Input** | YAML or JSON string |
| **Output** | Converted format |
| **Library** | `yaml` (js-yaml) |

### JSON ↔ CSV `json-csv` — P1

| Field | Value |
|-------|-------|
| **Input** | JSON array or CSV string |
| **Output** | Converted format |
| **Library** | Custom parser or `papaparse` |

### Number Base Converter `number-base` — P0

| Field | Value |
|-------|-------|
| **Input** | Number in any base (2, 8, 10, 16) |
| **Output** | Same number in all bases |
| **Library** | `parseInt` / `toString(radix)` |
| **Smart detect** | `0x` prefix → hex, `0b` → binary |

### String Case Converter `case-converter` — P0

| Field | Value |
|-------|-------|
| **Input** | Any string |
| **Output** | camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case |
| **Library** | Pure string manipulation |

### URL Parser `url-parser` — P0

| Field | Value |
|-------|-------|
| **Input** | URL string |
| **Output** | Parsed components (protocol, host, path, query, hash) |
| **Library** | `URL` API |

### HTML → JSX `html-jsx` — P2

| Field | Value |
|-------|-------|
| **Input** | HTML string |
| **Output** | React JSX |
| **Library** | `htmltojsx` |

### Hex ↔ ASCII `hex-ascii` — P0

| Field | Value |
|-------|-------|
| **Input** | Hex string or ASCII text |
| **Output** | Converted format |
| **Library** | Pure manipulation |

### cURL → Code `curl-code` — P3

| Field | Value |
|-------|-------|
| **Input** | cURL command |
| **Output** | Code in JS, Python, Go, etc. |
| **Library** | `curlconverter` |

---

## Category 3: Inspect, Preview, Debug

### Unix Time Converter `unix-time` — P0

| Field | Value |
|-------|-------|
| **Input** | Unix timestamp (seconds or ms) or date string |
| **Output** | All representations (ISO 8601, local, relative, unix s/ms) |
| **Library** | Native `Date` |
| **Smart detect** | 10-digit number → unix seconds, 13-digit → ms |

### JWT Debugger `jwt-debugger` — P0

| Field | Value |
|-------|-------|
| **Input** | JWT token string |
| **Output** | Decoded header, payload, signature; expiry warning |
| **Library** | Base64 decode (no verification in MVP) |
| **Smart detect** | Three dot-separated base64 segments |

### RegExp Tester `regex-tester` — P0

| Field | Value |
|-------|-------|
| **Input** | Regex pattern + test string + flags |
| **Output** | Match highlights, capture groups, match count |
| **Library** | Native `RegExp` |

### Text Diff Checker `text-diff` — P1

| Field | Value |
|-------|-------|
| **Input** | Two text blocks |
| **Output** | Unified or side-by-side diff |
| **Library** | `diff` (jsdiff) |

### String Inspector `string-inspector` — P1

| Field | Value |
|-------|-------|
| **Input** | Any string |
| **Output** | Length, byte size, character codes, encoding detection |
| **Library** | `TextEncoder`, custom analysis |

### Markdown Preview `markdown-preview` — P1

| Field | Value |
|-------|-------|
| **Input** | Markdown string |
| **Output** | Rendered HTML preview |
| **Library** | `marked` or `react-markdown` |

### Cron Job Parser `cron-parser` — P1

| Field | Value |
|-------|-------|
| **Input** | Cron expression (5 or 6 field) |
| **Output** | Human-readable schedule, next N run times |
| **Library** | `cronstrue` + `cron-parser` |

### Color Converter `color-converter` — P0

| Field | Value |
|-------|-------|
| **Input** | Color in HEX, RGB, HSL, HSV |
| **Output** | All format representations + preview swatch |
| **Library** | `colord` |

### HTML Preview `html-preview` — P2

| Field | Value |
|-------|-------|
| **Input** | HTML string |
| **Output** | Sandboxed iframe preview |
| **Library** | `srcdoc` iframe |

---

## Category 4: Generators

### UUID Generator `uuid-generator` — P0

| Field | Value |
|-------|-------|
| **Input** | Version (v4 default), count |
| **Output** | Generated UUID(s) |
| **Library** | `crypto.randomUUID()` or `uuid` package |

### Hash Generator `hash-generator` — P0

| Field | Value |
|-------|-------|
| **Input** | Text string |
| **Output** | MD5, SHA-1, SHA-256, SHA-512, Keccak-256 hashes |
| **Library** | Web Crypto API (`crypto.subtle.digest`) + `js-sha3` for Keccak |

### Lorem Ipsum Generator `lorem-ipsum` — P1

| Field | Value |
|-------|-------|
| **Input** | Paragraph count, word count |
| **Output** | Placeholder text |
| **Library** | `lorem-ipsum` |

### Random String Generator `random-string` — P1

| Field | Value |
|-------|-------|
| **Input** | Length, charset options |
| **Output** | Random string |
| **Library** | `crypto.getRandomValues` |

### QR Code Generator `qr-code` — P2

| Field | Value |
|-------|-------|
| **Input** | Text or URL |
| **Output** | QR code image (SVG/PNG) |
| **Library** | `qrcode` |

---

## Category 5: Encoder / Decoder

### Base64 Encode/Decode `base64` — P0

| Field | Value |
|-------|-------|
| **Input** | Plain text or Base64 string |
| **Output** | Encoded or decoded text |
| **Library** | `btoa` / `atob` with UTF-8 handling |
| **Smart detect** | Base64 pattern (alphanumeric + `+/=` padding) |

### URL Encode/Decode `url-encode` — P0

| Field | Value |
|-------|-------|
| **Input** | Plain or percent-encoded string |
| **Output** | Encoded or decoded text |
| **Library** | `encodeURIComponent` / `decodeURIComponent` |

### HTML Entity Encode/Decode `html-entity` — P1

| Field | Value |
|-------|-------|
| **Input** | Plain or entity-encoded HTML |
| **Output** | Encoded or decoded text |
| **Library** | DOM `textarea` trick or `he` library |

### Backslash Escape/Unescape `backslash-escape` — P2

| Field | Value |
|-------|-------|
| **Input** | Escaped or unescaped string |
| **Output** | Toggled escape state |
| **Library** | `JSON.stringify` / `JSON.parse` trick |

### Certificate Decoder `cert-decoder` — P2

| Field | Value |
|-------|-------|
| **Input** | PEM-encoded X.509 certificate |
| **Output** | Subject, issuer, validity, SANs, fingerprint |
| **Library** | `@peculiar/x509` or `node-forge` (browser build) |

---

## Smart Detection Rules

```typescript
type DetectedTool =
  | { tool: 'json-formatter'; confidence: 'high' }
  | { tool: 'base64'; confidence: 'medium' }
  | { tool: 'jwt-debugger'; confidence: 'high' }
  | { tool: 'unix-time'; confidence: 'high' }
  | { tool: null; confidence: null };

// Detection priority (first match wins):
// 1. JWT: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
// 2. JSON: /^[\s]*[{[]/
// 3. Unix timestamp: /^\d{10}$/ or /^\d{13}$/
// 4. Base64: /^[A-Za-z0-9+/]+=*$/ and length % 4 === 0
// 5. URL: /^https?:\/\//
// 6. Hex: /^[0-9a-fA-F\s]+$/
```

## Tool Metadata Schema

Every tool registers with this shape in the shared registry:

```typescript
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'format' | 'convert' | 'inspect' | 'generate' | 'encode';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  icon: string;          // Lucide icon name
  keywords: string[];    // For fuzzy search
  smartDetect?: RegExp;  // Optional auto-detection pattern
}
```
