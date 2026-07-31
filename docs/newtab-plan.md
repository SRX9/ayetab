# New Tab Override — Plan

Make AyeTab the browser's default new tab page, delivering on the product name. The side panel stays; the two surfaces serve different jobs.

| Surface | Job |
|---------|-----|
| **New tab** | Destination. Dashboard + pinned tools + widgets, opened dozens of times a day. |
| **Side panel** | Companion. Use a tool without leaving the page you're on. |
| **Web app** (`app.ayetab.dev`) | No-install option + home for CSP-blocked tools. |

## What already exists

Most of the work is done — the extension just never mounts it.

- **`HomeScreen`** ([packages/ui/src/components/home/home-screen.tsx](../packages/ui/src/components/home/home-screen.tsx)) is already a new tab dashboard: pinned tools, resizable bento widgets, wallpaper, drag-to-reorder, edit mode. `apps/web` renders it at `/`.
- **Storage already abstracts per-platform** — [preferences.ts:50-79](../packages/ui/src/lib/preferences.ts#L50-L79) picks `chrome.storage.local` when available, falls back to `localStorage`. A new tab page inherits shared pins/favorites with the side panel for free.
- **Both browsers support the manifest key.** `chrome_url_overrides.newtab` works in Chrome MV3 and Firefox MV3 ([MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)). No Firefox-specific workaround.

What's missing: the extension builds exactly one entry point — [vite.config.ts:44](../apps/extension/vite.config.ts#L44).

---

## Two things that will bite you

### 1. Concurrent preference writes will silently destroy data

**This is the only genuine new engineering in the feature.** Everything else is wiring.

[preferences-provider.tsx](../packages/ui/src/components/preferences-provider.tsx) loads preferences once on mount, then writes the **entire object** on every mutation, derived from that context's in-memory copy. There is no `chrome.storage.onChanged` subscription, so contexts never learn about each other's writes.

One side panel makes that safe. A new tab override does not — users routinely keep many new tabs open at once, each holding a stale snapshot.

**Failure scenario:**

1. Tab A and Tab B both open. Both load `{ favorites: [], home: H0 }`.
2. Tab A stars the JWT tool → writes `{ favorites: ["jwt"], home: H0 }`.
3. Tab B drags a widget → writes `{ favorites: [], home: H1 }` from its stale copy.
4. The JWT favorite is gone. No error, no warning.

`addRecent` makes this constant rather than occasional: every tool open writes, so any tab that has ever opened a tool is an active clobber source.

**Fix:**

- [x] Subscribe to `chrome.storage.onChanged` (and the `storage` event for the web app) in `PreferencesProvider`; call `setPrefs` on external changes. This alone shrinks the stale window to milliseconds. — `subscribePreferences` in [preferences.ts](../packages/ui/src/lib/preferences.ts)
- [x] Change `savePreferences(next)` to accept a **patch**: read current stored value → shallow-merge the changed field → write back. Eliminates cross-field clobbering while keeping one storage key, so export/import format is unchanged. — `savePreferencesPatch`, with writes serialized per context via a promise chain
- [x] Debounce `addRecent` writes (~500ms) to stop write thrash across tabs. Flushes on `visibilitychange`/`pagehide` so closing a tab doesn't drop the last one.
- [x] Same-field concurrent edits stay last-write-wins. Acceptable — don't build CRDTs for widget order.

The provider tracks which fields have a write in flight and ignores incoming storage events for
just those fields, so an echo of our own write can't briefly revert what the user is dragging.
Covered by [preferences.test.ts](../packages/ui/src/lib/preferences.test.ts).

### 2. Excalidraw stays unavailable — the new tab is 49 of 50 tools

`@excalidraw/excalidraw` is aliased to a stub at build time ([vite.config.ts:29-32](../apps/extension/vite.config.ts#L29-L32)) because it uses `Function`/`eval` constructs that MV3 CSP and AMO both reject. That applies to **every** extension page, new tab included — this is not something the new surface fixes.

- [x] Reuse the `EXTENSION_EXCLUDED_TOOL_IDS` filter — hoisted out of `sidepanel/App.tsx` into [lib/extension-tools.ts](../apps/extension/src/lib/extension-tools.ts), shared by both surfaces.
- [x] Deep-link Draw & Write out to `https://app.ayetab.dev/tools/excalidraw` instead of hiding it silently. Gives `apps/web` a clearer purpose than "no install required." The library shows an "Opens in the web app" section; a pasted `#/tools/excalidraw` deep link gets a handoff card; the panel's `openTool` links out instead of silently returning.
- [x] Make sure marketing copy doesn't claim 50 tools in the extension — [Tools.astro](../apps/landing/src/components/Tools.astro) now states 49 in the extension, and STORE.md records the rule.

---

## Tasks

### Phase 1 — Make it load

- [x] `src/newtab/index.html` — mirror [sidepanel/index.html](../apps/extension/src/sidepanel/index.html). Keep a real `<title>`, otherwise Firefox shows the raw `moz-extension://` URL in the tab.
- [x] `src/newtab/main.tsx` — mirror [sidepanel/main.tsx](../apps/extension/src/sidepanel/main.tsx).
- [x] `src/newtab/App.tsx` — render `HomeScreen` inside the provider stack from `sidepanel/App.tsx` (`ThemeProvider` → `PreferencesProvider` → `AppearanceSync` → `ShortcutsProvider`).
- [x] Add `newtab: resolve(__dirname, "src/newtab/index.html")` to `rollupOptions.input`.
- [x] Add `"chrome_url_overrides": { "newtab": "src/newtab/index.html" }` to both `manifest.chrome.json` and `manifest.firefox.json`.
- [ ] **Load unpacked, open a new tab, confirm it renders.** ← not done; needs a browser.

Both targets build and `lint:firefox` passes. `src/newtab/styles.css` is separate from the panel's:
the panel sets `overflow: hidden` on `body`, which would break scrolling on a full page.

### Phase 2 — Make it behave like a tab

- [x] **Hash routing** (`#/tools/json-format`, `#/library`) — [route.ts](../apps/extension/src/newtab/route.ts), listening on `hashchange`. Short chained inputs ride in the hash; larger ones go to per-tab `sessionStorage` under a token so reload and Back still restore them without a megabyte URL.
- [x] `HomeScreen` defaults `libraryHref="/library"`, which doesn't exist in the extension — both a hash-route `libraryLink` and an in-page [library-view.tsx](../apps/extension/src/newtab/library-view.tsx) reusing `CategoryNav` + `ToolCard`.
- [x] Drop `hideWallpaper` on `SettingsButton` for the new tab. The panel keeps it — still ~400px wide.
- [x] The new tab never uses the panel's `sessionStorage` active-tool slot; the hash is the source of truth. The panel keeps its own restore, which is correct: one instance per window, so nothing to fight over.
- [x] `⌘K` and `?` only fire when the page has focus, so a freshly opened new tab (URL bar focused) still gets the browser's own `Ctrl+K`. No change needed.
- [x] Nothing on the home or library route autofocuses, so Firefox keeps address-bar focus. The tool route autofocuses its input, which is user-initiated navigation. Noted in STORE.md so it isn't undone by accident.

### Phase 3 — Production readiness

- [x] **Store disclosure.** Overriding the new tab is a flagged category on both Chrome Web Store and AMO, and needs explicit user-facing justification. [STORE.md](STORE.md) now leads with a "New tab override — read before submitting" section, updated listing copy, and screenshot ordering.
- [x] A first-run notice explaining the new tab takeover — [first-run-notice.tsx](../apps/extension/src/newtab/first-run-notice.tsx), dismissed once and remembered in extension storage.
- [x] Bump `version` in both manifests (1.0.0 → 1.1.0) and `package.json`. `scripts/pack.mjs` derives the zip name from the built manifest, so nothing else to change.
- [x] Confirm no new permissions are needed. `chrome_url_overrides` requires none — the "storage + sidePanel only" story in [PRIVACY.md](PRIVACY.md) holds, and now has a "New tab page" section stating the page makes no network requests and can't see other tabs.
- [x] Update README's monorepo section and landing copy — [README](README.md), Features/Tools/Install/Privacy `.astro`, `LandingHero.tsx`, and the default meta description in `Layout.astro`.
- [ ] Cold-start performance budget. Tool implementations are already code-split; the shared chunk is ~377 kB (113 kB gzip) and `newtab` adds ~37 kB. Not yet measured in a browser, and widget code isn't lazy-loaded. `HomeScreen` shows a skeleton while `loaded` is false — needs a look for a visible flash.
- [ ] Test light/dark against wallpaper, plus `prefers-reduced-motion` on the bento animations.
- [ ] Playwright coverage for the new tab entry — [implementation-roadmap.md](implementation-roadmap.md) still lists extension E2E as outstanding, and there's no extension harness to hang a test on yet.
- [ ] Manual matrix: Chrome 114+, Firefox 121+ (per each manifest's stated minimum), fresh profile and upgrade-from-1.0.0 profile.

---

## Open decisions

| Question | Recommendation |
|----------|----------------|
| Ship new tab and panel together, or new tab only? | **Both.** Shared `@ayetab/ui` makes the panel nearly free, and it's genuinely better for in-context use. |
| Should users be able to opt out of the override? | Worth it. Can't be done from the manifest — needs a settings toggle that redirects to the browser default. Reduces uninstalls; defer to v1.2 if it slows launch. |
| Firefox for Android? | Out of scope. `chrome_url_overrides` support there has historically lagged. |
| Widget set for new tab vs panel | New tab has room for more. Ship parity first, expand after.  |
