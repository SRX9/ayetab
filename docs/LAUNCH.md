# Launch checklist (manual)

Code on `main` is ready. Do these steps from your machine when you want to ship.

Related docs: [Store listing copy & policy](./STORE.md) · [Privacy](./PRIVACY.md) · [Landing deploy notes](../apps/landing/README.md)

---

## 0. Pull latest

```bash
git checkout main
git pull origin main
pnpm install
```

Quick sanity check (optional):

```bash
pnpm test
pnpm type-check --filter web
pnpm --filter extension type-check
pnpm build --filter landing
```

---

## 1. Deploy the landing site (Cloudflare)

Privacy + terms must be live before store review (`https://ayetab.dev/privacy`).

```bash
pnpm build --filter landing
# output → apps/landing/dist

npx wrangler login          # once per machine
pnpm --filter landing deploy
```

Then in the [Cloudflare dashboard](https://dash.cloudflare.com/):

1. Open **Workers & Pages** → `ayetab-landing`
2. **Settings → Domains** → add `ayetab.dev` and `www.ayetab.dev`
3. Point DNS for those names at Cloudflare if they are not already
4. Open and confirm:
   - https://ayetab.dev/
   - https://ayetab.dev/privacy
   - https://ayetab.dev/terms

Config lives in `apps/landing/wrangler.jsonc` (static assets from `./dist`).

---

## 2. Build extension store packages

Bump version **only if** you changed the extension since the last upload. Keep these three in sync:

1. `apps/extension/src/manifest.chrome.json` → `version`
2. `apps/extension/src/manifest.firefox.json` → `version`
3. `apps/extension/package.json` → `version`

Current ship target: **1.1.0**

```bash
pnpm --filter extension zip
pnpm --filter extension lint:firefox
```

| Browser | Load unpacked (QA) | Upload this ZIP |
|---------|--------------------|-----------------|
| Chrome | `apps/extension/dist/chrome` | `apps/extension/dist/ayetab-chrome-v1.1.0.zip` |
| Firefox | `apps/extension/dist/firefox/manifest.json` | `apps/extension/dist/ayetab-firefox-v1.1.0.zip` |

Each ZIP has `manifest.json` at the **root**.

---

## 3. Manual QA (required)

### Chrome

1. `chrome://extensions` → Developer mode → **Load unpacked** → `apps/extension/dist/chrome`
2. Open a **new tab** — bare logo, “AyeTab”, liquid-glass smart bar, wallpaper
3. First-run notice appears once; dismiss it and confirm it stays gone
4. Type in the bar → open a tool; try Google / Bing / Perplexity (opens a new tab)
5. Side panel opens from the toolbar action
6. Settings → Appearance → wallpaper presets work

### Firefox

1. `about:debugging` → This Firefox → **Load Temporary Add-on** → `apps/extension/dist/firefox/manifest.json`
2. Same new-tab checks as Chrome
3. Confirm the **address bar keeps focus** on a fresh new tab (do not autofocus the page)
4. Sidebar toggles from the toolbar

---

## 4. Chrome Web Store

1. [Developer Dashboard](https://chrome.google.com/webstore/devconsole) → upload `ayetab-chrome-v1.1.0.zip`
2. Privacy practices: **no remote data collection**
3. Justify permissions (`sidePanel`, `storage`) — see [STORE.md](./STORE.md)
4. Privacy policy URL: `https://ayetab.dev/privacy`
5. **Disclose the new tab override** in the short and detailed descriptions (copy in STORE.md)
6. Screenshots: **new tab home first**, then tool, side panel, command palette, Settings  
   Sizes: 1280×800 or 640×400; promo tile 440×280; icon 128×128

---

## 5. Firefox Add-ons (AMO)

1. [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) → upload `ayetab-firefox-v1.1.0.zip`
2. Declare **no data collection** (already in the Firefox manifest)
3. Upload **source** (this monorepo) and document the build:

```bash
pnpm install --frozen-lockfile
pnpm --filter extension build:firefox
# Compare apps/extension/dist/firefox with the uploaded ZIP
```

4. Same new-tab disclosure + screenshots as Chrome
5. Keep gecko id `ayetab@srx9.dev` stable after first publish

---

## 6. Pre-submit checklist

- [ ] Landing live on `ayetab.dev` with `/privacy` and `/terms`
- [ ] `pnpm --filter extension zip` + `lint:firefox` clean
- [ ] Chrome unpacked QA (new tab + side panel)
- [ ] Firefox temporary QA (new tab focus + sidebar)
- [ ] Version bumped in both manifests + package.json (if not still 1.1.0)
- [ ] Screenshots ready (new tab first)
- [ ] Listing copy leads with new-tab replacement ([STORE.md](./STORE.md))
- [ ] No claim of “dark mode” or remote sync — product is light-only and offline-local

---

## Notes

- Extension: **99 tools**. Web app: **100** (Draw & Write / Excalidraw is web-only).
- Do not imply a “restore default new tab” toggle — users disable or remove the extension.
- Full listing text, permission table, and reviewer notes: [STORE.md](./STORE.md).
