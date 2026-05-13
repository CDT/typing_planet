# Accessibility

WCAG 2.1 AA is the target. The typing surface has the trickiest a11y story; this doc spells out the behavior.

## Universal Requirements

- All interactive elements reachable by keyboard in a logical order.
- Visible focus indicator on every focusable element (`:focus-visible` 2px outline in `--accent`).
- Color contrast ≥ 4.5:1 for body text; ≥ 3:1 for large text and UI components against adjacent colors.
- No information conveyed by color alone — pair with icon or text.
- All non-text content has accessible names (`aria-label`, `alt`, or visible text).
- Touch targets ≥ 44×44 CSS px on mobile.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Page language is set on `<html lang>` and updates when the user switches locale.

## Keyboard Navigation

| Screen          | Tab order                                                              | Notes                                       |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| S2 Planet Map   | Header → planet nodes (in path order) → nav rail                       | Arrow keys also move between planets        |
| S3 Lesson List  | Back → lesson rows in order → primary CTA on each row                  |                                             |
| S4 Practice     | Pause → typing surface (focused by default on countdown end)           | Typing surface receives all printable keys  |
| S5 Results      | Retry → Next → Back to planet                                          | Enter = Next, R = Retry, Esc = Back         |
| S6 Me           | Lifetime card → week strip → trend chart → badges grid                 |                                             |
| S7 Settings     | Section by section, top to bottom                                      |                                             |

A skip-link "Skip to main content" is the first focusable element on every page.

## Typing Surface a11y

The biggest a11y challenge: a screen reader announcing every character would be intolerable. Strategy:

- The typing surface is a single focusable element with `role="textbox"` and `aria-label` describing the lesson (e.g. "Practice: Touch home").
- `aria-readonly="true"` (the user types into the engine, not into a real input).
- Live region updates are **scoped to line breaks**, not per char. When the user finishes a line, an `aria-live="polite"` region announces "Line 2 of 3 complete."
- On session complete, a single polite announcement: "Lesson complete. 42 words per minute, 97% accuracy, 3 stars."
- The virtual keyboard is `aria-hidden="true"` — it's a visual aid only.

Per-char correctness is conveyed via:
- Color (`--char-correct` / `--char-incorrect`) — primary.
- A subtle underline on incorrect chars — secondary, ensures non-color signal.
- An optional setting "Announce errors" (default off): when on, errors trigger a polite assertive announcement of the expected char.

## Reduced Motion

`@media (prefers-reduced-motion: reduce)`:
- All durations collapse to `0` except 80ms opacity crossfades.
- Confetti, planet orbits, and the caret-blink animation are disabled.
- Star pop-in becomes an instant render.
- Layout shifts that depend on animation completion still play (uses `prefers-reduced-motion` aware transitions).

Settings includes an explicit "Reduced motion" toggle that overrides the OS preference when set.

## Color & Theme

- Dark mode is fully supported (CSS custom properties).
- The accent palette has been picked to meet AA against both backgrounds. Verified contrast ratios:

| Pair                                    | Ratio  |
| --------------------------------------- | ------ |
| `--text` on `--bg` (light)              | 16.4:1 |
| `--text-muted` on `--bg` (light)        | 5.7:1  |
| `--accent-fg` on `--accent` (light)     | 8.5:1  |
| `--text` on `--bg` (dark)               | 14.1:1 |
| `--text-muted` on `--bg` (dark)         | 6.1:1  |
| `--accent-fg` on `--accent` (dark)      | 13.2:1 |

A "high-contrast" theme is **not** included in v1.0 — defer to OS-level contrast.

## Forms & Inputs

- Every input has a visible label (the design avoids placeholder-as-label).
- Error messages use `aria-describedby` linking input to the error text.
- "Reset all data" confirm field uses `autocomplete="off"` and requires literal "RESET" — case-sensitive on purpose.

## Modals

- Use a focus trap; first focus lands on the modal's primary heading or first CTA.
- Esc closes the modal and returns focus to the trigger.
- The page behind a modal is `inert` (`inert` attribute) so screen readers don't read past it.

## ARIA Live Regions

| Region                      | politeness  | Trigger                                    |
| --------------------------- | ----------- | ------------------------------------------ |
| Toast container             | polite      | New toast appears                          |
| Lesson completion           | polite      | Session ends; one announcement             |
| Streak update               | polite      | Streak count changes                       |
| Update available banner     | polite      | SW reports new version                     |
| "Error" announcer (optional)| assertive   | Only when user has enabled "Announce errors" |

No `aria-live` on the typing surface itself.

## Screen Reader Verification

Tested on:
- NVDA (latest) + Chrome on Windows
- VoiceOver + Safari on macOS
- VoiceOver + Safari on iOS 17+
- TalkBack + Chrome on Android

A release ships only after a manual walkthrough on at least NVDA/Chrome and VoiceOver/iOS.

## Internationalization Considerations

- All strings come from i18n bundles — see [i18n.md](./i18n.md).
- Language change updates `<html lang>` immediately.
- CJK fonts render via system fallback (no bundled CJK webfont).
- RTL is **not** supported in v1.0 (no Arabic/Hebrew content); the layout uses logical properties (`padding-inline-start`, etc.) so future RTL is feasible.

## Testing & Tooling

- `vitest-axe` runs axe-core on every component test; zero violations required.
- ESLint `jsx-a11y` rule set at strict.
- Playwright spec `tests/e2e/a11y.spec.ts` runs axe on each main route.
- Manual screen reader walkthroughs are part of the release manual QA checklist (see [testing-strategy.md](./testing-strategy.md)).
