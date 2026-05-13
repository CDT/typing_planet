import { create } from "zustand";
import type { LessonId } from "@/types";
import {
  createSession,
  handleBackspace,
  handleInput,
  pause as enginePause,
  resume as engineResume,
  type EngineState,
} from "@/features/engine/engine";

export type Phase = "idle" | "countdown" | "typing" | "paused" | "finished";

interface SessionStore {
  phase: Phase;
  lessonId: LessonId | null;
  state: EngineState | null;
  start: (lessonId: LessonId, text: string) => void;
  beginTyping: () => void;
  input: (key: string) => void;
  backspace: () => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  reset: () => void;
}

export const useSession = create<SessionStore>((set, get) => ({
  phase: "idle",
  lessonId: null,
  state: null,
  start: (lessonId, text) =>
    set({
      lessonId,
      state: createSession({ text, allowBackspace: true, strictMode: false }),
      phase: "countdown",
    }),
  beginTyping: () => set({ phase: "typing" }),
  input: (key) => {
    const s = get();
    if (s.phase !== "typing" || !s.state) return;
    const now = performance.now() + performance.timeOrigin;
    const next = handleInput(s.state, key, now);
    if (next.endedAt !== null) {
      set({ state: next, phase: "finished" });
    } else {
      set({ state: next });
    }
  },
  backspace: () => {
    const s = get();
    if (s.phase !== "typing" || !s.state) return;
    const now = performance.now() + performance.timeOrigin;
    set({ state: handleBackspace(s.state, now) });
  },
  pause: () => {
    const s = get();
    if (s.phase !== "typing" || !s.state) return;
    const now = performance.now() + performance.timeOrigin;
    set({ state: enginePause(s.state, now), phase: "paused" });
  },
  resume: () => {
    const s = get();
    if (s.phase !== "paused" || !s.state) return;
    const now = performance.now() + performance.timeOrigin;
    set({ state: engineResume(s.state, now), phase: "typing" });
  },
  finish: () => set({ phase: "finished" }),
  reset: () => set({ phase: "idle", lessonId: null, state: null }),
}));
