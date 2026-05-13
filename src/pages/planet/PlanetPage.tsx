import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Stars } from "@/components/Stars";
import { lessons, planets } from "@/content";
import { useProgress } from "@/stores/progress";
import { useSettings } from "@/stores/settings";
import type { PlanetId } from "@/types";

export function PlanetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const locale = useSettings((s) => s.locale);
  const bests = useProgress((p) => p.bests);

  const planet = id ? planets[id as PlanetId] : undefined;
  if (!planet) {
    return (
      <div>
        <Button onClick={() => navigate("/map")}>{t("common.back")}</Button>
      </div>
    );
  }

  const masteredCount = planet.lessons.filter((lid) => (bests[lid]?.bestStars ?? 0) === 3).length;
  const name = planet.id.charAt(0).toUpperCase() + planet.id.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/map" className="inline-flex items-center gap-1 text-text-muted hover:text-text">
        <ChevronLeft size={18} />
        {t("common.back")}
      </Link>

      <header className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${planetGradient(planet.id)[0]}, ${planetGradient(planet.id)[1]})`,
          }}
        />
        <div>
          <h1 className="text-3xl font-semibold">{name}</h1>
          <p className="text-text-muted text-sm">
            {t("planet.lessons", { count: planet.lessons.length })}
            {" · "}
            {masteredCount}/{planet.lessons.length} {t("planet.mastered")}
          </p>
        </div>
      </header>

      <Card className="divide-y divide-[var(--border)]">
        {planet.lessons.map((lid, idx) => {
          const lesson = lessons[lid]!;
          const best = bests[lid];
          const stars = (best?.bestStars ?? 0) as 0 | 1 | 2 | 3;
          const prevId = planet.lessons[idx - 1];
          const prevCleared = !prevId || (bests[prevId]?.bestStars ?? 0) >= 1;
          const unlocked = idx === 0 || prevCleared;

          return (
            <div key={lid} className="p-4 flex items-center gap-4">
              <div className="w-8 text-text-muted tabular text-sm">{idx + 1}.</div>
              <div className="flex-1">
                <div className="font-medium">{lesson.title[locale]}</div>
                <div className="text-xs text-text-muted">
                  {best ? (
                    <>
                      {t("results.wpm")} {best.bestWpm} · {Math.round(best.bestAccuracy * 100)}%
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <Stars count={stars} size={16} />
              {unlocked ? (
                <Button size="sm" onClick={() => navigate(`/lesson/${lid}`)}>
                  <Play size={14} />
                  {best ? t("common.continue") : t("common.start")}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-text-muted text-sm">
                  <Lock size={14} /> {t("common.locked")}
                </span>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function planetGradient(id: PlanetId): [string, string] {
  switch (id) {
    case "terra":
      return ["#5EE2A0", "#3BB4B0"];
    case "aqua":
      return ["#4FC3F7", "#3F6FE0"];
    case "pyra":
      return ["#FFB36B", "#F26A3F"];
    case "numa":
      return ["#B98CFF", "#7C53E5"];
    case "nova":
      return ["#FFD66B", "#E58E3F"];
  }
}
