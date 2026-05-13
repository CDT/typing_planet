export type LessonId = string;
export type PlanetId = "terra" | "aqua" | "pyra" | "numa" | "nova";
export type LessonType = "keys" | "words" | "sentences" | "paragraph";
export type Locale = "zh-CN" | "en-US";

export interface Lesson {
  id: LessonId;
  planet: PlanetId;
  order: number;
  type: LessonType;
  title: Record<Locale, string>;
  focusKeys?: string[];
  targetWpm: number;
  content: string[];
}

export type Finger =
  | "lp"
  | "lr"
  | "lm"
  | "li"
  | "ri"
  | "rm"
  | "rr"
  | "rp"
  | "lt"
  | "rt";

export interface LessonResult {
  lessonId: LessonId;
  completedAt: number;
  zone: string;
  durationMs: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  wpm: number;
  accuracy: number;
  errorsByKey: Record<string, number>;
  errorsByFinger: Record<Finger, number>;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
}

export interface LessonBest {
  lessonId: LessonId;
  bestWpm: number;
  bestAccuracy: number;
  bestStars: 0 | 1 | 2 | 3;
  attempts: number;
  firstClearedAt?: number;
}

export type BadgeId =
  | "first-steps"
  | "home-row-hero"
  | "centurion"
  | "perfectionist"
  | "night-owl"
  | "speed-demon"
  | "marathon"
  | "comeback"
  | "consistent"
  | "polyglot-keys"
  | "no-backspace"
  | "explorer";

export interface UserState {
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    shields: number;
    lastCountedDate: string;
  };
  badges: BadgeId[];
  lastPlayed?: { lessonId: LessonId; at: number };
  lifetime: {
    sessions: number;
    charsTyped: number;
    msTyped: number;
  };
}

export interface Settings {
  locale: Locale;
  theme: "system" | "light" | "dark";
  sound: boolean;
  haptics: boolean;
  showKeyboard: boolean;
  showFingerOverlay: boolean;
  reducedMotion: boolean | null;
}
