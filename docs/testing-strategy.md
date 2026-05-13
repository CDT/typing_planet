# Testing Strategy

What we test, where, and with what tools. The engine has the highest test density; UI is tested where it owns behavior, not visuals.

## Test Pyramid

```
                ▲
                │   E2E (Playwright)              ← 10–15 specs
                │   Component (Vitest + RTL)      ← per public component
                │   Unit (Vitest)                 ← engine, scoring, badge rules, migrations
                ▼
```

The engine is **pure TS** and trivially testable; expect ≥ 95% coverage there. UI coverage targets behavior, not pixels.

## Tooling

| Layer          | Tool                                          | Config                         |
| -------------- | --------------------------------------------- | ------------------------------ |
| Unit + component | **Vitest** + **React Testing Library** + **@testing-library/user-event** | `vitest.config.ts` |
| E2E            | **Playwright** (Chromium, WebKit, Firefox)    | `playwright.config.ts`         |
| Visual         | **Playwright trace + screenshots**, no Percy in v1.0 | Snapshots only on Results screen |
| Performance    | **Lighthouse CI**, custom Vitest bench         | See [performance-budget.md](./performance-budget.md) |
| Lint           | **ESLint** (typescript-eslint, react-hooks, jsx-a11y), **Prettier** | `.eslintrc.cjs` |

`npm test` runs Vitest. `npm run test:e2e` runs Playwright against `vite preview`.

## Unit Tests

### Engine (`src/features/engine/engine.test.ts`)
Required cases:
- Correct typing increments cursor and tracks `correctChars`.
- Wrong char records `ErrorEvent`, advances cursor in non-strict mode.
- Backspace removes last typed char; never deletes the error history.
- Pause/resume excludes paused time from elapsed.
- WPM rounds correctly; returns 0 if `elapsedMs < 1000`.
- Accuracy with all correct: 1.0; with all wrong: 0.0; with half: ~0.5.
- Empty input: `isComplete` true only when `cursor === text.length`.
- Lone backspace at start: no-op.
- IME composition: pre-composition input is ignored; only committed string registered.

### Scoring (`src/features/engine/scoring.test.ts`)
- Star thresholds (boundary cases at 79.9%/80%, 89.9%/90%, 96.9%/97%).
- XP formula at target/below/above target WPM.
- Repeat-clear yields reduced XP unless it beats a personal best.

### Badges (`src/features/badges/rules.test.ts`)
- Each badge fires on the precise trigger and not before.
- A badge is awarded at most once.
- Time-zone-sensitive badges (night-owl, streak) use the user's local zone.

### Migrations (`src/storage/migrations/*.test.ts`)
- Each migration is idempotent: running it twice produces the same state.
- Fixtures: a saved v0 DB upgrades cleanly to current version.

### Stores (`src/stores/*.test.ts`)
- `progress.recordResult` updates `lessonBests` only when improved.
- `progress.recordResult` triggers correct badge unlocks via the rules engine.
- `settings` debounced persistence writes to IDB once per quiet period.

## Component Tests

For each shared component under `src/components/`:
- Renders with default props.
- Renders disabled state with no events.
- Focus styles present on `:focus-visible`.
- `aria-*` attributes match expectations (button labels, modal role).

For complex components:
- `TypingSurface`: types a 10-char string via `user-event`, asserts cursor + correct/incorrect class on each char.
- `VirtualKeyboard`: highlights the next key derived from cursor + lesson text.
- `Stars`: animates from 0 to N stars with proper aria announcement.

## E2E Tests

Critical user paths. Each spec runs on Chromium and WebKit; Firefox is optional.

1. **First run** — open `/`, see splash, land on map, only Terra available, tap Terra L1, finish a 5-char drill, see results with stars.
2. **Continue session** — close tab mid-lesson, reopen, resume modal appears, click Resume, finish.
3. **Unlock chain** — complete Terra L1 → L2 becomes available; complete all Terra lessons → Aqua unlocks.
4. **Settings** — toggle language to en-US; all UI text in English; toggle back.
5. **Theme** — switch to dark; CSS vars updated; reload preserves.
6. **Reset data** — confirm with "RESET"; progress wiped; planet map shows fresh state.
7. **Export/import** — export JSON; reset; import the file; progress restored.
8. **Offline** — load app online, go offline, navigate to any route, lesson plays.
9. **PWA install** — manifest detected, `beforeinstallprompt` triggers in-app install CTA on Chromium.
10. **Streak shield** — simulate missed day with shield in store; streak preserved on next session.

### Mock clock
Time-dependent E2E (streaks, night-owl badge) uses Playwright's `page.clock.install()` and advances synthetic time. No real waits.

### Test data
Each E2E spec begins by injecting a known IndexedDB state via `page.addInitScript`. No reliance on prior test state. Cleanup runs in `afterEach`.

## Browser Matrix

| Browser           | Version target          | Tier      |
| ----------------- | ----------------------- | --------- |
| Chrome / Edge     | last 2 stable           | Tier 1    |
| Safari (macOS)    | last 2 major            | Tier 1    |
| Safari (iOS)      | 16+                     | Tier 1    |
| Firefox           | last 2 stable           | Tier 2    |
| Samsung Internet  | last 2 major            | Tier 2    |

Tier 1 must pass all E2E specs in CI. Tier 2 is manually verified per release.

## Manual QA Checklist (per release)

- [ ] Install as PWA on Android + iOS; launch from home screen offline.
- [ ] Sound: SFX play on first keystroke after toggle on.
- [ ] Haptics: subtle vibration on incorrect char (Android).
- [ ] All lessons across all planets are completable.
- [ ] Each badge can be earned; visible in Profile.
- [ ] Language toggle changes every visible string (visual scan of all 8 screens).
- [ ] Dark mode visually correct on each screen.
- [ ] Reduced motion: confetti suppressed; transitions instant.
- [ ] Reset data flow: type "RESET" confirms; cancel does nothing.

## Accessibility Tests

Automated:
- **axe-core** runs in component tests via `vitest-axe`; zero violations.
- **jsx-a11y** ESLint rules at strict.

Manual (release blocker):
- Keyboard-only completion of a full lesson, including pause/resume.
- NVDA + Chrome and VoiceOver + Safari: navigate map, start lesson, hear progress.

Detailed expectations in [accessibility.md](./accessibility.md).

## Coverage Thresholds

CI fails below:
- `src/features/**`: 95% lines, 90% branches.
- `src/stores/**`, `src/storage/**`: 85% lines.
- Other code: 70% lines.

UI components are excluded from line coverage to avoid testing visuals; behavior is covered by E2E.

## Bench Tests

`tests/perf/typing.bench.ts`: feeds the engine 2,000 synthetic keystrokes and asserts p99 < 1ms. Runs in CI on `main` only.

## Test Data Locations

- Lesson fixtures used by tests: `tests/fixtures/lessons/`.
- IDB seed snapshots: `tests/fixtures/db/`.
- Golden Results screenshots: `tests/e2e/__screenshots__/`.
