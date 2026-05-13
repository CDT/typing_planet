# Wireframes

ASCII layouts for each screen. Use as a structural reference; visual treatment is per [design-system.md](./design-system.md). Layouts shown at desktop (lg ≥ 1024px); mobile collapses the left rail into a bottom tab bar.

## Layout Shell (desktop)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌─────┐                                                                  │
│ │ 🪐  │   ┌──────────────────────────────────────────────────────────┐   │
│ │ Gal │   │                                                          │   │
│ │ axy │   │                                                          │   │
│ │     │   │                       <route view>                       │   │
│ │ 👤  │   │                                                          │   │
│ │ Me  │   │                                                          │   │
│ │     │   │                                                          │   │
│ │ ⚙   │   │                                                          │   │
│ │ Set │   │                                                          │   │
│ └─────┘   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
   rail 88px        main, centered max-width 1120px, 24px gutter
```

## S2 — Planet Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Hi there 👋        🔥 5-day streak           Level 7 ▮▮▮▮▯▯▯▯▯▯ 320 XP │
│                                                                          │
│                                                                          │
│                                            ✨                            │
│                                      ╭─────────╮                         │
│                                      │  NOVA   │  🔒                     │
│                                      │ ⭐ ⭐ ⭐ │                         │
│                                      ╰─────────╯                         │
│                          ╲                                               │
│                           ╲ ╭─────────╮                                  │
│                             │  NUMA   │  🔒                              │
│                             │ ⭐ ⭐ ⭐ │                                  │
│                             ╰─────────╯                                  │
│                              ╱                                           │
│                       ╭─────────╮                                        │
│                       │  PYRA   │  🔒                                    │
│                       │ ⭐ ⭐ ⭐ │                                        │
│                       ╰─────────╯                                        │
│                        ╲                                                 │
│                         ╲ ╭─────────╮                                    │
│                           │  AQUA   │  available                         │
│                           │ ⭐ ⭐ ☆ │                                    │
│                           ╰─────────╯                                    │
│                            ╱                                             │
│                     ╭─────────╮                                          │
│                     │  TERRA  │  mastered                                │
│                     │ ⭐ ⭐ ⭐ │                                          │
│                     ╰─────────╯                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Planets sit along a curved path; the camera centers on the user's current planet on load.
- Locked planets are desaturated with a lock badge.
- Each planet renders its planet-identity gradient (see [design-system.md](./design-system.md) §planet identity colors).

## S3 — Lesson List

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Back to Galaxy                                                        │
│                                                                          │
│  ╭──────╮   TERRA                                                        │
│  │ 🌱   │   Home row — asdf jkl;                                         │
│  ╰──────╯   8 lessons · 7 mastered                                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 1.  Touch home  ⭐⭐⭐    Best 42 WPM · 99%        [ Replay ]       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 2.  Find F & J  ⭐⭐⭐    Best 40 WPM · 98%        [ Replay ]       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 3.  Add S & L   ⭐⭐⭐    Best 38 WPM · 97%        [ Replay ]       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 4.  A & ;       ⭐⭐⭐    Best 36 WPM · 96%        [ Replay ]       │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 5.  Drill mix   ⭐⭐☆    Best 34 WPM · 92%        [ Continue ]     │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 6.  Words I     ☆☆☆    —                          [ Start  ▶ ]    │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 7.  Sentences I 🔒      Complete lesson 6 to unlock                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## S4 — Practice

```
┌──────────────────────────────────────────────────────────────────────────┐
│   ⏸ Pause              ▮▮▮▮▮▮▯▯▯▯  62%       42 WPM   ·   97%  ·  0:34  │
│                                                                          │
│                                                                          │
│       the quick brown fox jumps over                                     │
│       ████████████▕░░░░░░░░░░░░░░░░░░░                                  │
│       the lazy dog and runs ahead                                        │
│                                                                          │
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  ` 1 2 3 4 5 6 7 8 9 0 - = ⌫                                       │ │
│   │  ⇥  q w e r t y u i o p [ ] \                                      │ │
│   │  ⇪  a s d f g h j k l ; ' ↵                                        │ │
│   │  ⇧    z x c v b n m , . /  ⇧                                       │ │
│   │             ▔▔▔▔▔▔▔ space ▔▔▔▔▔▔▔                                  │ │
│   └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│         pinky · ring · middle · index · thumb   (color legend)           │
└──────────────────────────────────────────────────────────────────────────┘
```

