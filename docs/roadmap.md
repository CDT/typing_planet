# Roadmap

Phased milestones. Each phase ships a useful product on its own. Items not listed here are explicitly out of scope until a future phase.

## Phase 0 — Foundations (week 1–2)

Skeleton everything before any feature work.

- [ ] Vite + React + TS + Tailwind scaffold per [architecture.md](./architecture.md).
- [ ] CSS tokens from [design-system.md](./design-system.md) wired up; light + dark.
- [ ] React Router routes (S1–S8) with placeholder pages.
- [ ] Zustand stores (progress, settings, session, ui) with the schemas from [data-model.md](./data-model.md).
- [ ] IndexedDB layer + first migration (v1 schema).
- [ ] i18n with `zh-CN` and `en-US` skeleton bundles.
- [ ] PWA manifest + service worker per [pwa-and-deploy.md](./pwa-and-deploy.md).
- [ ] CI: lint, typecheck, test, build, lighthouse.

Exit criteria: app boots, navigates between placeholder screens, installs as a PWA, builds clean.

## Phase 1 — Engine + One Planet (week 3–4)

Make typing work end-to-end on Terra only.

- [ ] Typing engine per [typing-engine-spec.md](./typing-engine-spec.md), with unit tests.
- [ ] `TypingSurface` component (text + caret + per-char states).
- [ ] `VirtualKeyboard` component with next-key highlight.
- [ ] Practice screen state machine + countdown + pause/resume.
- [ ] Results screen with stars, WPM, accuracy, time.
- [ ] Scoring + XP + lesson best persistence.
- [ ] Terra (planet 1) — 8 lessons authored.
- [ ] Planet Map (S2) showing Terra unlocked + planets locked.
- [ ] Lesson List (S3) showing Terra lessons.

Exit criteria: user can play all 8 Terra lessons, see results, re-enter the app and see saved progress.

## Phase 2 — Full Content + Progression (week 5–6)

Open up the rest of the galaxy and the meta-progression loop.

- [ ] Aqua, Pyra, Numa, Nova — all lessons authored per [content-spec.md](./content-spec.md).
- [ ] Lesson-level unlock chains + planet-level unlock chains.
- [ ] Player levels (1–20) with XP curve.
- [ ] Streak tracking + streak shields.
- [ ] Badges (12 in v1.0) + Progress / Me screen (S6).
- [ ] Per-finger error heatmap on Results.
- [ ] Lesson "Continue" UX when revisiting a lesson with 1–2 stars.

Exit criteria: a user can progress from Terra L1 to Nova L12, earn every badge, and view their full history.

## Phase 3 — Polish + Settings (week 7)

The release-ready coat of paint.

- [ ] Settings screen (S7) fully wired: language, theme, sound, haptics, keyboard, finger overlay, reduced motion.
- [ ] Export / Import progress JSON.
- [ ] Reset all data flow.
- [ ] Sound effects + haptics.
- [ ] All transition animations honoring reduced motion.
- [ ] About screen (S8) with version + credits.
- [ ] Accessibility audit + fixes per [accessibility.md](./accessibility.md).
- [ ] Performance audit + fixes per [performance-budget.md](./performance-budget.md).
- [ ] Lighthouse PWA 100, Performance ≥ 90.

Exit criteria: all manual QA items in [testing-strategy.md](./testing-strategy.md) pass; ready to deploy to staging.

## Phase 4 — Launch (week 8)

- [ ] Deploy to staging on Tencent Cloud EdgeOne.
- [ ] Beta with 5–10 K-12 students; collect informal feedback.
- [ ] Fix top-priority feedback items.
- [ ] Deploy to production.
- [ ] Tag v1.0.0; freeze for stability.

## v1.1 (next quarter, tentative)

- [ ] Strict mode (must fix errors before advancing) as a setting.
- [ ] Custom practice text — paste a paragraph and drill it.
- [ ] "Daily challenge" — one auto-generated lesson per day.
- [ ] More badges (24 total).
- [ ] Sharing: native Web Share API for results card image.
- [ ] CSP enabled with `nonce`-based script policy.

## v1.2+

- [ ] Chinese pinyin sentence drill mode (new lesson type; engine extension for IME).
- [ ] Accounts + cloud sync (optional, opt-in). Possible Tencent CloudBase backend.
- [ ] Leaderboards (per-lesson, per-week).
- [ ] Parent/teacher dashboard (multi-profile on one device).
- [ ] Native wrappers (Capacitor for iOS/Android).

## Explicitly NOT planned

- Real-time multiplayer typing races.
- Ads, IAP, gacha mechanics.
- Cloud telemetry collecting user typing data.
- AI-generated lesson content tied to user history (interesting but raises privacy + content-safety concerns for a K-12 audience).

## Tracking

Phase progress is tracked in the project's GitHub Issues + Milestones. Each phase has a milestone; each checklist item maps to one or more issues. PRs must reference an issue.
