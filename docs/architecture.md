# Architecture

How the app is structured, built, and deployed. Pairs with [data-model.md](./data-model.md) (storage), [typing-engine-spec.md](./typing-engine-spec.md) (engine), and [pwa-and-deploy.md](./pwa-and-deploy.md) (delivery).

## Stack

| Layer            | Choice                                                | Why                                                          |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| Build tool       | **Vite 5+**                                           | Fast HMR; good PWA plugin; tree-shaking; lib-quality builds. |
| Language         | **TypeScript** (strict)                               | Catch typing-engine math errors at compile time.             |
| UI framework     | **React 18+** (function components, hooks)            | Mature ecosystem; broad agent familiarity; concurrent features. |
| Routing          | **React Router v6** (`createBrowserRouter`)           | Standard, supports data routes for lesson preload.            |
| State            | **Zustand**                                           | Tiny, no boilerplate. Slices per domain. No Redux.            |
| Styles           | **Tailwind CSS** + CSS custom properties              | Tokens from [design-system.md](./design-system.md) live in `theme`. |
| Animations       | **Framer Motion**                                     | Spring easing, layout animations, reduced-motion baked in.   |
| Storage          | **IndexedDB** via [`idb`](https://github.com/jakearchibald/idb) | Larger quota than localStorage; structured data.       |
| PWA              | **vite-plugin-pwa** (Workbox)                         | Manifest, service worker, precache, runtime caching.         |
| i18n             | **react-i18next**                                     | Lazy locale chunks; ICU formatting.                          |
| Testing          | **Vitest** + **React Testing Library** + **Playwright** | Unit, component, E2E.                                      |
| Linting          | **ESLint** (typescript-eslint, react-hooks) + **Prettier** | One source of truth for style.                          |
| Package manager  | **pnpm**                                              | Fast, disk-efficient; locked.                                |
| Node             | **20 LTS**                                            | Match CI and EdgeOne build env.                              |

No backend. No SSR. The build is fully static.

## Folder Layout

```
typing_planet/
├── docs/                        ← these documents
├── public/
│   ├── icons/                   ← PWA icons (192, 512, maskable)
│   ├── fonts/                   ← self-hosted Inter, JetBrains Mono
│   └── sfx/                     ← key-correct, key-wrong, complete .opus
├── src/
│   ├── app/                     ← app shell, providers, router
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── pages/                   ← one folder per route
│   │   ├── splash/
│   │   ├── map/
│   │   ├── planet/
│   │   ├── lesson/              ← practice + results
│   │   ├── me/
│   │   ├── settings/
│   │   └── about/
│   ├── features/                ← domain logic, framework-agnostic where possible
│   │   ├── engine/              ← typing engine (pure TS, no React)
│   │   │   ├── engine.ts
│   │   │   ├── scoring.ts
│   │   │   ├── input.ts
│   │   │   └── engine.test.ts
│   │   ├── progress/            ← XP, levels, stars, streaks
│   │   ├── badges/              ← badge unlock rules
│   │   └── content/             ← lesson loader + index
│   ├── components/              ← shared UI primitives
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   ├── ProgressBar/
│   │   ├── PlanetNode/
│   │   ├── TypingSurface/       ← rendering only; logic in features/engine
│   │   ├── VirtualKeyboard/
│   │   └── Stars/
│   ├── stores/                  ← Zustand slices
│   │   ├── progress.ts          ← user progress, persisted
│   │   ├── settings.ts          ← user settings, persisted
│   │   ├── session.ts           ← active practice session, ephemeral
│   │   └── ui.ts                ← toasts, modals, ephemeral
│   ├── storage/                 ← IndexedDB adapter + migrations
│   │   ├── db.ts
│   │   ├── repositories/
│   │   └── migrations/
│   ├── content/                 ← lesson JSON (bundled at build time)
│   │   ├── terra/
│   │   ├── aqua/
│   │   ├── pyra/
│   │   ├── numa/
│   │   ├── nova/
│   │   └── index.ts             ← typed manifest
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── styles/
│   │   ├── tokens.css           ← CSS vars from design-system.md
│   │   └── globals.css
│   ├── lib/                     ← misc utilities (no domain logic)
│   ├── types/
│   └── main.tsx
├── tests/
│   └── e2e/                     ← Playwright specs
├── .github/workflows/           ← CI
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── ...
```

**Rule:** `features/engine` and `features/progress` must be pure TypeScript with **zero** React imports — they are testable in isolation.

## State Management

Zustand slices, each its own file under `src/stores/`. Two slices are persisted to IndexedDB; the others are ephemeral.

| Store        | Persisted? | Contents                                                  |
| ------------ | ---------- | --------------------------------------------------------- |
| `progress`   | yes        | lesson best scores, XP, level, streak, badges, last-played |
| `settings`   | yes        | language, theme, sound, haptics, keyboard visibility       |
| `session`    | no         | active lesson id, engine state, timing, errors             |
| `ui`         | no         | toasts, open modals, route transition flags                |

Persistence: a thin middleware writes the persisted slices to IndexedDB on change (debounced 200ms) and rehydrates them on app boot via `await loadProgress()` / `await loadSettings()` in `app/providers.tsx`. Until rehydration completes, render the Splash screen.

No Context API for app state — Zustand handles it. Context is only used for theme detection and i18n provider (their libraries require it).

## Data Flow (practice session)

```
   <PracticePage>
        │ mounts; reads lesson by id from content/index
        ▼
   features/engine.createSession(lesson)  ← pure, returns initial EngineState
        │
        ▼
   useSession() (Zustand)  ← stores EngineState + actions
        │
        │ keydown / input
        ▼
   engine.handleInput(state, char)  ← pure; returns next state
        │
        ▼
   useSession().set(next)
        │
        ▼
   <TypingSurface> re-renders (selector-scoped subscriptions)
        │
        │ session.complete?
        ▼
   progressStore.recordResult({lessonId, wpm, accuracy, errors})
        │
        ▼
   router.navigate('/lesson/:id/result')
```

Pure-function engine keeps tests fast and the UI thin. The UI never owns engine math.

## Performance Strategy

- **Code splitting**: each route is a dynamic import. Lesson content for a planet is fetched on planet open (one chunk per planet). The engine and shared chunks are eagerly loaded.
- **Tree-shake icons**: import Lucide icons by name (`import { Pause } from 'lucide-react'`), not the barrel.
- **No moment.js / large date libs**: use the platform `Intl` API for date formatting; `date-fns` is allowed only for streak math if needed.
- **Memoization**: `TypingSurface` re-renders are scoped via Zustand selectors and `React.memo` on per-char `<Char>` components. Avoid passing fresh object refs as props.
- **Web Workers**: not required in v1.0. Re-evaluate if input lag exceeds 16ms on low-end Android.
- **Targets**: see [performance-budget.md](./performance-budget.md).

## Error Handling

- A top-level `<ErrorBoundary>` catches render errors and shows a recovery screen ("Something went wrong — Reload"). Errors are logged to `console.error` only (no remote logging in v1.0).
- IndexedDB write failures (quota, private mode) surface as a banner on Settings and switch the store to in-memory mode for the session.
- Lesson load failures: inline retry on S4; offline fallback uses Workbox precached lessons.

## Build & Deploy (summary)

- `pnpm dev` — Vite dev server on `:5173`.
- `pnpm build` — production build → `dist/`.
- `pnpm preview` — serve the built bundle locally.
- `pnpm test` — Vitest unit + component.
- `pnpm test:e2e` — Playwright.
- `pnpm lint` / `pnpm typecheck`.

Deployment to Tencent Cloud EdgeOne — see [pwa-and-deploy.md](./pwa-and-deploy.md) for headers, project config, and CI.

## Versioning

Semver on the app itself (`package.json`). Display version in Settings → About. The IndexedDB schema has its own version (see [data-model.md](./data-model.md) §migrations); a schema bump triggers a migration on next boot.

## Out-of-Scope Architectural Decisions

- **No Redux, MobX, or Recoil.** Zustand only.
- **No CSS-in-JS** (styled-components / Emotion). Tailwind + CSS vars.
- **No SSR / SSG framework** (Next, Remix). Pure SPA on Vite.
- **No GraphQL client.** There's no API.
- **No telemetry SDK** (PostHog, Sentry) in v1.0; revisit when there are real users.
