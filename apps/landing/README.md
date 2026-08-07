# Landing site (`apps/landing`)

Astro static marketing site for AyeTab — product discovery, brand assets, legal pages, and install CTAs.

## Develop

```bash
pnpm install
pnpm dev --filter landing   # http://localhost:4321
```

## Build

```bash
pnpm build --filter landing
# output → apps/landing/dist
```

## Pages

| Path | Purpose |
|------|---------|
| `/` | Marketing / install landing |
| `/privacy` | Privacy policy (store-ready URL) |
| `/terms` | Terms of use |

## Brand assets

Liquid-glass logos and social images live in `public/`:

| File | Use |
|------|-----|
| `images/logo-icon.png` | App icon / master mark (abstract glass tab) |
| `images/logo-wordmark.png` | Horizontal lockup |
| `images/og-image.jpg` | Default Open Graph |
| `images/hero-product.jpg` | Full-bleed hero atmosphere |
| `favicon.svg` | Crisp favicon (tab mark) |
| `apple-touch-icon.png` | iOS home-screen icon |

Theme: macOS liquid glass — frosted refraction, system blue (`#007AFF`), soft sky mist. Mark: abstract browser tab in a squircle. Typography: **Instrument Sans** (UI + display) · JetBrains Mono (code).

## Deploy

Static output in `dist/` ships to Cloudflare Workers (assets). Config: `wrangler.jsonc`.

```bash
pnpm build --filter landing

# One-time: log in (or set CLOUDFLARE_API_TOKEN)
npx wrangler login

# Deploy production Worker
pnpm --filter landing deploy
# → https://ayetab-landing.<account>.workers.dev
```

Then attach the custom domain `ayetab.dev` (and `www`) in the Cloudflare dashboard → Workers & Pages → ayetab-landing → Settings → Domains.

For a throwaway preview without an account:

```bash
cd apps/landing && npx wrangler deploy --temporary
# Claim the preview URL from the printed claim link within 60 minutes.
```

Canonical `site` is already `https://ayetab.dev` in `astro.config.mjs`.
