# UX Flows

Screen inventory, navigation map, and state machines. Pairs with [wireframes.md](./wireframes.md) (layouts) and [product-spec.md](./product-spec.md) (features).

## Screen Inventory

| ID  | Screen        | Route             | Purpose                                      |
| --- | ------------- | ----------------- | -------------------------------------------- |
| S1  | Splash        | `/`               | First-load only; brand reveal + cold init.   |
| S2  | Planet Map    | `/map`            | Default home after first run.                |
| S3  | Lesson List   | `/planet/:id`     | Lessons within a planet.                     |
| S4  | Practice      | `/lesson/:id`    | The typing surface.                          |
| S5  | Results       | `/lesson/:id/result` | Post-session summary.                     |
| S6  | Progress      | `/me`             | Stats, streaks, badges.                      |
| S7  | Settings      | `/settings`       | Language, theme, data, accessibility.        |
| S8  | About         | `/about`          | Version, credits, license.                   |

Routes are client-side (history mode). Deep linking works for S2–S8; S1 is shown once per cold load only.

## Top-Level Navigation

A persistent bottom tab bar on mobile / left rail on desktop with three entries:

- **Galaxy** → S2
- **Me** → S6
- **Settings** → S7

S4 (Practice) and S5 (Results) hide the nav bar to maintain focus.

## First-Run Flow

```
[App boot]
   ↓
[S1 Splash, 800ms min] — show logo, init storage
   ↓
[Detect: first ever launch?]
      ├─ yes → [S2 Planet Map, all locked except Terra L1, tooltip: "Tap Terra to start"]
      └─ no  → [S2 Planet Map, restore scroll/highlight last-played lesson]
```

No multi-step onboarding wizard. The first lesson itself is the tutorial — it teaches finger placement via the virtual keyboard overlay.

## Core Loop

```
S2 Planet Map
   │ tap planet (if unlocked)
   ▼
S3 Lesson List
   │ tap lesson
   ▼
S4 Practice ──── pause (Esc) ────▶ [Pause Overlay] ──┐
   │ finish                                          │
   ▼                                                 │ resume / quit
S5 Results ──┬─ Retry  ───▶ S4 (same lesson)         │
             ├─ Next   ───▶ S4 (next lesson)         │
             └─ Done   ───▶ S3                       │
                                                     ▼
                                           Quit → S3 (no result saved)
```

## Practice Screen State Machine

```
            ┌──────────────┐
            │   loading    │ (lesson content fetched)
            └──────┬───────┘
                   │ ready
                   ▼
            ┌──────────────┐
            │  countdown   │ (3 → 2 → 1 → Go!)
            └──────┬───────┘
                   │ timer fires
                   ▼
            ┌──────────────┐  Esc / blur     ┌──────────────┐
            │    typing    │ ──────────────▶ │    paused    │
            │              │ ◀────────────── │              │
            └──────┬───────┘  resume         └──────────────┘
                   │ last char correct
                   ▼
            ┌──────────────┐
            │   finished   │ → navigate to S5
            └──────────────┘
```

Pausing freezes the WPM timer and disables input. Blurring the window (tab change) auto-pauses. Returning focus does **not** auto-resume — user must tap "Resume".

## Lesson Unlock Logic

- A lesson is **available** if the prior lesson in the same planet has ≥ 1 star, or if it is the first lesson of an unlocked planet.
- A planet is **unlocked** when every lesson of the previous planet has ≥ 1 star.
- Terra is unlocked by default.
- Locked planets/lessons are still tappable but show a "Locked" tooltip with the unlock condition.

## Error / Edge Cases

| Situation                              | Behavior                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ |
| User navigates away mid-lesson         | Auto-pause; on return show a "Resume or quit?" modal.                     |
| Storage quota exceeded                 | Banner on Settings with an Export prompt; disable new saves until cleared. |
| IndexedDB unavailable / private mode   | Fall back to in-memory state, banner: "Progress will not be saved."       |
| Service worker update available       | Toast on next idle: "New version ready — Reload".                         |
| Lesson content fails to load          | Inline retry button on S4; offline fallback uses precached lessons.       |
| Reduced-motion OS setting             | Disable confetti and planet-orbit animations; keep crossfades.             |

## Keyboard Shortcuts (desktop)

- `Esc` — pause/quit modal on S4; close modal elsewhere.
- `Enter` — primary CTA on S5 (Next).
- `R` on S5 — Retry.
- `Tab` — focus navigation (must follow [accessibility.md](./accessibility.md) order).
- `?` — open keyboard shortcut help overlay (S4, S5).

## Accessibility flows

- Screen reader users on S4: target text is exposed as `aria-live="polite"` for current-line announcements only; per-char updates are not announced (would be overwhelming). See [accessibility.md](./accessibility.md) for full spec.
- Keyboard-only navigation must reach every interactive element including planet nodes on S2.

## Transitions & Motion

- Route transitions: 200ms crossfade (none when reduced motion).
- Planet → Lesson List: shared-element scale-in of the planet sphere into the header.
- Lesson → Practice: vertical slide-up.
- Results: stats count up over 600ms; stars pop in sequentially.

All durations honor `prefers-reduced-motion: reduce` by collapsing to instant.
