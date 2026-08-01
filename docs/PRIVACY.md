# Privacy Policy — AyeTab

**Last updated:** 2026-08-01

AyeTab is an offline-first developer toolbox (browser extension and optional web app). This policy describes what happens to data when you use AyeTab.

**Canonical public URL:** [https://ayetab.dev/privacy](https://ayetab.dev/privacy)

## Summary

- **We do not collect, sell, or transmit your tool input or personal data.**
- All formatting, encoding, conversion, and generation runs **locally in your browser**.
- Preferences and tool drafts are stored **only on your device**.
- AyeTab does not use tracking cookies or third-party analytics.

## Data stored on your device

AyeTab may store the following locally (never uploaded by AyeTab to a server we operate):

| Data | Where | Purpose |
|------|--------|---------|
| Favorites & recent tools | `chrome.storage.local` (extension) or `localStorage` (web) | Quick access |
| Theme preference | Local storage | Dark / light mode |
| Onboarding flag | Local storage | Show welcome once |
| Tool drafts / productivity notes | IndexedDB on your device | Restore your last input |

You can clear this data anytime via the browser’s site / extension storage controls, or by removing the extension.

## New tab page

AyeTab replaces your browser’s new tab page with its own tool list. That page runs entirely from
files bundled inside the extension — it makes no network requests, and it does **not** read the URLs
or contents of your other tabs. Replacing the new tab requires no browser permission, so this adds
nothing to the permission list below.

To restore your browser’s default new tab page, disable or remove AyeTab from your browser’s
extensions page.

## Permissions

| Permission | Why |
|------------|-----|
| `sidePanel` (Chrome) | Show the AyeTab sidebar |
| `storage` | Save favorites, recents, home layout, and settings on device |

AyeTab does **not** request host permissions, browsing-history access, or clipboard permissions.

## Network activity

AyeTab tools do not send your input to AyeTab servers. The extension is designed to work offline.

If you open HTML or Markdown previews that contain remote image URLs, those requests would be blocked by the preview’s sandbox CSP (local `data:` / `blob:` images only).

The separate **web app** may load its own static assets from the host you visit; that is normal website hosting and is unrelated to processing your tool input.

## Draw & Write (web app)

The Draw & Write (Excalidraw) tool is available on the **web app** only. It is omitted from the extension build because Excalidraw relies on constructs incompatible with Manifest V3’s Content Security Policy.

The extension lists it and links out to `https://app.ayetab.dev/tools/excalidraw`, which opens in a normal browser tab. Following that link is the only point at which AyeTab sends you to a network resource, and it happens only when you click it.

## Children

AyeTab is a developer utility and is not directed at children under 13.

## Cookies

AyeTab does not set advertising or analytics cookies. Any cookies from the static host (if present) are limited to normal website delivery and are not used to track tool usage.

## Changes

We may update this policy as the product changes. The “Last updated” date above will change when we do.

## Contact

For privacy questions about this open-source project, open an issue on the AyeTab repository.
