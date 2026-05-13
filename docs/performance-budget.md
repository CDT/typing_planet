# Performance Budget

Hard limits and target metrics. CI fails when budgets are exceeded. Lighthouse checks enforce these on production builds.

## Reference Device

All targets assume the **Moto G Power (2022)** as the low-end baseline, throttled to 4× CPU slowdown and "Slow 4G" network in Lighthouse. Performance can be better on real devices; it must not be worse.

## Bundle Size

Reported as transfer size (Brotli-compressed) of files served on a cold first-load of the home route (`/map`).

| Asset class                              | Budget (br) | Notes                                            |
| ---------------------------------------- | ----------- | ------------------------------------------------ |
| Initial JS (`index.html` boot path)      | **120 KB**  | App shell, router, providers, map page.          |
| Initial CSS                              | **15 KB**   | Tailwind purged + tokens.                        |
| Per-route lazy JS chunk (avg)            | 30 KB       | Pages: planet, practice, results, me, settings.  |
| Lesson content (per-planet chunk)        | 20 KB       | All 8–12 lessons for one planet.                 |
| Fonts (initial)                          | 60 KB       | Inter latin subset + JetBrains Mono subset.      |
| Icons (PWA)                              | 30 KB       | Combined; non-blocking.                          |
| SFX (3 files combined)                   | 90 KB       | `audio/ogg; opus`; preloaded on first gesture.   |
| **Total initial transfer**               | **≤ 250 KB**| Excluding SFX (loaded on first interaction).     |

Fail condition: any single budget exceeded by > 10%, or total initial transfer > 250 KB.

## Core Web Vitals (lab)

Measured in Lighthouse on the home route:

| Metric | Target           |
| ------ | ---------------- |
| LCP    | ≤ 1.8s           |
| INP    | ≤ 150ms          |
| CLS    | ≤ 0.02           |
| TBT    | ≤ 150ms          |

INP is the most important metric for a typing app — input latency must feel instantaneous.

## Practice screen latency

Field measurement, not Lighthouse:

| Metric                                             | Target |
| -------------------------------------------------- | ------ |
| Keystroke → engine state updated                    | < 1ms p99 |
| Engine state update → DOM frame painted             | < 16ms p99 (1 frame at 60Hz) |
| Keystroke → audible feedback (when sound enabled)   | < 50ms p99 |

A perf test in `tests/perf/typing.bench.ts` runs the engine over a synthetic 2,000-char input and reports p99 update time. Fails the build if > 1ms.

## Memory

| Metric                                        | Target  |
| --------------------------------------------- | ------- |
| Heap after 5 lessons completed                | ≤ 80 MB |
| Heap retained after navigating away from S4   | ≤ 50 MB |

Measured via `mcp__chrome-devtools__take_memory_snapshot` against the production preview during the E2E suite. Heap leaks are typically caused by un-disposed event listeners on `keydown` — see [testing-strategy.md](./testing-strategy.md) §perf.

## Asset Optimization Checklist

- [ ] Fonts subset to latin + latin-ext (no CJK glyphs bundled; system fallback).
- [ ] Fonts served as `woff2` only. No legacy formats.
- [ ] Images: SVG preferred. Raster icons compressed with `oxipng -o 4 --strip safe`.
- [ ] PWA icons generated from a single SVG source.
- [ ] No moment/luxon/lodash bundled (use platform APIs).
- [ ] Lucide icons imported by name — verify via bundle analyzer that the barrel is shaken out.
- [ ] No unused Tailwind classes (`content` paths set correctly in `tailwind.config.ts`).
- [ ] React DevTools production build (`NODE_ENV=production`).

## Lighthouse CI

`.lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/map", "http://localhost:4173/lesson/terra.l01"],
      "settings": { "preset": "mobile" }
    },
    "assert": {
      "assertions": {
        "categories:performance":   ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 1.00 }],
        "categories:best-practices":["error", { "minScore": 0.95 }],
        "categories:pwa":           ["error", { "minScore": 1.00 }]
      }
    }
  }
}
```

Runs on PRs touching `src/`, `vite.config.ts`, `tailwind.config.ts`, or `public/`.

## Bundle Analysis

`pnpm build:analyze` runs the build with `rollup-plugin-visualizer` and opens an interactive treemap. Use to investigate any budget regression before merging.
