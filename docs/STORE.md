# Store Listing & Release Guide

## Build store packages

```bash
pnpm install
pnpm --filter extension zip
```

Artifacts:

| Browser | Unpacked build | Upload ZIP |
|---------|----------------|------------|
| Chrome | `apps/extension/dist/chrome/` | `apps/extension/dist/ayetab-chrome-v1.0.0.zip` |
| Firefox | `apps/extension/dist/firefox/` | `apps/extension/dist/ayetab-firefox-v1.0.0.zip` |

Each ZIP has `manifest.json` at the **root** (required by both stores).

```bash
# Load unpacked for manual QA
# Chrome:  chrome://extensions → Load unpacked → apps/extension/dist/chrome
# Firefox: about:debugging → This Firefox → Load Temporary Add-on →
#          apps/extension/dist/firefox/manifest.json

pnpm --filter extension lint:firefox   # manifest + CSP scan
```

## Versioning

Bump **all three** together before a store submission:

1. `apps/extension/src/manifest.chrome.json` → `version`
2. `apps/extension/src/manifest.firefox.json` → `version`
3. `apps/extension/package.json` → `version`

Then update the zip filename in `scripts/pack.mjs` (or pack and rename). Follow semver.

## Chrome Web Store

1. Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Upload `ayetab-chrome-v*.zip`.
3. Privacy practices: **no remote data collection**; justify `sidePanel` + `storage` (see below).
4. Link this privacy policy: `docs/PRIVACY.md` (host a public URL for the listing).
5. Single purpose: developer utilities in a sidebar.

### Listing copy

**Name:** AyeTab — Developer Utilities

**Short description:** All-in-one offline developer toolbox in your browser sidebar.

**Detailed description:**

AyeTab brings developer utilities into a persistent browser sidebar — format JSON, debug JWTs, convert YAML, generate hashes, diff text, and more. Inspired by DevUtils, free and cross-platform.

- Works offline — your data stays on your device
- 49 tools in the extension (formatters, converters, generators, debuggers, productivity)
- Command palette (⌘K / Ctrl+K) for instant search
- Favorites and recent tools
- Smart paste detection suggests the right tool
- Dark and light themes

**Category:** Developer Tools

### Screenshots / assets

| Asset | Size |
|-------|------|
| Screenshots | 1280×800 or 640×400 |
| Small promo tile | 440×280 |
| Marquee (optional) | 1400×560 |
| Store icon | 128×128 (from `public/icons/icon-128.png`) |

Suggested shots: home tool list, JSON formatter, JWT debugger, command palette, dark mode.

### Permission justification

| Permission | Reason |
|------------|--------|
| `sidePanel` | Display the utility sidebar (Chrome 114+) |
| `storage` | Save favorites, recents, and theme via `chrome.storage.local` |

No host permissions, `activeTab`, or clipboard permissions.

## Firefox Add-ons (AMO)

1. Build & pack the Firefox zip (above).
2. Submit at [addons.mozilla.org](https://addons.mozilla.org/developers/).
3. Declare **no data collection** (`gecko.data_collection_permissions.required: ["none"]` is already in the Firefox manifest).
4. Upload **source code** for review (this monorepo) and document the reproducible build:

```bash
pnpm install --frozen-lockfile
pnpm --filter extension build:firefox
# Reviewers compare apps/extension/dist/firefox with the uploaded XPI/ZIP
```

5. Gecko ID `ayetab@srx9.dev` must remain stable after first publication.

Firefox notes:

- Uses `sidebar_action` (not Chrome `sidePanel`)
- Minimum Firefox **121** (Manifest V3 service worker support)
- Toolbar button toggles the sidebar via the background script

## Privacy wording (stores)

Use language aligned with `docs/PRIVACY.md`:

> AyeTab does not collect or transmit your tool input. Processing runs locally in your browser. Preferences and drafts are stored only on your device and can be cleared by removing the extension or clearing site/extension storage.

Do **not** claim “no data is stored” — favorites and drafts are stored locally.

## Extension vs web

| Feature | Extension | Web |
|---------|-----------|-----|
| Core utilities | ✅ | ✅ |
| Draw & Write (Excalidraw) | ❌ (CSP / AMO) | ✅ |
| Home wallpaper / bento home | ❌ | ✅ |
| Side panel / sidebar | ✅ | n/a |

## Pre-submit checklist

- [ ] `pnpm test`
- [ ] `pnpm --filter extension type-check`
- [ ] `pnpm --filter extension zip`
- [ ] `pnpm --filter extension lint:firefox`
- [ ] Manual Chrome load of `dist/chrome`
- [ ] Manual Firefox temporary load of `dist/firefox`
- [ ] Version bumped in both manifests + package.json
- [ ] Privacy policy URL live
- [ ] Screenshots + 440×280 promo tile ready
