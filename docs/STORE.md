# Store Listing & Release Guide

## Build store packages

```bash
pnpm install
pnpm --filter extension zip
```

Artifacts:

| Browser | Unpacked build | Upload ZIP |
|---------|----------------|------------|
| Chrome | `apps/extension/dist/chrome/` | `apps/extension/dist/ayetab-chrome-v1.1.0.zip` |
| Firefox | `apps/extension/dist/firefox/` | `apps/extension/dist/ayetab-firefox-v1.1.0.zip` |

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

`scripts/pack.mjs` reads the version out of the built manifest, so the ZIP filename follows automatically. Follow semver.

---

## New tab override — read before submitting

Since **1.1.0** the extension declares `chrome_url_overrides.newtab`. Both stores treat replacing the
new tab as a flagged category, and an undisclosed override is a common reason for a listing to be
rejected or pulled. Cover all of the following in the submission:

- **Disclose it in the first line of the description**, not buried in a feature list. Both the short
  and detailed descriptions below lead with it.
- **Show it in the first screenshot.** Reviewers check that the listing images match what installing
  actually does.
- **Single purpose** stays "developer utilities". The new tab is the surface those utilities are
  presented on, not a second product — say it that way.
- **No new permissions.** `chrome_url_overrides` requires none; the extension still declares only
  `sidePanel` + `storage`. Say so explicitly, since reviewers expect override extensions to ask for
  more.
- **In-product notice.** A one-time dismissible banner on the new tab explains the takeover and how
  to undo it (`apps/extension/src/newtab/first-run-notice.tsx`). Mention it in reviewer notes.
- **Opting out** is not expressible in the manifest — users disable or remove the extension. Don't
  imply a settings toggle exists until one ships.

## Chrome Web Store

1. Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Upload `ayetab-chrome-v*.zip`.
3. Privacy practices: **no remote data collection**; justify `sidePanel` + `storage` (see below).
4. Link this privacy policy: https://ayetab.dev/privacy (source: `docs/PRIVACY.md`).
5. Single purpose: developer utilities, presented on the new tab page and in the side panel.
6. Answer the new tab override prompt with the disclosure text above.

### Listing copy

**Name:** AyeTab — Developer Utilities

**Short description:** Replaces your new tab with an offline developer toolbox — also in the sidebar.

**Detailed description:**

AyeTab replaces your browser's new tab page with a developer toolbox: every tool in a sidebar on
the left, the one you picked on the right. The same tools live in the side panel for use without
leaving the page you're on. Format JSON, debug JWTs,
convert YAML, generate hashes, diff text, and more. Inspired by DevUtils, free and cross-platform.

- **Replaces your new tab page** with a searchable list of every tool
- Side panel for using a tool alongside any page
- Works offline — your data stays on your device
- 99 tools in the extension (formatters, converters, generators, debuggers, productivity)
- Command palette (⌘K / Ctrl+K) for instant search
- Favorites and recent tools
- Smart paste detection suggests the right tool
- Dark and light themes

To restore your browser's default new tab page, disable or remove AyeTab from your extensions page.

**Category:** Developer Tools

### Screenshots / assets

| Asset | Size |
|-------|------|
| Screenshots | 1280×800 or 640×400 |
| Small promo tile | 440×280 |
| Marquee (optional) | 1400×560 |
| Store icon | 128×128 (from `public/icons/icon-128.png`) |

Suggested shots, in this order: **new tab home** (lead with it — reviewers match images against
behaviour), library, JSON formatter, side panel over a real page, command palette, dark mode.

### Permission justification

| Permission  | Reason |
|-------------|--------|
| `sidePanel` | Display the utility sidebar (Chrome 114+) |
| `storage`   | Save favorites, recents, home layout, and theme via `chrome.storage.local` |

No host permissions, `activeTab`, or clipboard permissions. `chrome_url_overrides.newtab` needs no
permission of its own.

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
- `chrome_url_overrides.newtab` is supported in Firefox MV3; AMO reviewers expect the new tab change
  to be stated in the listing description, not only in the screenshots
- Firefox keeps address-bar focus on a freshly opened new tab. The page deliberately does not
  autofocus anything, so typing goes to the URL bar as users expect — don't add an autofocus
  without re-testing this.
- Firefox for Android is out of scope; `chrome_url_overrides` support there has historically lagged

## Privacy wording (stores)

Use language aligned with `docs/PRIVACY.md`:

> AyeTab does not collect or transmit your tool input. Processing runs locally in your browser. Preferences and drafts are stored only on your device and can be cleared by removing the extension or clearing site/extension storage.

Do **not** claim “no data is stored” — favorites and drafts are stored locally.

## Extension vs web

| Feature | Extension | Web |
|---------|-----------|-----|
| Core utilities | ✅ | ✅ |
| Draw & Write (Excalidraw) | ❌ (CSP / AMO) — links out to the web app | ✅ |
| New tab page | ✅ | n/a |
| Side panel / sidebar | ✅ | n/a |

Draw & Write is the one tool the extension cannot run: `@excalidraw/excalidraw` uses `Function`/`eval`
constructs that MV3 CSP and AMO both reject, so the build aliases it to a stub. Rather than hide it,
the library and any deep link hand off to `https://app.ayetab.dev/tools/excalidraw`. **Marketing copy
must say 99 tools for the extension, 100 for the web app.**

## Pre-submit checklist

- [ ] `pnpm test`
- [ ] `pnpm --filter extension type-check`
- [ ] `pnpm --filter extension zip`
- [ ] `pnpm --filter extension lint:firefox`
- [ ] Manual Chrome load of `dist/chrome` — open a new tab, confirm it renders
- [ ] Manual Firefox temporary load of `dist/firefox` — same, plus confirm the URL bar keeps focus
- [ ] New tab: browser Back/Forward across the index → tool
- [ ] New tab: two tabs open, star a tool in one and open a tool in the other — both edits survive
- [ ] First-run notice appears once and stays dismissed
- [ ] Version bumped in both manifests + package.json
- [ ] Privacy policy URL live
- [ ] Screenshots (new tab first) + 440×280 promo tile ready
- [ ] New tab override disclosed in both the short and detailed descriptions
