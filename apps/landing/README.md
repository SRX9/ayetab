# Landing site (`apps/landing`)

Astro static marketing site for AyeTab — product discovery, brand assets, and install CTAs.

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

## Brand assets

Liquid-glass logos and social images live in `public/images/`:

| File | Use |
|------|-----|
| `logo-icon.png` | App icon / apple-touch-icon |
| `logo-mark-alt.png` | Alternate glass mark |
| `logo-wordmark.png` | Horizontal lockup |
| `og-image.png` | Default Open Graph |
| `og-extension.png` | Extension promo / OG alternate |
| `hero-product.jpg` | Full-bleed hero visual |
| `/favicon.svg` | Crisp favicon |

Theme: iOS 26 / macOS liquid glass — frosted refraction, system blue (`#007AFF`), soft sky mist.

## Deploy

Static output in `dist/` can ship to any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages). Set the canonical `site` in `astro.config.mjs` to the production domain.
