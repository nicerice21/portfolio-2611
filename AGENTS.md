# AGENTS.md

## Repo state

- Docs-first repo. **No app code yet**: no `package.json`, no `src/`. Commands in `README.md` (`npm run dev/check/build/preview/deploy`) are *planned*, not runnable.
- Start with `docs/README.md`, then `docs/requirements.md` → `docs/design.md` → `docs/architecture.md` → `docs/implementation-plan.md`.
- Documented rule: when a spec decision changes, update the docs **before** the code.

## Visual source of truth

- `mockup/index.html` is the approved design: one self-contained file, no build step, no JS.
- Preview over HTTP (Playwright/file:// is blocked):
  `python -m http.server 4173 --directory mockup`
- Check 320px and 390px: no horizontal scroll. Keep the mockup working as a reference while implementing.

## Locked design decisions

- "Raw Markdown document" aesthetic: single 46rem column, light mode only, system fonts, no web fonts.
- No cards, shadows, gradients, carousels, sliders, icon libraries, or CSS frameworks.
- Works is a **vertical list of ~3 items**. The carousel was intentionally removed; do not reintroduce it (requirements were updated to match).
- Background decoration is CSS-only, sits behind content (`pointer-events: none`, `aria-hidden`), fades out below the first screen, and is reduced below 560px. No animation.

## Planned implementation (follow `docs/architecture.md`)

- SvelteKit 5 + TypeScript + `@sveltejs/adapter-cloudflare`.
- Content: `src/content/*.md`, converted at build time by `mdsvex`; frontmatter validated with `zod` (build fails on invalid data).
- Frontmatter image fields are R2 keys (e.g. `works/portfolio/thumb.webp`), resolved with `getAssetUrl()`.
- Rendering: `/` is SSR with `Cache-Control: public, max-age=0, s-maxage=3600`; `/works/[slug]` and `/privacy` are prerendered; `csr = false`.
- Feeds: server-side only (`fast-xml-parser`), 3s timeout, `Promise.allSettled`, cache successes only (TTL 3600s). `/` must still return 200 if a feed fails.
- Analytics (GA4 / Cloudflare) render only when the env vars are set. `/privacy` must describe both.
- Env keys are listed in `.env.example`; `.env` exists locally and is gitignored — never commit it or print its values.
- Do not add dependencies (or swap tools) without updating `docs/architecture.md` first.

## Verification

- Docs: all relative links must resolve; keep requirements/design/architecture/plan consistent.
- Mockup: serve it and inspect desktop + mobile; check focus visibility and text contrast over the background washes.
- After scaffolding only: `npm run check`, `npm run build`, `npm run preview`. Do not claim these exist before `package.json` does.
- No CI, lint, or test setup exists yet.

## Conventions

- Docs and UI copy are Japanese; code identifiers and comments in English.
- `docs/reference/background-brief.md` is source material; `docs/design.md` is the spec.
- `docs/implementation-plan.md` tracks checkboxes and phase status — update them when work lands.
