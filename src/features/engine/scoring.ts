import type { SessionSummary } from "./engine";

export type Stars = 0 | 1 | 2 | 3;

export function starsFor(
  summary: Pick<SessionSummary, "accuracy" | "wpm">,
  targetWpm: number,
): Stars {
  const { accuracy, wpm } = summary;
  if (accuracy >= 0.97 && wpm >= targetWpm + 5) return 3;
  if (accuracy >= 0.9 && wpm >= targetWpm) return 2;
  if (accuracy >= 0.8) return 1;
  return 0;
}

const BASE_XP = 100;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function xpFor(
  summary: Pick<SessionSummary, "accuracy" | "wpm">,
  targetWpm: number,
): number {
  const accMult = clamp((summary.accuracy - 0.5) / 0.5, 0, 1);
  const speedDen = Math.max(20, targetWpm * 2);
  const speedMult = clamp(summary.wpm / speedDen, 0.25, 2.0);
  return Math.round(BASE_XP * (0.5 + 0.5 * accMult) * speedMult);
}

export function xpToReach(level: number): number {
  if (level <= 1) return 0;
  return Math.round(50 * Math.pow(level - 1, 1.6));
}

export function levelFromXp(xp: number): number {
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= xpToReach(lvl)) return lvl;
  }
  return 1;
}
