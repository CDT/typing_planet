# AGENTS.md

Conventions for AI coding agents (Cursor, OpenAI Codex, Claude Code, etc.) operating on this repo. The intent of this file is to be tool-agnostic — any agent should be able to read it and start contributing without conflict.

[CLAUDE.md](./CLAUDE.md) holds the same guidance and is preserved for tools that key off that filename. **Whenever you update one, mirror the change in the other.**

## Repo at a glance

打字星球 (Typing Planet) — a pure-frontend PWA touch-typing trainer for K-12 students. No backend. Static deploy to Tencent Cloud EdgeOne.

The design specs in [`docs/`](./docs/) are the source of truth. Read [docs/requirements.md](./docs/requirements.md) → [docs/product-spec.md](./docs/product-spec.md) → [docs/architecture.md](./docs/architecture.md) before doing anything.

## How to be productive here

1. **Read the doc that matches your task** before writing code. The list is in [CLAUDE.md](./CLAUDE.md) §required-reading.
2. **Match the conventions** in [CLAUDE.md](./CLAUDE.md) §conventions. They aren't aspirational — they're enforced by CI (lint, typecheck, content validator, i18n parity check, bundle budget, Lighthouse).
3. **Stay inside the current phase** in [docs/roadmap.md](./docs/roadmap.md). If your task expands scope, raise it instead of silently widening.
4. **Run the local checks** before declaring done:
   ```bash
   pnpm lint && pnpm typecheck && pnpm test --run && pnpm build
   ```

## Decision-making boundary

| You can decide freely                                  | You must defer (raise / ask)                              |
| ------------------------------------------------------ | --------------------------------------------------------- |
| Internal implementation details inside a file/module   | Adding a top-level dependency                             |
| Refactoring within a feature folder                    | Changing folder structure or import aliases               |
| Writing/extending tests                                | Adding telemetry, analytics, or any network egress        |
| Bug fixes that don't change public APIs                | Changing the IndexedDB schema (requires a migration)      |
| Adding lesson content per the schema                   | Adding a new locale                                       |
| Tightening TypeScript types                            | Changing public engine signatures                         |

If unsure, leave a `// TODO(agent):` with a short note and skip — don't guess.

## Multi-agent etiquette

If you see signs of another agent working in parallel (open PR, branch named `agent/*`, `// WIP(agent-x)` markers), don't touch the same files. Pick adjacent work.

If you commit, use a conventional-commit prefix and identify the agent in the trailer:

```
feat(engine): add pause/resume

Co-Authored-By: <your-agent-name> <noreply@example.com>
```

## File-write rules

- **Never** edit files in `docs/` and code in the same PR unless they're causally linked. Doc updates that reflect a code change are fine in the same PR; speculative doc rewrites should be their own PR.
- **Never** add a top-level config file (eslint, prettier, tsconfig, etc.) without coordinating — the repo has one canonical location for each.
- **Never** check in `node_modules/`, `dist/`, `.env*`, or local IDE files. `.gitignore` should already cover these.

## What "done" looks like

A task is done when:
- The change matches the relevant doc (or the doc is updated and the change matches).
- `pnpm lint && pnpm typecheck && pnpm test --run && pnpm build` all pass locally.
- For UI changes: manually exercised in `pnpm dev` and described in the PR.
- For perf-sensitive changes: bundle budget still passes; no regressions in `tests/perf/`.
- The PR description references the doc(s) and phase it relates to.

## Out-of-scope shortcuts to resist

- Don't reach for a backend "just to make X easier."
- Don't add a UI library "to save time on components" — Tailwind + small primitives is the standard.
- Don't introduce a state library "because Zustand is too simple" — it isn't.
- Don't bake in third-party trackers, sentry, or "anonymous usage stats."

## When the docs are wrong

If the docs and reality diverge:
1. Note it in your PR description.
2. Update the relevant doc as part of the same PR.
3. If the disagreement is fundamental (e.g. an architectural choice no longer makes sense), open a separate "RFC" PR with a `docs:` change only — don't change code and architecture in the same diff.

## Pointers

- [CLAUDE.md](./CLAUDE.md) — full conventions.
- [docs/architecture.md](./docs/architecture.md) — stack and folder layout.
- [docs/roadmap.md](./docs/roadmap.md) — phases and what's in/out of scope per phase.
- [docs/testing-strategy.md](./docs/testing-strategy.md) — what to test and where.
