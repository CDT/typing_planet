# Typing Engine Spec

The pure-TS module that owns timing, character matching, error tracking, WPM/accuracy math, and scoring. Lives in `src/features/engine/` and has **zero** React dependencies. Tests live next to source.

## Interfaces

```ts
// engine.ts
export interface EngineConfig {
  text: string;             // target text after joining content lines with " "
  startedAt?: number;       // ms epoch; if absent, set on first keystroke
  allowBackspace: boolean;  // default true
  strictMode: boolean;      // default false; if true, must fix errors before advancing
}

export interface EngineState {
  text: string;
  cursor: number;           // index of next char to type
  typed: TypedChar[];       // length === cursor
  startedAt: number | null;
  endedAt: number | null;
  config: EngineConfig;
  errors: ErrorEvent[];
  pausedMs: number;         // total time in paused state
  lastPauseAt: number | null;
}

export interface TypedChar {
  expected: string;
  actual: string;
  correct: boolean;
  at: number;               // ms epoch of keystroke
  finger: Finger;           // derived from expected via finger-map
}

export interface ErrorEvent {
  at: number;
  index: number;            // position in text
  expected: string;
  actual: string;
}
```

```ts
// engine pure functions
export function createSession(cfg: EngineConfig): EngineState;
export function handleInput(state: EngineState, key: string, atMs: number): EngineState;
export function handleBackspace(state: EngineState, atMs: number): EngineState;
export function pause(state: EngineState, atMs: number): EngineState;
export function resume(state: EngineState, atMs: number): EngineState;
export function isComplete(state: EngineState): boolean;
export function summarize(state: EngineState): SessionSummary;
```

All functions are pure — they return a new `EngineState` rather than mutating.

## Input Policy

### Allowed input
- Printable ASCII chars (`U+0020`–`U+007E`).
- `Backspace` if `config.allowBackspace`.
- `Enter` is treated as a literal space if the target text contains a `\n`-joined boundary; otherwise ignored.

### Ignored input
- Modifier-only keys (Shift/Ctrl/Alt/Meta) without a character.
- Function keys, arrows, Home/End, Page Up/Down, Tab.
- `Esc` is handled by the UI (pause), not the engine.

### IME / composition events
- During an active composition (`compositionstart` … `compositionend`), the engine accepts no input. Only the final committed string is delivered to `handleInput` one char at a time.
- Pinyin/CJK lesson content is **out of scope for v1.0** (see [product-spec.md](./product-spec.md)).

### Error advancement policy
- Default (`strictMode = false`): a wrong char is recorded as an error AND advances the cursor. The user can `Backspace` to fix it; otherwise the wrong char remains marked incorrect on the rendered text.
- Strict mode: a wrong char is recorded as an error and does **not** advance the cursor. The user must type the correct char (or backspace, if allowed) to proceed.
- v1.0 default is non-strict. Strict mode is a setting available in v1.1 (see [roadmap.md](./roadmap.md)).

### Backspace policy
- Backspace removes the last `TypedChar` and decrements the cursor.
- Backspacing past the start of the session is a no-op.
- Backspace does **not** delete recorded `ErrorEvent`s (we count every error for accuracy stats, even if the user corrected it).

### Timing
- The session start clock begins on the **first valid keystroke**, not on countdown end. This rewards user focus and prevents penalties for hesitation.
- Paused time is excluded from elapsed time. `elapsedMs = (endedAt ?? now) - startedAt - pausedMs`.
- A session auto-pauses when the host calls `pause()`. The host calls `pause()` on `blur`, on Esc, and on visibility change to hidden.

## Math

### WPM (words per minute)
Use the standard 5-character word convention:

```
wpm = (correctChars / 5) / (elapsedMs / 60000)
```

- `correctChars` counts only chars whose `correct: true`.
- Round to nearest integer for display; carry full precision for thresholds.
- If `elapsedMs < 1000`, WPM is reported as `0` (avoid divide-by-tiny inflation on aborted sessions).

### Raw WPM
Includes incorrect chars. Used internally for debugging only; never shown.

```
rawWpm = (typed.length / 5) / (elapsedMs / 60000)
```

### Accuracy

