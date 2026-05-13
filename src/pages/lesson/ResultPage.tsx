import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RotateCcw, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Stars } from "@/components/Stars";
import { Card } from "@/components/Card";
import { lessons, planets } from "@/content";
import type { LessonResult } from "@/types";

export function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const result = (location.state as { result?: LessonResult } | null)?.result;
  const lesson = id ? lessons[id] : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") goNext();
      if (e.key.toLowerCase() === "r") retry();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!lesson || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate("/map")}>{t("common.back")}</Button>
      </div>
    );
  }

  function retry() {
    navigate(`/lesson/${lesson!.id}`);
  }
  function goNext() {
    const list = planets[lesson!.planet].lessons;
    const idx = list.indexOf(lesson!.id);
    const nextId = list[idx + 1];
    if (nextId) navigate(`/lesson/${nextId}`);
    else navigate(`/planet/${lesson!.planet}`);
  }
  function backToPlanet() {
    navigate(`/planet/${lesson!.planet}`);
  }

  const seconds = Math.round(result.durationMs / 1000);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <Card className="p-10 w-full max-w-[640px] flex flex-col items-center gap-8">
        <h1 className="text-3xl font-semibold">{t("results.title")}</h1>

        <div className="flex gap-3">
          <Stars count={result.stars} size={48} />
        </div>

        <div className="grid grid-cols-3 gap-6 w-full text-center">
          <Stat label={t("results.wpm")} value={String(result.wpm)} />
          <Stat label={t("results.accuracy")} value={`${Math.round(result.accuracy * 100)}%`} />
          <Stat label={t("results.time")} value={formatTime(seconds)} />
        </div>

        <div className="text-sm text-text-muted">
          {t("results.xpEarned", { xp: result.xpEarned })}
        </div>

        <div className="flex gap-3 w-full flex-wrap justify-center">
          <Button variant="ghost" onClick={retry}>
            <RotateCcw size={18} />
            {t("common.retry")}
          </Button>
          <Button onClick={goNext}>
            {t("common.next")}
            <ArrowRight size={18} />
          </Button>
          <Button variant="secondary" onClick={backToPlanet}>
            <ChevronLeft size={18} />
            {t("results.backToPlanet")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className="font-mono text-4xl font-semibold tabular">{value}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
