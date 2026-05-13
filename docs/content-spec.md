# Content Spec

Lesson authoring format, planet catalog, badge rules, finger map. Lesson files are bundled at build time — see [architecture.md](./architecture.md) §lesson-content-source.

## File Layout

```
src/content/
├── index.ts                 ← auto-built manifest (do not edit by hand)
├── terra/
│   ├── 01-touch-home.json
│   ├── 02-find-f-j.json
│   └── ...
├── aqua/
│   └── ...
├── pyra/
├── numa/
├── nova/
└── badges.json              ← badge definitions
```

The manifest is produced by `scripts/build-content.ts` from `import.meta.glob('./**/*.json')` at build time. Validation runs as part of `npm run typecheck`.

## Lesson JSON Schema

```jsonc
{
  "$schema": "../lesson.schema.json",
  "id": "terra.l01",                                  // <planet>.l<order>; must match file order
  "planet": "terra",                                  // one of: terra | aqua | pyra | numa | nova
  "order": 1,                                         // 1-based; unique within planet
  "type": "keys",                                     // keys | words | sentences | paragraph
  "title": {
    "zh-CN": "认识键盘 · 主行",
    "en-US": "Meet the home row"
  },
  "focusKeys": ["f", "j"],                            // optional; chars this lesson drills
  "targetWpm": 15,                                    // baseline for 2-star; +5 for 3-star
  "content": [
    "fff jjj fff jjj fjf jfj",
    "ff jj ff jj fj fj fj fj",
    "fjfj jfjf ffjj jjff fj"
  ]                                                   // lines joined with " " when fed to engine
}
```

### Validation rules
- `id` must match the file path: `<planet>/<order>-<slug>.json` → `id: "<planet>.l<order>"`.
- `order` must be unique within a planet and contiguous starting at 1.
- `targetWpm` must be `5 ≤ targetWpm ≤ 80`.
- `content` non-empty; each line ≤ 80 chars; only printable ASCII (no tabs, no CR).
- For `type: "keys"` lessons, every char (other than space) in `content` must appear in `focusKeys` or in any *earlier* lesson's `focusKeys` within the same planet (progressive disclosure).

A JSON schema file lives at `src/content/lesson.schema.json` and is enforced in CI.

## Authoring Guidelines

| Lesson type     | Line length | Repetition | Notes                                                        |
| --------------- | ----------- | ---------- | ------------------------------------------------------------ |
| `keys`          | 20–40 chars | high       | Drill-style; aim for muscle memory.                          |
| `words`         | 30–60 chars | moderate   | Pull from a curated 500-word list (`src/content/_wordlist.txt`). |
| `sentences`     | 40–80 chars | low        | Complete sentences; varied subjects; family-friendly only.   |
| `paragraph`     | 60–80 chars | low        | 1–2 sentences flowing together; Nova-tier only.              |

Family-friendly content is mandatory (audience is K-12). No politics, religion, violence, brand names, or adult themes. Reuse the wordlist where possible; new words must be common English.

## Planet Catalog (v1.0)

| Planet | Theme               | Key focus                                | Lessons | Target WPM range |
| ------ | ------------------- | ---------------------------------------- | ------- | ---------------- |
| Terra  | Home base           | `asdf jkl;` and space                    | 8       | 12–22            |
| Aqua   | Ocean world         | Top row `qwertyuiop` + home row          | 10      | 18–28            |
| Pyra   | Volcano world       | Bottom row `zxcvbnm,./` + everything above | 10    | 22–32            |
| Numa   | Number station      | Numbers + symbols `0–9 - = [ ] ; ' , . /` | 8     | 18–28            |
| Nova   | Cosmic capstone     | Full keyboard, common words & sentences  | 12      | 28–45            |

Total v1.0 lessons: **48**. A content reviewer (or the implementing agent) is responsible for filling every file.

