# Chrome Web Store Listing Guide

## Extension package

Build the production extension:

```bash
pnpm build --filter extension
```

Upload the contents of `apps/extension/dist/` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Listing copy

**Name:** AyeTab — Developer Utilities

**Short description:** All-in-one offline developer toolbox in your browser sidebar.

**Detailed description:**

AyeTab brings 40+ developer utilities into a persistent browser sidebar — format JSON, debug JWTs, convert YAML, generate hashes, diff text, and more. Inspired by DevUtils, but free and cross-platform.

- Works entirely offline — your data never leaves your device
- 40+ tools: formatters, converters, generators, debuggers
- Command palette (⌘K) for instant tool search
- Favorites and recent tools for quick access
- Smart paste detection suggests the right tool automatically
- Dark and light themes

**Category:** Developer Tools

**Screenshots needed:**
1. Home grid with tool categories
2. JSON Formatter with syntax highlighting
3. JWT Debugger decoding a token
4. Command palette open
5. Dark mode side panel

## Privacy policy

State clearly: *No data is collected, stored, or transmitted. All processing happens locally in the browser.*

## Permissions justification

| Permission | Reason |
|------------|--------|
| `sidePanel` | Display the utility sidebar |
| `storage` | Save favorites, recents, and theme preference locally |
| `activeTab` | Optional future: read page selection |
| `<all_urls>` | Side panel is available on all pages (no data read) |

## Firefox Add-ons

The same build supports Firefox via `sidebar_action` in the manifest. Submit to [addons.mozilla.org](https://addons.mozilla.org/) with the same `dist/` folder.

## Versioning

Follow semver. Bump `version` in `apps/extension/src/manifest.json` before each store submission.
