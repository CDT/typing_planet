# Design System

Visual language for 打字星球. All values here are normative — implementers should encode them as CSS custom properties / Tailwind theme tokens and **not** introduce ad-hoc values.

## Design Principles

1. **Calm, not loud.** Default surfaces are restrained; color and motion are reserved for feedback and reward moments.
2. **Generous spacing.** Whitespace > decoration. Crowded UIs feel like work.
3. **Type as the hero.** The typing surface uses a large monospace; everything else recedes.
4. **Consistent rhythm.** All spacing on a 4px grid. All radii from a small set.
5. **Tasteful celebration.** Confetti/sparkle only at meaningful moments (lesson complete, level up, streak milestone). Never during practice.

## Color Tokens

Semantic tokens with light and dark values. Implement via CSS custom properties on `:root` + `[data-theme="dark"]`.

### Brand / accent
| Token             | Light       | Dark        | Use                                 |
| ----------------- | ----------- | ----------- | ----------------------------------- |
| `--accent`        | `#5B6CFF`   | `#7C8BFF`   | Primary buttons, focus rings, links |
| `--accent-hover`  | `#4456E5`   | `#9CA9FF`   | Hover/active                        |
| `--accent-fg`     | `#FFFFFF`   | `#0B0F1A`   | Foreground on accent surfaces       |

### Neutrals
| Token            | Light       | Dark        | Use                                 |
| ---------------- | ----------- | ----------- | ----------------------------------- |
| `--bg`           | `#FAFBFC`   | `#0B0F1A`   | App background                      |
| `--surface`      | `#FFFFFF`   | `#121829`   | Cards, sheets                       |
| `--surface-2`    | `#F2F4F8`   | `#1A2236`   | Inset / secondary surfaces          |
| `--border`       | `#E4E8EF`   | `#27304A`   | Hairlines, dividers                 |
| `--text`         | `#1B2030`   | `#E8ECF5`   | Primary text                        |
| `--text-muted`   | `#5B6478`   | `#9AA3BB`   | Secondary text, captions            |
| `--text-faint`   | `#8B93A8`   | `#6C7691`   | Tertiary / placeholder              |

### Feedback (typing surface)
| Token              | Light       | Dark        | Use                                       |
| ------------------ | ----------- | ----------- | ----------------------------------------- |
| `--char-pending`   | `#8B93A8`   | `#6C7691`   | Untyped characters                        |
| `--char-current`   | `#1B2030`   | `#E8ECF5`   | Current caret target                      |
| `--char-correct`   | `#1B2030`   | `#E8ECF5`   | Correctly typed (same as primary text)    |
| `--char-incorrect` | `#E5484D`   | `#FF6369`   | Wrongly typed; also background tint 12% |
| `--caret`          | `#5B6CFF`   | `#7C8BFF`   | Blinking caret block                      |

### Status
| Token         | Value       | Use                          |
| ------------- | ----------- | ---------------------------- |
| `--success`   | `#2BB673`   | Mastered planets, 3-star     |
| `--warning`   | `#F5A623`   | Streak shields, warnings     |
| `--danger`    | `#E5484D`   | Destructive actions          |
| `--info`      | `#3B9EFF`   | Tips, neutral info banners   |

### Planet identity colors
Used for planet headers, lesson list accents, and progress rings. Each is a 2-stop gradient:

| Planet | Stop 1     | Stop 2     |
| ------ | ---------- | ---------- |
| Terra  | `#5EE2A0`  | `#3BB4B0`  |
| Aqua   | `#4FC3F7`  | `#3F6FE0`  |
| Pyra   | `#FFB36B`  | `#F26A3F`  |
| Numa   | `#B98CFF`  | `#7C53E5`  |
| Nova   | `#FFD66B`  | `#E58E3F`  |

### Finger heatmap colors
Index/middle/ring/pinky/thumb each map to a unique hue used in the virtual keyboard finger overlay and in the per-finger error heatmap on Results. Defined in [content-spec.md](./content-spec.md) §finger-map.

## Typography

