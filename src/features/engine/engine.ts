import type { Finger } from "@/types";
import { ALL_FINGERS, fingerFor } from "./finger-map";

export interface EngineConfig {
  text: string;
  allowBackspace: boolean;
  strictMode: boolean;
}

export interface TypedChar {
  expected: string;
  actual: string;
  correct: boolean;
  at: number;
  finger: Finger;
}

export interface ErrorEvent {
  at: number;
  index: number;
  expected: string;
  actual: string;
}

export interface EngineState {
  text: string;
  cursor: number;
  typed: TypedChar[];
  startedAt: number | null;
  endedAt: number | null;
  config: EngineConfig;
  errors: ErrorEvent[];
  pausedMs: number;
  lastPauseAt: number | null;
}

export interface SessionSummary {
  durationMs: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  wpm: number;
  accuracy: number;
  errorsByKey: Record<string, number>;
  errorsByFinger: Record<Finger, number>;
}

export function createSession(cfg: EngineConfig): EngineState {
  return {
    text: cfg.text,
    cursor: 0,
    typed: [],
    startedAt: null,
    endedAt: null,
    config: { ...cfg },
    errors: [],
    pausedMs: 0,
    lastPauseAt: null,
  };
}

function isPaused(state: EngineState): boolean {
  return state.lastPauseAt !== null;
}

function ensureStarted(state: EngineState, atMs: number): EngineState {
  if (state.startedAt !== null) return state;
  return { ...state, startedAt: atMs };
}

export function handleInput(state: EngineState, key: string, atMs: number): EngineState {
  if (state.endedAt !== null) return state;
  if (isPaused(state)) return state;
  if (state.cursor >= state.text.length) return state;
  if (key.length !== 1) return state;

  const started = ensureStarted(state, atMs);
  const expected = started.text[started.cursor]!;
  const correct = key === expected;
  const newTyped: TypedChar = {
    expected,
    actual: key,
    correct,
    at: atMs,
    finger: fingerFor(expected),
  };

  const errors = correct
    ? started.errors
    : [
        ...started.errors,
        { at: atMs, index: started.cursor, expected, actual: key },
      ];

  const nextCursor = started.config.strictMode && !correct ? started.cursor : started.cursor + 1;
  const nextTyped = started.config.strictMode && !correct ? started.typed : [...started.typed, newTyped];

  const next: EngineState = {
    ...started,
    cursor: nextCursor,
    typed: nextTyped,
    errors,
  };

  if (next.cursor >= next.text.length) {
    return { ...next, endedAt: atMs };
  }
  return next;
}

export function handleBackspace(state: EngineState, _atMs: number): EngineState {
  if (state.endedAt !== null) return state;
  if (isPaused(state)) return state;
  if (!state.config.allowBackspace) return state;
  if (state.cursor === 0) return state;
  return {
    ...state,
    cursor: state.cursor - 1,
    typed: state.typed.slice(0, -1),
  };
}

export function pause(state: EngineState, atMs: number): EngineState {
  if (state.endedAt !== null) return state;
  if (isPaused(state)) return state;
  if (state.startedAt === null) return state;
  return { ...state, lastPauseAt: atMs };
}

export function resume(state: EngineState, atMs: number): EngineState {
  if (state.lastPauseAt === null) return state;
  const delta = atMs - state.lastPauseAt;
  return {
    ...state,
    pausedMs: state.pausedMs + Math.max(0, delta),
    lastPauseAt: null,
  };
}

export function isComplete(state: EngineState): boolean {
  return state.endedAt !== null;
}

export function elapsedMs(state: EngineState, nowMs: number): number {
  if (state.startedAt === null) return 0;
  const end = state.endedAt ?? (state.lastPauseAt ?? nowMs);
  return Math.max(0, end - state.startedAt - state.pausedMs);
}

export function summarize(state: EngineState, nowMs: number = Date.now()): SessionSummary {
  const correctChars = state.typed.filter((t) => t.correct).length;
  const incorrectChars = state.typed.length - correctChars;
  const totalErrorCount = state.errors.length;
  const elapsed = elapsedMs(state, nowMs);

  const wpm =
    elapsed >= 1000
      ? Math.round((correctChars / 5) / (elapsed / 60000))
      : 0;

  const denom = correctChars + totalErrorCount;
  const accuracy = denom === 0 ? 0 : correctChars / denom;

  const errorsByKey: Record<string, number> = {};
  const errorsByFinger: Record<Finger, number> = ALL_FINGERS.reduce(
    (acc, f) => ({ ...acc, [f]: 0 }),
    {} as Record<Finger, number>,
  );
  for (const e of state.errors) {
    errorsByKey[e.expected] = (errorsByKey[e.expected] ?? 0) + 1;
    const f = fingerFor(e.expected);
    errorsByFinger[f] = (errorsByFinger[f] ?? 0) + 1;
  }

  return {
    durationMs: elapsed,
    charsTyped: state.typed.length,
    correctChars,
    incorrectChars,
    wpm,
    accuracy,
    errorsByKey,
    errorsByFinger,
  };
}