### Terra detailed lesson outline (example)
1. Touch home — `f j fff jjj`
2. Find F & J — `fjf jfj fjfj`
3. Add S & L — `fsl jks ssll`
4. A & ; — `as; ;la`
5. Drill mix — all 8 home keys
6. Words I — `add ask sad jail flask`
7. Words II — `salad falls jak alas`
8. Sentence I — `a sad lad asks a flask`

Other planets follow the same scaffolding pattern.

## Badge Definitions

```jsonc
// src/content/badges.json
{
  "first-steps":     { "trigger": "first_lesson_complete" },
  "home-row-hero":   { "trigger": "all_terra_lessons_3stars" },
  "centurion":       { "trigger": "lifetime_sessions_>=_100" },
  "perfectionist":   { "trigger": "any_lesson_3stars" },
  "night-owl":       { "trigger": "lesson_completed_between_22_and_05_local" },
  "speed-demon":     { "trigger": "wpm_>=_50_in_any_lesson" },
  "marathon":        { "trigger": "streak_>=_30_days" },
  "comeback":        { "trigger": "streak_resumed_after_shield_used" },
  "consistent":      { "trigger": "7_day_streak" },
  "polyglot-keys":   { "trigger": "language_toggled_in_settings" },
  "no-backspace":    { "trigger": "lesson_complete_with_zero_backspace_uses" },
  "explorer":        { "trigger": "all_planets_unlocked" }
}
```

Each trigger key corresponds to a check implemented in `src/features/badges/rules.ts`. New badges in future versions require both a JSON entry and a rule.

## Finger Map (authoritative)

```ts
// src/features/engine/finger-map.ts
export const FINGER_MAP: Record<string, Finger> = {
  "`": "lp", "1": "lp", "q": "lp", "a": "lp", "z": "lp",
  "2": "lr", "w": "lr", "s": "lr", "x": "lr",
  "3": "lm", "e": "lm", "d": "lm", "c": "lm",
  "4": "li", "r": "li", "f": "li", "v": "li",
  "5": "li", "t": "li", "g": "li", "b": "li",
  "6": "ri", "y": "ri", "h": "ri", "n": "ri",
  "7": "ri", "u": "ri", "j": "ri", "m": "ri",
  "8": "rm", "i": "rm", "k": "rm", ",": "rm",
  "9": "rr", "o": "rr", "l": "rr", ".": "rr",
  "0": "rp", "-": "rp", "=": "rp",
  "p": "rp", "[": "rp", "]": "rp", "\\": "rp",
  ";": "rp", "'": "rp", "/": "rp",
  " ": "rt"                  // either thumb; report as right thumb in stats
};
```

Uppercase letters map to the lowercase letter's finger; Shift is the opposite-hand pinky (`lp` or `rp`). Symbols requiring shift (e.g. `!`) use the same finger as their unshifted version (`1` → `lp`).

### Finger colors (for keyboard overlay and Results heatmap)

| Finger | Hex      |
| ------ | -------- |
| lp     | `#FF6B6B` |
| lr     | `#F7B500` |
| lm     | `#3DDC97` |
| li     | `#4FC3F7` |
| ri     | `#7C8BFF` |
| rm     | `#B98CFF` |
| rr     | `#FF85B5` |
| rp     | `#FFB347` |
| lt, rt | `#9AA3BB` |

## Word List

`src/content/_wordlist.txt` is a curated list of ~500 common English words. Source: hand-selected for K-12 reading level; no slang, no brand names, no profanity. Words are lowercase, one per line, sorted alphabetically. The build validator enforces that all `words`/`sentences` lessons use only words from this list (proper nouns and `i` excluded).

## Adding new content

1. Drop the JSON in the right planet folder using the file-naming convention.
2. Update `targetWpm` per planet WPM range.
3. Run `npm run content:validate` (alias to the schema check).
4. Run `npm run dev` and play the lesson end-to-end.

No code changes needed — the manifest is regenerated on each build.