- Top bar: pause, progress bar, WPM, accuracy, time. Always visible, no scroll.
- Text area: 3 lines max visible. The current line is centered; finished lines fade up and out; upcoming lines slide in from below.
- Caret is a colored block highlighting the current char. Incorrect chars render in `--char-incorrect` with a 12% tint background.
- Virtual keyboard shows the next-key highlight (pulse animation, 1.2s loop). Finger overlay (small colored dot under each key) toggle in Settings.

## S5 — Results

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            Lesson Complete                               │
│                                                                          │
│                          ⭐  ⭐  ⭐                                       │
│                                                                          │
│                                                                          │
│        WPM                ACCURACY              TIME                    │
│        42                 97%                   0:42                    │
│                                                                          │
│        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                                                          │
│        +180 XP   ·   🔥 6-day streak (new!)   ·   Badge: Home Row Hero  │
│                                                                          │
│        Error heatmap                                                     │
│        ┌───────────────────────────────┐                                 │
│        │ keyboard graphic w/ red dots  │                                 │
│        └───────────────────────────────┘                                 │
│                                                                          │
│        [ ↻ Retry ]    [ Next lesson  → ]    [ Back to planet ]          │
└──────────────────────────────────────────────────────────────────────────┘
```

- Stars pop in sequentially with `--ease-spring` (0/180/360ms).
- WPM/accuracy/time count up in parallel over 600ms.
- New badge (if any) slides in from below with a subtle glow.

## S6 — Progress / Me

```
┌──────────────────────────────────────────────────────────────────────────┐
│   Me                                                                     │
│                                                                          │
│   ┌─ Lifetime ──────────────────┐  ┌─ This week ───────────────────┐    │
│   │  Sessions       142          │  │   M  T  W  T  F  S  S          │    │
│   │  Chars typed    38,402       │  │   ●  ●  ●  ●  ●  ○  ○          │    │
│   │  Avg WPM        37           │  │   5-day streak 🔥              │    │
│   └──────────────────────────────┘  └────────────────────────────────┘    │
│                                                                          │
│   WPM over last 30 days                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐    │
│   │   .─.       _.─'─.                                              │    │
│   │  /   \    _/      \_                                            │    │
│   │ /     \__/          \___.─                                      │    │
│   └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│   Badges (4 / 12)                                                        │
│   [🏅] [🎯] [🚀] [🌙] [?] [?] [?] [?] [?] [?] [?] [?]                    │
└──────────────────────────────────────────────────────────────────────────┘
```

## S7 — Settings

```
┌──────────────────────────────────────────────────────────────────────────┐
│   Settings                                                               │
│                                                                          │
│   Display                                                                │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  Language           [ 中文 ▾ ]                                     │ │
│   │  Theme              ( system ) ( light ) ( dark )                  │ │
│   │  Reduced motion     [ ◯ off ]                                      │ │
│   └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│   Practice                                                               │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  Sound effects      [ ● on  ]                                      │ │
│   │  Haptics (mobile)   [ ● on  ]                                      │ │
│   │  Virtual keyboard   [ ● on  ]                                      │ │
│   │  Finger overlay     [ ◯ off ]                                      │ │
│   └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│   Data                                                                   │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  [ Export progress ]   [ Import progress ]                         │ │
│   │  [ Reset all data… ]   (irreversible)                              │ │
│   └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│   About                                                                  │
│   ┌────────────────────────────────────────────────────────────────────┐ │
│   │  Version 1.0.0   ·   Open-source credits   ·   Privacy policy      │ │
│   └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

## Mobile adaptations (< md)

- Left rail → bottom tab bar (Galaxy / Me / Settings).
- Planet map zooms in; tap-and-drag pans the galaxy.
- Practice screen: virtual keyboard hidden by default; tap progress bar to reveal HUD details.
- Results: stars stack above stats; CTAs become full-width stacked buttons.

## Modal / Sheet patterns

- **Pause modal** (S4): centered card, dark scrim. CTAs: Resume (primary), Quit (ghost).
- **Resume on focus return** (S4): same card with copy "You were typing — keep going?". CTAs: Resume, Quit.
- **Reset confirmation** (S7): danger style; requires typing "RESET" into a confirm field.
- **Update available** (any): bottom toast, dismissible; reload button.