| Role                 | Font family                              | Size  | Weight | Line height |
| -------------------- | ---------------------------------------- | ----- | ------ | ----------- |
| Display              | Inter, "PingFang SC", system-ui          | 40/48 | 700    | 1.1         |
| H1                   | Inter, "PingFang SC", system-ui          | 28    | 600    | 1.2         |
| H2                   | Inter, "PingFang SC", system-ui          | 22    | 600    | 1.3         |
| Body                 | Inter, "PingFang SC", system-ui          | 16    | 400    | 1.5         |
| Caption              | Inter, "PingFang SC", system-ui          | 13    | 500    | 1.4         |
| Typing surface       | "JetBrains Mono", "Sarasa Mono SC", monospace | 32 | 500 | 1.6 |
| Stats numerals       | "JetBrains Mono", monospace               | 36/56 | 600    | 1.0         |

Self-host Inter and JetBrains Mono (woff2 subset; latin + latin-ext). CJK falls back to system fonts — do not bundle CJK webfonts (size cost).

Apply `font-variant-numeric: tabular-nums` on all stats so digits don't jitter as they count.

## Spacing Scale

4px grid. Tailwind defaults align. Use scale steps `0, 1, 2, 3, 4, 6, 8, 12, 16, 24` (×4px). Avoid arbitrary values.

## Radii

| Token             | Value | Use                          |
| ----------------- | ----- | ---------------------------- |
| `--radius-sm`     | 6px   | Inputs, small chips          |
| `--radius-md`     | 12px  | Buttons, cards               |
| `--radius-lg`     | 20px  | Sheets, large cards          |
| `--radius-pill`   | 999px | Pills, badges                |

## Elevation

Two levels only. No heavy drop shadows.
- `--shadow-sm`: `0 1px 2px rgba(16, 24, 40, 0.06)`
- `--shadow-md`: `0 6px 24px rgba(16, 24, 40, 0.08)`

In dark mode, shadows are replaced by a 1px inner border `rgba(255,255,255,0.04)` — light shadows look muddy on dark surfaces.

## Iconography

Use [Lucide](https://lucide.dev) icons exclusively. 24px default, 20px in dense contexts, 1.5px stroke. No mixing of icon libraries. Planet icons are custom SVGs (see `src/assets/planets/`).

## Motion

| Curve            | CSS                                         | Use                            |
| ---------------- | ------------------------------------------- | ------------------------------ |
| `--ease-out`     | `cubic-bezier(0.16, 1, 0.3, 1)`             | Enters                         |
| `--ease-in`      | `cubic-bezier(0.7, 0, 0.84, 0)`             | Exits                          |
| `--ease-spring`  | `cubic-bezier(0.34, 1.56, 0.64, 1)`         | Stars, badges, level-up reveals |

Durations: `--dur-fast: 120ms`, `--dur-med: 220ms`, `--dur-slow: 420ms`. Under `prefers-reduced-motion`, durations collapse to 0 and transitions become opacity-only crossfades at 80ms.

## Sound

3 SFX, all ≤ 30 KB, encoded as `audio/ogg; opus`:
- `key-correct.opus` — soft click (–14 LUFS).
- `key-wrong.opus` — muted thud (–14 LUFS).
- `complete.opus` — short chime on lesson finish.

Preload eagerly on first user gesture (browser autoplay policy). Mute toggle persisted in settings.

## Component Conventions

- **Buttons**: 4 variants — `primary`, `secondary`, `ghost`, `danger`. 3 sizes — `sm` (32px), `md` (40px), `lg` (52px).
- **Focus**: 2px solid `--accent` outline with 2px offset, never removed. Visible only on `:focus-visible`.
- **Disabled**: 40% opacity, no events, no focus.
- **Touch targets**: ≥ 44×44px on mobile.

## Breakpoints

| Name | Min width | Notes                              |
| ---- | --------- | ---------------------------------- |
| sm   | 480px     | Large phones                       |
| md   | 768px     | Tablets, split-screen              |
| lg   | 1024px    | Desktop default                    |
| xl   | 1280px    | Wide desktop                       |

The practice screen is centered with a max-width of 880px regardless of viewport. Below `sm`, the virtual keyboard is hidden by default (toggle in Settings).

## Accessibility Defaults

- Minimum contrast 4.5:1 for body text, 3:1 for large text — see [accessibility.md](./accessibility.md).
- All interactive elements have visible focus rings.
- No information conveyed by color alone; pair with iconography or text.
