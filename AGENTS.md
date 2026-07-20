# AGENTS.md

## Cursor Cloud specific instructions

AyeTab is a **frontend-only Turborepo monorepo** (no backend, database, or external services). All tool logic runs locally in the browser. No secrets or env vars are required.

Package manager is **pnpm** (`pnpm@9.15.4`, Node >= 20). Standard commands are in the root `package.json` and `README.md`.

### Services

| Service | What it is | Run (dev) | Notes |
|---------|-----------|-----------|-------|
| `landing` (`apps/landing`) | Astro marketing site | `pnpm dev --filter landing` → http://localhost:4321 | Product discovery / install landing page (liquid-glass brand). |
| `web` (`apps/web`) | Next.js 15 app, full tool suite | `pnpm dev --filter web` → http://localhost:3000 | Primary runnable app. Tool pages live at `/tools/<id>` (e.g. `/tools/base64`, `/tools/uuid-generator`). Wrong slugs render a "Tool not found" page by design. |
| `extension` (`apps/extension`) | Chrome MV3 + Firefox sidebar (Vite + CRXJS) | `pnpm dev --filter extension` | Dev server builds `apps/extension/dist` to load unpacked; it does NOT type-check. Needs a browser to load — no localhost page to hit. |

Shared logic: `packages/utils` (the 41 tool implementations + `executeTool()`) and `packages/ui` (shared React components).

### Lint / test / build (non-obvious caveats)

- **Test**: `pnpm test` runs Vitest in `packages/utils` only (`src/tools/tools.test.ts` + `fuzzy-search.test.ts`). Works out of the box.
- **Build**: `pnpm build --filter web` and `pnpm build --filter extension` both work. Prefer filtered builds in CI; full `pnpm build` is fine after the `@types/spark-md5` fix.
- **type-check**: Prefer a single package (e.g. `pnpm type-check --filter web`) — running many `tsc` processes in parallel under Turbo has been observed to segfault here.
- **Lint**: `pnpm lint` → `web`'s `next lint`, but no ESLint config is committed, so it prompts interactively and fails in a non-TTY environment. Lint is effectively not configured in this repo.
- **CI**: `.github/workflows/ci.yml` runs unit tests, web type-check, web build, and extension build.
