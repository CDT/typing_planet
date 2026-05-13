import { describe, it, expect } from "vitest";
import {
  createSession,
  handleBackspace,
  handleInput,
  isComplete,
  pause,
  resume,
  summarize,
  type EngineConfig,
  type EngineState,
} from "./engine";

function cfg(text: string, partial: Partial<EngineConfig> = {}): EngineConfig {
  return { text, allowBackspace: true, strictMode: false, ...partial };
}

function typeAll(state: EngineState, chars: string, startMs = 1000, stepMs = 50): EngineState {
  let s = state;
  let t = startMs;
  for (const c of chars) {
    s = handleInput(s, c, t);
    t += stepMs;
  }
  return s;
}

describe("engine", () => {
  it("creates a session with cursor at 0", () => {
    const s = createSession(cfg("abc"));
    expect(s.cursor).toBe(0);
    expect(s.typed).toEqual([]);
    expect(s.startedAt).toBeNull();
  });

  it("starts the clock on first keystroke", () => {
    const s = createSession(cfg("abc"));
    const next = handleInput(s, "a", 1234);
    expect(next.startedAt).toBe(1234);
    expect(next.cursor).toBe(1);
  });

  it("records correct chars", () => {
    let s = createSession(cfg("abc"));
    s = typeAll(s, "abc");
    expect(isComplete(s)).toBe(true);
    expect(s.typed.every((t) => t.correct)).toBe(true);
  });

  it("records errors and still advances in non-strict mode", () => {
    let s = createSession(cfg("abc"));
    s = handleInput(s, "x", 1000);
    expect(s.cursor).toBe(1);
    expect(s.errors).toHaveLength(1);
    expect(s.typed[0]!.correct).toBe(false);
  });

  it("does not advance on wrong input in strict mode", () => {
    let s = createSession(cfg("abc", { strictMode: true }));
    s = handleInput(s, "x", 1000);
    expect(s.cursor).toBe(0);
    expect(s.errors).toHaveLength(1);
    expect(s.typed).toHaveLength(0);
  });

  it("backspace removes the last typed char but keeps error history", () => {
    let s = createSession(cfg("ab"));
    s = handleInput(s, "x", 1000);
    s = handleBackspace(s, 1100);
    expect(s.cursor).toBe(0);
    expect(s.typed).toHaveLength(0);
    expect(s.errors).toHaveLength(1);
  });

  it("backspace at start is a no-op", () => {
    const s = createSession(cfg("ab"));
    const next = handleBackspace(s, 1000);
    expect(next).toEqual(s);
  });

  it("excludes paused time from elapsed", () => {
    let s = createSession(cfg("abc"));
    s = handleInput(s, "a", 1000);
    s = pause(s, 2000);
    s = resume(s, 5000);
    s = handleInput(s, "b", 6000);
    s = handleInput(s, "c", 7000);
    const summary = summarize(s);
    expect(summary.durationMs).toBe(7000 - 1000 - 3000);
  });

  it("ignores input while paused", () => {
    let s = createSession(cfg("abc"));
    s = handleInput(s, "a", 1000);
    s = pause(s, 2000);
    const next = handleInput(s, "b", 3000);
    expect(next.cursor).toBe(1);
  });

  it("returns wpm 0 when elapsed < 1s", () => {
    let s = createSession(cfg("abc"));
    s = handleInput(s, "a", 1000);
    s = handleInput(s, "b", 1500);
    s = handleInput(s, "c", 1999);
    const summary = summarize(s);
    expect(summary.wpm).toBe(0);
  });

  it("computes accuracy correctly with mixed input", () => {
    let s = createSession(cfg("abcd"));
    s = handleInput(s, "a", 1000);
    s = handleInput(s, "x", 1100);
    s = handleInput(s, "c", 1200);
    s = handleInput(s, "d", 1300);
    const summary = summarize(s);
    expect(summary.correctChars).toBe(3);
    expect(summary.accuracy).toBeCloseTo(3 / 4);
  });

  it("ignores multi-char keys", () => {
    let s = createSession(cfg("abc"));
    s = handleInput(s, "Shift", 1000);
    expect(s.cursor).toBe(0);
    expect(s.typed).toHaveLength(0);
  });

  it("does not accept input after completion", () => {
    let s = createSession(cfg("ab"));
    s = handleInput(s, "a", 1000);
    s = handleInput(s, "b", 1100);
    expect(isComplete(s)).toBe(true);
    const next = handleInput(s, "c", 1200);
    expect(next).toEqual(s);
  });
});
