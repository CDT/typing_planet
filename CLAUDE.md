# CLAUDE.md

Guidance for Claude Code (and other AI coding agents) working in this repo. Read this first.

## What this is

**打字星球 (Typing Planet)** — a pure-frontend PWA helping K-12 students learn touch typing. Local-first, no backend, deployed as a static site to Tencent Cloud EdgeOne.

The full design lives in [`docs/`](./docs/). Treat those docs as the source of truth. If a doc and the code disagree, the doc wins for new work; for existing code, fix the code or update the doc and call it out in the PR.

## Required reading before coding

In this order:

1. [docs/requirements.md](./docs/requirements.md) — the product brief.
2. [docs/product-spec.md](./docs/product-spec.md) — features and scope.
3. [docs/architecture.md](./docs/architecture.md) — stack, layout, conventions.
4. The doc closest to your task:
   - Typing engine work → [docs/typing-engine-spec.md](./docs/typing-engine-spec.md).
   - UI / screens → [docs/wireframes.md](./docs/wireframes.md) + [docs/ux-flows.md](./docs/ux-flows.md) + [docs/design-system.md](./docs/design-system.md).
   - Storage / persistence → [docs/data-model.md](./docs/data-model.md).
   - Lesson content → [docs/content-spec.md](./docs/content-spec.md).
   - Deploy / PWA → [docs/pwa-and-deploy.md](./docs/pwa-and-deploy.md).
   - A11y → [docs/accessibility.md](./docs/accessibility.md).
   - Perf → [docs/performance-budget.md](./docs/performance-budget.md).
   - Tests → [docs/testing-strategy.md](./docs/testing-strategy.md).
   - i18n → [docs/i18n.md](./docs/i18n.md).
5. [docs/roadmap.md](./docs/roadmap.md) — what phase we're in.

## Tech stack (short version)

Vite + React 18 + TypeScript (strict) + Tailwind + Zustand + IndexedDB (via `idb`) + react-i18next + Framer Motion + Vitest + Playwright. npm. No backend.

Full rationale in [docs/architecture.md](./docs/architecture.md). **Do not introduce new core libraries without updating that doc first.**

## Commands

```bash
npm install                  # bootstrap
npm run dev                  # vite dev server :5173
npm run build                # production build to dist/
npm run preview              # serve dist/ on :4173
npm test                     # vitest unit + component
npm run test:e2e             # playwright against preview
npm run lint                 # eslint
npm run typecheck            # tsc --noEmit
npm run content:validate     # validate lesson JSON against schema
npm run i18n:check           # ensure zh-CN and en-US have same keys
npm run build:analyze        # bundle treemap
npm run lighthouse           # local lighthouse CI run against preview
```

CI uses `npm ci` for installs, then runs `lint && typecheck && test && build && test:e2e` on every PR.

## Folder map

See [docs/architecture.md](./docs/architecture.md) §folder-layout for the canonical tree. High-level:

- `src/features/engine/` — pure-TS typing engine. **No React imports.**
- `src/features/progress/` `src/features/badges/` — domain logic, also pure.
- `src/pages/` — one folder per route.
- `src/components/` — shared UI primitives.
- `src/stores/` — Zustand slices. `progress` and `settings` are persisted.
- `src/storage/` — IndexedDB adapter + migrations.
- `src/content/` — lesson JSON bundled at build time.
- `src/i18n/` — translation bundles.
- `src/styles/` — tokens.css (from design-system.md) and globals.css.
- `tests/e2e/` — Playwright specs.

## Conventions

### Code style
- TypeScript `strict: true`. No `any` without a `// eslint-disable-next-line` and a reason.
- React function components with hooks. No class components.
- Prefer `function Foo() {}` over arrow components for top-level exports (better stack traces).
- Imports: absolute via `@/` alias (configured in `vite.config.ts` and `tsconfig.json`).
- Filenames: components `PascalCase.tsx`; everything else `kebab-case.ts`.

### Styling
- Tailwind utility classes for layout; CSS custom properties for design tokens.
- **Never** hardcode hex colors in components — use a token (`text-[var(--accent)]` or a Tailwind theme key derived from tokens).
- Spacing must come from the 4px scale ([docs/design-system.md](./docs/design-system.md) §spacing).
- Animations use the `--ease-*` and `--dur-*` tokens.

### State
- Zustand stores are the only place ephemeral or persisted state lives. No `useReducer` for cross-component state, no React Context for app state.
- Selectors: subscribe to the minimum slice you need (`useProgress(s => s.xp)`) so children don't re-render on unrelated changes.
- Persisted stores rehydrate before first render — see `app/providers.tsx`.

### Engine
- The engine is **pure functions over `EngineState`**. Never mutate. Return new state.
- Tests in `engine.test.ts` are mandatory; new behavior needs a new test case.
- Time is injected (`atMs` parameter); engine never calls `Date.now()` directly.

### Lesson content
- Add lessons by dropping a JSON file in the right planet folder. Schema in [docs/content-spec.md](./docs/content-spec.md).
- Run `npm run content:validate` before committing.
- New badges require both a JSON entry and a rule in `src/features/badges/rules.ts`.

### i18n
- No raw strings in JSX. Use `t('key')`. Add the key to both `zh-CN.json` and `en-US.json`.
- `npm run i18n:check` enforces parity.

### Accessibility
- All interactive elements must be keyboard-reachable with a visible `:focus-visible` ring.
- Run `vitest-axe` on every new component test; zero violations.
- Reduced-motion behavior is non-negotiable.

### Performance
- Lazy-load routes via dynamic import.
- Import Lucide icons by name, not the barrel.
- Don't add date-fns/lodash/moment.
- Watch the bundle budget — [docs/performance-budget.md](./docs/performance-budget.md).

## Things to avoid

- ❌ Adding a backend, API client, or telemetry SDK.
- ❌ Introducing Redux, MobX, Recoil, or Context-based app state.
- ❌ CSS-in-JS libraries (styled-components, Emotion).
- ❌ SSR/SSG frameworks (Next, Remix). We're a SPA on Vite.
- ❌ Bundling CJK webfonts. System fallback only.
- ❌ Hardcoding colors, sizes, or durations outside the token system.
- ❌ Reading `Date.now()` from the typing engine.
- ❌ Storing PII or anything outside the user's local browser.
- ❌ Adding features beyond the current phase in [docs/roadmap.md](./docs/roadmap.md) without discussion.

## When in doubt

- Stuck on a design decision: check the relevant doc; if it's silent, propose an update to the doc as part of your PR.
- Stuck on stack choice: don't add it. Discuss in the PR description first.
- Stuck on scope: defer to [docs/roadmap.md](./docs/roadmap.md). If your work expands scope, flag it.

## Commit & PR conventions

- Conventional Commits: `feat(engine): add backspace handling`, `fix(map): correct planet unlock check`, `docs: clarify XP formula`.
- One logical change per PR. Big features get a phase-aligned epic PR with sub-PRs.
- PR description references the relevant doc(s) and the roadmap phase.
- Tests required for `features/**` changes.

## Where to put new docs

If a new design decision warrants documentation, either:
- Update an existing doc in `docs/` if it fits, OR
- Add a new file in `docs/` and link it from the relevant peer docs and from CLAUDE.md (this file).

Do not create stray markdown in random places.
