import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pause, X } from "lucide-react";
import { TypingSurface } from "@/components/TypingSurface";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/Button";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import { lessons } from "@/content";
import { elapsedMs, summarize } from "@/features/engine/engine";
import { starsFor, xpFor } from "@/features/engine/scoring";
import { useProgress } from "@/stores/progress";
import type { LessonResult } from "@/types";

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const lesson = id ? lessons[id] : undefined;

  const phase = useSession((s) => s.phase);
  const state = useSession((s) => s.state);
  const start = useSession((s) => s.start);
  const beginTyping = useSession((s) => s.beginTyping);
  const input = useSession((s) => s.input);
  const backspace = useSession((s) => s.backspace);
  const pause = useSession((s) => s.pause);
  const resume = useSession((s) => s.resume);
  const reset = useSession((s) => s.reset);
  const recordResult = useProgress((p) => p.recordResult);
  const showKeyboard = useSettings((s) => s.showKeyboard);
  const showFingerOverlay = useSettings((s) => s.showFingerOverlay);

  const [count, setCount] = useState(3);
  const [now, setNow] = useState(0);

  // Boot the session for this lesson once.
  useEffect(() => {
    if (!lesson) return;
    if (state?.text === lesson.content.join(" ")) return;
    start(lesson.id, lesson.content.join(" "));
    setCount(3);
  }, [lesson, start, state?.text]);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) {
      beginTyping();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count, beginTyping]);

  // Keyboard handling
  useEffect(() => {
    if (phase !== "typing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        pause();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        input(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, input, backspace, pause]);

  // Auto-pause on blur
  useEffect(() => {
    if (phase !== "typing") return;
    const onBlur = () => pause();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase, pause]);

  // Tick HUD elapsed time
  useEffect(() => {
    if (phase !== "typing") return;
    const id = setInterval(() => setNow(performance.now() + performance.timeOrigin), 100);
    return () => clearInterval(id);
  }, [phase]);

  // On finish: persist and navigate
  useEffect(() => {
    if (phase !== "finished" || !state || !lesson) return;
    const summary = summarize(state, performance.now() + performance.timeOrigin);
    const stars = starsFor(summary, lesson.targetWpm);
    const xp = xpFor(summary, lesson.targetWpm);
    const result: LessonResult = {
      lessonId: lesson.id,
      completedAt: Date.now(),
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMs: summary.durationMs,
      charsTyped: summary.charsTyped,
      correctChars: summary.correctChars,
      incorrectChars: summary.incorrectChars,
      wpm: summary.wpm,
      accuracy: summary.accuracy,
      errorsByKey: summary.errorsByKey,
      errorsByFinger: summary.errorsByFinger,
      stars,
      xpEarned: xp,
    };
    void recordResult(result).then(() => {
      navigate(`/lesson/${lesson.id}/result`, { state: { result } });
      reset();
    });
  }, [phase, state, lesson, navigate, recordResult, reset]);

  const nextChar = useMemo(() => {
    if (!state) return undefined;
    return state.text[state.cursor];
  }, [state]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Lesson not found.</p>
      </div>
    );
  }

  const summary = state ? summarize(state, now) : null;
  const progress = state ? state.cursor / Math.max(1, state.text.length) : 0;
  const seconds = state && state.startedAt !== null ? Math.floor(elapsedMs(state, now) / 1000) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="px-6 py-4 flex items-center gap-6 border-b border-[var(--border)]">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/planet/${lesson.planet}`)} aria-label={t("common.quit")}>
          <X size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={pause} disabled={phase !== "typing"} aria-label={t("common.pause")}>
          <Pause size={18} />
        </Button>
        <div className="flex-1">
          <ProgressBar value={progress} />
        </div>
        <div className="flex gap-6 tabular text-sm">
          <div>
            <span className="text-text-muted mr-1">{t("practice.hud.wpm")}</span>
            <span className="font-semibold">{summary?.wpm ?? 0}</span>
          </div>
          <div>
            <span className="text-text-muted mr-1">{t("practice.hud.accuracy")}</span>
            <span className="font-semibold">{summary ? Math.round(summary.accuracy * 100) : 0}%</span>
          </div>
          <div>
            <span className="text-text-muted mr-1">{t("practice.hud.time")}</span>
            <span className="font-semibold">{formatTime(seconds)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[880px]">
          {phase === "countdown" && (
            <div className="text-center font-mono text-7xl tabular text-[var(--accent)]">
              {count > 0 ? count : t("practice.go")}
            </div>
          )}
          {phase !== "countdown" && state && <TypingSurface state={state} />}
        </div>
      </main>

      {showKeyboard && phase !== "countdown" && (
        <footer className="px-4 pb-6">
          <VirtualKeyboard nextKey={nextChar} showFingerOverlay={showFingerOverlay} />
        </footer>
      )}

      {phase === "paused" && (
        <div className="scrim z-40 flex items-center justify-center">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 shadow-md w-[min(420px,92vw)] flex flex-col gap-4 items-center">
            <h2 className="text-2xl font-semibold">{t("practice.pausedTitle")}</h2>
            <p className="text-text-muted text-sm text-center">{t("practice.pausedHint")}</p>
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1" onClick={() => navigate(`/planet/${lesson.planet}`)}>
                {t("common.quit")}
              </Button>
              <Button className="flex-1" onClick={resume}>
                {t("common.resume")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
