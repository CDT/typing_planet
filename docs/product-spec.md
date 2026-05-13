# Product Spec — 打字星球 (Typing Planet)

Companion to [requirements.md](./requirements.md). Defines what gets built. UX flows live in [ux-flows.md](./ux-flows.md); engine math in [typing-engine-spec.md](./typing-engine-spec.md).

## Positioning

A pure-frontend touch-typing trainer for K-12 students. The metaphor: each "planet" is a themed world of lessons. Students explore a galaxy of planets as they progress, unlocking new ones by clearing the previous. The vibe is *clean and modern, lightly playful* — not a babyish edutainment app, not a sterile productivity tool.

## MVP Scope (v1.0)

In scope:
- English touch-typing (home row → full keyboard → words → sentences).
- Solo practice only; local-only data (no accounts, no sync).
- Gamified progression: planets, levels, XP, stars, streaks.
- Results screen with WPM, accuracy, and per-finger heatmap.
- PWA install + offline play.
- Bilingual UI (zh-CN default, en-US toggle).

Out of scope for v1.0 (see [roadmap.md](./roadmap.md)):
- Chinese typing content (pinyin sentence drill via IME).
- Multiplayer / leaderboards / accounts.
- Custom lesson authoring by end users.
- Native mobile apps.

## Core Features

### F1. Planet Map (home)
A scrollable galaxy with planets laid out in a curved path. Each planet has a status: `locked`, `available`, `in-progress`, `mastered` (3 stars). Tapping a planet opens its **lesson list**.

### F2. Lesson List
Within a planet, lessons are ordered by difficulty. Each lesson shows: title, best WPM, best accuracy, stars earned (0–3). A "Start" CTA opens the practice screen.

### F3. Practice Screen
The core typing surface. Shows:
- The target text (3 lines visible, scrolling as you type).
- Per-character state: pending / current (caret) / correct / incorrect.
- Live HUD: WPM, accuracy, time elapsed, progress bar.
- A virtual keyboard at the bottom with the next key highlighted; optional finger-color overlay.
- Pause button (Esc).

Errors do not block progress (the user must type the correct char to continue *or* press Backspace; see [typing-engine-spec.md](./typing-engine-spec.md) §error-policy).

### F4. Results Screen
On lesson completion:
- Final WPM, accuracy, time, error count.
- Star rating (1–3 stars based on accuracy *and* WPM thresholds per lesson).
- XP earned, new badges, streak status.
- Per-finger error heatmap.
- CTAs: **Retry**, **Next lesson**, **Back to planet**.

### F5. Progress / Profile
- Lifetime stats (sessions, total chars typed, average WPM trend over last 30 days).
- Streak calendar (consecutive days practiced).
- Badge collection.
- Settings entry.

### F6. Settings
- Language (zh-CN / en-US).
- Theme (system / light / dark).
- Sound effects on/off.
- Haptics on/off (mobile).
- Show virtual keyboard on/off.
- Show finger-color overlay on/off.
- Reduced motion toggle.
- Data: export JSON, import JSON, reset all progress (confirm dialog).

## Gamification

### XP & Levels
- XP per lesson = `base * accuracy_multiplier * speed_multiplier`. Formula in [typing-engine-spec.md](./typing-engine-spec.md) §scoring.
- 20 player levels; XP-to-next-level curve is gentle early, steeper later.
- Level-up triggers a confetti animation and unlocks cosmetic profile frames.

### Stars per lesson
- 1 star: complete with ≥ 80% accuracy.
- 2 stars: ≥ 90% accuracy AND meet target WPM.
- 3 stars: ≥ 97% accuracy AND meet target WPM + 5.

Target WPM is set per-lesson by content authors (see [content-spec.md](./content-spec.md)).

### Streaks
- A "day" counts if the user completes ≥ 1 lesson. Resets if a full calendar day is skipped (local timezone).
- Visible flame icon on the home screen with current streak count.
- Streak shields: every 7-day streak grants 1 shield (max 2 held); a shield absorbs one missed day.

### Badges
At least 12 badges in v1.0, e.g. *First Steps* (finish first lesson), *Home Row Hero*, *Centurion* (100 lessons), *Perfectionist* (3-star a lesson), *Night Owl*, *Speed Demon* (50 WPM), *Marathon* (30-day streak). Full list in [content-spec.md](./content-spec.md) §badges.

### Planets (worlds)
Each planet is a themed bundle of 8–12 lessons sharing a key-set focus and visual identity. v1.0 ships 5 planets:

1. **Terra** — Home row (asdf jkl;). Friendly green-blue.
2. **Aqua** — Top row + home row. Cool teal.
3. **Pyra** — Bottom row + everything above. Warm orange.
4. **Numa** — Numbers + symbols. Bright purple.
5. **Nova** — Mixed full keyboard + common English words/sentences. Cosmic gold.

Unlocking a planet requires earning ≥ 1 star on every lesson of the previous planet.

## Content Model (summary)

Lessons fall into 4 types — full schema in [content-spec.md](./content-spec.md):
- `keys`: drill specific keys (e.g. `f` and `j`).
- `words`: drill common words from a curated list.
- `sentences`: short complete sentences (≤ 80 chars).
- `paragraph`: 1–2 sentences flowing together (Nova only).

## Non-Goals (explicit)

- **No** real-time competitive multiplayer.
- **No** social features (friends, chat, shareable score images beyond a basic Web Share API hook).
- **No** ads, IAP, or telemetry beyond fully local stats.
- **No** account system or cloud sync.
- **No** voice-driven or AI-generated lesson content in v1.0.

## Success Criteria

A student opens the app cold, picks Terra → Lesson 1, finishes within 60 seconds, sees clear feedback, and feels motivated to try Lesson 2 without being told to. A returning student lands on the planet map and immediately knows what to do next.
