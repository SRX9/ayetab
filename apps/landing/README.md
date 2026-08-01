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

Static output in `dist/` can ship to any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages). Set the canonical `site` in `astro.config.mjs` to the production domain.
