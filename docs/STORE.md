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

AyeTab brings 50 developer utilities into a persistent browser sidebar — format JSON, debug JWTs, convert YAML, generate hashes, diff text, and more. Inspired by DevUtils, but free and cross-platform.

- Works entirely offline — your data never leaves your device
- 50 tools: formatters, converters, generators, debuggers, productivity
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
| `sidePanel` | Display the utility sidebar (Chrome) |
| `storage` | Save favorites and recents locally via `chrome.storage.local` |

No host permissions, `activeTab`, or clipboard permissions are required — all tools run offline on user-provided input.

## Firefox Add-ons

The same build supports Firefox via `sidebar_action` in the manifest. Submit to [addons.mozilla.org](https://addons.mozilla.org/) with the same `dist/` folder.

## Versioning

Follow semver. Bump `version` in `apps/extension/src/manifest.json` before each store submission.
