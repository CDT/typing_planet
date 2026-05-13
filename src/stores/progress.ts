import { create } from "zustand";
import type { LessonBest, LessonId, LessonResult, UserState } from "@/types";
import {
  appendLessonResult,
  loadLessonBests,
  loadUserState,
  saveLessonBest,
  saveUserState,
} from "@/storage/repositories";
import { levelFromXp } from "@/features/engine/scoring";

interface ProgressStore {
  hydrated: boolean;
  user: UserState;
  bests: Record<LessonId, LessonBest>;
  hydrate: () => Promise<void>;
  recordResult: (result: LessonResult) => Promise<{
    newBest: boolean;
    bestStars: 0 | 1 | 2 | 3;
  }>;
}

const DEFAULT_USER: UserState = {
  xp: 0,
  level: 1,
  streak: { current: 0, longest: 0, shields: 0, lastCountedDate: "" },
  badges: [],
  lifetime: { sessions: 0, charsTyped: 0, msTyped: 0 },
};

function todayKey(zone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function isAdjacentDay(prev: string, today: string): boolean {
  if (!prev) return false;
  const p = new Date(prev + "T00:00:00Z").getTime();
  const t = new Date(today + "T00:00:00Z").getTime();
  const diffDays = Math.round((t - p) / 86_400_000);
  return diffDays === 1;
}

export const useProgress = create<ProgressStore>((set, get) => ({
  hydrated: false,
  user: DEFAULT_USER,
  bests: {},
  hydrate: async () => {
    const [user, bests] = await Promise.all([loadUserState(), loadLessonBests()]);
    set({
      user: user ?? DEFAULT_USER,
      bests: Object.fromEntries(bests.map((b) => [b.lessonId, b])),
      hydrated: true,
    });
  },
  recordResult: async (result: LessonResult) => {
    const state = get();
    const prevBest = state.bests[result.lessonId];

    const newBest: LessonBest = prevBest
      ? {
          lessonId: result.lessonId,
          bestWpm: Math.max(prevBest.bestWpm, result.wpm),
          bestAccuracy: Math.max(prevBest.bestAccuracy, result.accuracy),
          bestStars: Math.max(prevBest.bestStars, result.stars) as 0 | 1 | 2 | 3,
          attempts: prevBest.attempts + 1,
          firstClearedAt: prevBest.firstClearedAt ?? (result.stars > 0 ? result.completedAt : undefined),
        }
      : {
          lessonId: result.lessonId,
          bestWpm: result.wpm,
          bestAccuracy: result.accuracy,
          bestStars: result.stars,
          attempts: 1,
          firstClearedAt: result.stars > 0 ? result.completedAt : undefined,
        };

    const isFirstEverClear = !prevBest;
    const improved = !prevBest || result.wpm > prevBest.bestWpm || result.stars > prevBest.bestStars;

    const today = todayKey(result.zone);
    const prevDate = state.user.streak.lastCountedDate;
    let nextStreak = { ...state.user.streak };
    if (prevDate !== today) {
      if (isAdjacentDay(prevDate, today) || prevDate === "") {
        nextStreak.current = (prevDate === "" ? 0 : nextStreak.current) + 1;
      } else {
        nextStreak.current = 1;
      }
      nextStreak.longest = Math.max(nextStreak.longest, nextStreak.current);
      nextStreak.lastCountedDate = today;
      if (nextStreak.current > 0 && nextStreak.current % 7 === 0) {
        nextStreak.shields = Math.min(2, nextStreak.shields + 1);
      }
    }

    const xpGain = improved ? result.xpEarned : Math.floor(result.xpEarned * 0.25);
    const nextXp = state.user.xp + xpGain;
    const nextUser: UserState = {
      ...state.user,
      xp: nextXp,
      level: levelFromXp(nextXp),
      streak: nextStreak,
      lastPlayed: { lessonId: result.lessonId, at: result.completedAt },
      lifetime: {
        sessions: state.user.lifetime.sessions + 1,
        charsTyped: state.user.lifetime.charsTyped + result.charsTyped,
        msTyped: state.user.lifetime.msTyped + result.durationMs,
      },
      badges: state.user.badges,
    };

    if (isFirstEverClear && !nextUser.badges.includes("first-steps")) {
      nextUser.badges = [...nextUser.badges, "first-steps"];
    }

    set({
      bests: { ...state.bests, [result.lessonId]: newBest },
      user: nextUser,
    });

    await Promise.all([saveLessonBest(newBest), saveUserState(nextUser), appendLessonResult(result)]);

    return { newBest: improved, bestStars: newBest.bestStars };
  },
}));
