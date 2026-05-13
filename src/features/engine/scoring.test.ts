import { describe, it, expect } from "vitest";
import { levelFromXp, starsFor, xpFor, xpToReach } from "./scoring";

describe("starsFor", () => {
  it("returns 3 stars when accuracy >=0.97 and wpm >= target + 5", () => {
    expect(starsFor({ accuracy: 0.97, wpm: 25 }, 20)).toBe(3);
  });
  it("returns 2 stars when accuracy >=0.9 and wpm >= target", () => {
    expect(starsFor({ accuracy: 0.95, wpm: 20 }, 20)).toBe(2);
  });
  it("returns 1 star when accuracy >=0.8", () => {
    expect(starsFor({ accuracy: 0.85, wpm: 10 }, 20)).toBe(1);
  });
  it("returns 0 when below 80% accuracy", () => {
    expect(starsFor({ accuracy: 0.79, wpm: 30 }, 20)).toBe(0);
  });
});

describe("xpFor", () => {
  it("scales with accuracy", () => {
    const low = xpFor({ accuracy: 0.6, wpm: 20 }, 20);
    const high = xpFor({ accuracy: 1.0, wpm: 20 }, 20);
    expect(high).toBeGreaterThan(low);
  });

  it("scales with wpm", () => {
    const slow = xpFor({ accuracy: 0.95, wpm: 10 }, 20);
    const fast = xpFor({ accuracy: 0.95, wpm: 40 }, 20);
    expect(fast).toBeGreaterThan(slow);
  });

  it("clamps speed multiplier so it doesn't explode", () => {
    const huge = xpFor({ accuracy: 1.0, wpm: 1000 }, 20);
    expect(huge).toBeLessThanOrEqual(200);
  });
});

describe("levels", () => {
  it("level 1 needs 0 xp", () => {
    expect(xpToReach(1)).toBe(0);
    expect(levelFromXp(0)).toBe(1);
  });

  it("level 2 needs ~50 xp", () => {
    expect(xpToReach(2)).toBe(50);
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(49)).toBe(1);
  });

  it("levels increase monotonically", () => {
    let prev = -1;
    for (let l = 1; l <= 20; l++) {
      const x = xpToReach(l);
      expect(x).toBeGreaterThan(prev);
      prev = x;
    }
  });
});
