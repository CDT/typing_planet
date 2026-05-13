# Data Model

Persistent storage shapes, IndexedDB layout, and migration policy. Everything is local-first — no server data.

## Storage Layer

- **IndexedDB** as the primary store, accessed via [`idb`](https://github.com/jakearchibald/idb).
- Database name: `typing-planet`.
- Schema version: integer; increments on any breaking change. Current version: **1**.
- All access goes through a thin repository layer at `src/storage/repositories/`. Stores are never touched directly from components.

### Object stores (v1)

| Store           | Key       | Purpose                                                       |
| --------------- | --------- | ------------------------------------------------------------- |
| `lessonResults` | `[lessonId, completedAt]` (compound) | Every completed lesson run.            |
| `lessonBests`   | `lessonId`                            | Best-ever score per lesson (denormalized). |
| `userState`     | `'singleton'`                         | XP, level, streak, last-played, badges.    |
| `settings`      | `'singleton'`                         | User preferences.                          |
| `meta`          | `key`                                 | Misc (schema version, app first-launch, …). |

Indices:
- `lessonResults` index `byCompletedAt` on `completedAt` (timestamp; ms since epoch).
- `lessonResults` index `byLessonId` on `lessonId`.

## TypeScript Schemas

These are the canonical shapes. Implementers should mirror them exactly in `src/types/`.

```ts
// src/types/lesson.ts
export type LessonId = string; // e.g. "terra.l03"
export type PlanetId = "terra" | "aqua" | "pyra" | "numa" | "nova";

export type LessonType = "keys" | "words" | "sentences" | "paragraph";

export interface Lesson {
  id: LessonId;
  planet: PlanetId;
  order: number;            // position within planet (1-based)
  type: LessonType;
  title: { "zh-CN": string; "en-US": string };
  focusKeys?: string[];     // chars this lesson drills (informational)
  targetWpm: number;        // for 2-star threshold; 3-star = +5
  content: string[];        // lines to type; engine joins with " "
}
```

```ts
// src/types/result.ts
export interface LessonResult {
  lessonId: LessonId;
  completedAt: number;      // ms since epoch (local time captured in zone field)
  zone: string;             // IANA tz name, e.g. "Asia/Shanghai"
  durationMs: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  wpm: number;              // see typing-engine-spec.md §scoring
  accuracy: number;         // 0–1
  errorsByKey: Record<string, number>;
  errorsByFinger: Record<Finger, number>;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
}

export type Finger =
  | "lp" | "lr" | "lm" | "li"
  | "rp" | "rr" | "rm" | "ri"
  | "lt" | "rt"; // thumbs
```

```ts
// src/types/user.ts
export interface UserState {
  xp: number;
  level: number;
  streak: {
    current: number;            // consecutive days
    longest: number;
    shields: number;            // 0–2
    lastCountedDate: string;    // ISO date (YYYY-MM-DD) in user's local tz
  };
  badges: BadgeId[];
  lastPlayed?: { lessonId: LessonId; at: number };
  lifetime: {
    sessions: number;
    charsTyped: number;
    msTyped: number;
  };
}

export type BadgeId =
  | "first-steps"
  | "home-row-hero"
  | "centurion"
  | "perfectionist"
  | "night-owl"
  | "speed-demon"
  | "marathon"
  | "comeback"
  | "consistent"
  | "polyglot-keys"
  | "no-backspace"
  | "explorer";
```

```ts
// src/types/settings.ts
export interface Settings {
  locale: "zh-CN" | "en-US";
  theme: "system" | "light" | "dark";
  sound: boolean;
  haptics: boolean;
  showKeyboard: boolean;
  showFingerOverlay: boolean;
  reducedMotion: boolean;       // overrides OS pref; default null = follow OS
}
```

```ts
// src/types/lessonBest.ts
export interface LessonBest {
  lessonId: LessonId;
  bestWpm: number;
  bestAccuracy: number;
  bestStars: 0 | 1 | 2 | 3;
  attempts: number;
  firstClearedAt?: number;
}
```

## Lesson Content Source

Lesson JSON files live under `src/content/<planet>/*.json` and are **bundled at build time** via `import.meta.glob` into a typed manifest:

```ts
// src/content/index.ts (generated shape)
export const lessons: Record<LessonId, Lesson>;
export const planets: Record<PlanetId, { id: PlanetId; lessons: LessonId[] }>;
```

Bundled (not fetched at runtime) so PWA offline support is automatic. Total content payload budget: 100 KB gzipped (see [performance-budget.md](./performance-budget.md)).

Authoring schema and example JSON are in [content-spec.md](./content-spec.md).

## Derived Data

These are **never persisted** — always computed from the stores above:

- `level` from `xp` via the curve in [typing-engine-spec.md](./typing-engine-spec.md) §levels.
- `planetStatus` (`locked` / `available` / `in-progress` / `mastered`) from `lessonBests`.
- `wpmTrend30d` from `lessonResults` filtered by `byCompletedAt`.

## Export / Import

Export produces a JSON file:

```json
{
  "version": 1,
  "exportedAt": 1736784000000,
  "userState": { ... },
  "settings": { ... },
  "lessonBests": [ ... ],
  "lessonResults": [ ... ]
}
```

Import validates `version` then replaces the relevant stores in a single transaction. A pre-import snapshot is taken so a failed import auto-rolls-back. Mismatched/older `version` triggers migration before applying.

## Migrations

- Each schema version bump ships a migration function: `migrations/v{n}.ts` exporting `up(db: IDBDatabase)`.
- The migration runner runs all `up`s from `meta.schemaVersion + 1` through the current version inside the IndexedDB `upgradeneeded` callback.
- Migrations must be idempotent (re-running shouldn't corrupt state).
- After all migrations succeed, write the new version to `meta.schemaVersion`.
- If a migration throws, surface a recovery screen with options: Export raw data, Reset, Retry. Never silently drop user data.

## Quota & Limits

- IndexedDB quota varies by browser (typically ≥ 50 MB). The app aims to stay well under 5 MB for a year of daily use:
  - `lessonResults` is the main growth driver. Cap retention at 5,000 most-recent rows; prune oldest on write.
  - `lessonBests`, `userState`, `settings` are small and fixed.
- On quota errors, show a banner on Settings and switch to in-memory mode for the rest of the session.

## Privacy

All data is stored in the user's browser. There is no transport off-device. Reset and Export controls are accessible in Settings; reset clears all stores (incl. `meta`) and reloads the app.