```
accuracy = correctChars / max(1, typed.length + uncorrectedErrors)
```

Where `uncorrectedErrors` is the count of `ErrorEvent`s whose target index was never subsequently corrected. Simpler operational formula:

```
accuracy = correctChars / (correctChars + totalErrorCount)
```

…where `totalErrorCount = errors.length`. Both formulas match in non-strict mode without backspace; the explicit form above is exact when backspace is involved. Use the explicit form.

### Consistency (advisory; shown on Results only if ≥ 30 chars typed)
Coefficient of variation of per-second WPM. Lower is more consistent. Not used for scoring.

## Scoring

### Stars per lesson
```
stars =
  3 if accuracy ≥ 0.97 && wpm ≥ targetWpm + 5
  2 if accuracy ≥ 0.90 && wpm ≥ targetWpm
  1 if accuracy ≥ 0.80
  0 otherwise
```

If the user's `stars` is greater than their current `lessonBests[id].bestStars`, the best is updated. Best WPM and best accuracy are tracked independently (a session that improves either updates the corresponding best, regardless of stars).

### XP per lesson
```
baseXp = 100
accMult = clamp((accuracy - 0.5) / 0.5, 0, 1)        // 0 at 50% acc, 1 at 100%
speedMult = clamp(wpm / max(20, targetWpm * 2), 0.25, 2.0)
xp = round(baseXp * (0.5 + 0.5 * accMult) * speedMult)
```

A user who first-clears a lesson at exactly target WPM with 95% accuracy earns ~95 XP. A repeat clear earns the same XP only if it improves over the prior best; otherwise the XP is reduced to `floor(xp * 0.25)` to discourage farming.

### Player levels
20 levels with a gentle-then-steeper curve. XP to reach level `n` from level 1:

```
xpToReach(n) = round(50 * (n - 1) ^ 1.6)
```

Yielding (approximate): L2=50, L5=480, L10=2,000, L15=4,400, L20=7,800.

## Finger Map

Maps target chars (lowercase) to fingers. Uppercase letters map to the same finger as the lowercase letter; the opposite-hand pinky handles Shift.

```
left pinky    (lp): ` 1 q a z
left ring     (lr): 2 w s x
left middle   (lm): 3 e d c
left index    (li): 4 5 r t f g v b
right index   (ri): 6 7 y u h j n m
right middle  (rm): 8 i k ,
right ring    (rr): 9 o l .
right pinky   (rp): 0 - = [ ] \ p ; ' /
thumbs        (lt, rt): space
```

(Same as the `FINGER_MAP` constant exported from `engine/finger-map.ts`. Authoritative source: [content-spec.md](./content-spec.md) §finger-map.)

## Public Output Shape

```ts
export interface SessionSummary {
  durationMs: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  wpm: number;
  accuracy: number;          // 0–1
  consistency: number | null;
  errorsByKey: Record<string, number>;
  errorsByFinger: Record<Finger, number>;
}
```

The store calls `summarize(state)` once `isComplete(state) === true` and persists the result via `progressStore.recordResult(...)`.

## Determinism & Testability

- Engine functions accept an explicit `atMs` rather than calling `Date.now()` internally. Tests pass synthetic timestamps.
- No randomness anywhere in the engine.
- Test corpus: golden inputs in `engine.test.ts` covering correct typing, mistakes, mistakes-then-backspace, pause/resume, IME-bracketed input, and edge cases (empty string, single char, lone backspace at start).

## Performance

- Input handler must complete in < 1ms p99. The current state is a plain object with `typed: TypedChar[]` (append-only); avoid array spreads that copy the whole list.
- Use a structural-sharing approach: return `{ ...state, typed: [...state.typed, ch], cursor: cursor + 1 }`. For 1,000-char lessons this is well under the budget; if benchmarks ever show contention, switch to an immer-style draft.

## Cross-references

- Settings that affect engine: `strictMode` (v1.1), `allowBackspace` (always `true` in v1.0).
- Result payload consumed by `progressStore` — see [data-model.md](./data-model.md) §LessonResult.
- Score thresholds drive star rendering — see [wireframes.md](./wireframes.md) §S5.
