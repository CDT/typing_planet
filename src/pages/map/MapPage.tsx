import { Link } from "react-router-dom";
import { Flame, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { planets } from "@/content";
import { useProgress } from "@/stores/progress";
import { useSettings } from "@/stores/settings";
import { xpToReach } from "@/features/engine/scoring";
import type { LessonBest, PlanetId } from "@/types";

type Status = "locked" | "available" | "in-progress" | "mastered";

const PLANET_GRADIENTS: Record<PlanetId, [string, string]> = {
  terra: ["#5EE2A0", "#3BB4B0"],
  aqua: ["#4FC3F7", "#3F6FE0"],
  pyra: ["#FFB36B", "#F26A3F"],
  numa: ["#B98CFF", "#7C53E5"],
  nova: ["#FFD66B", "#E58E3F"],
};

const PLANET_ORDER: PlanetId[] = ["terra", "aqua", "pyra", "numa", "nova"];

function planetStatus(planet: PlanetId, bests: Record<string, LessonBest>): Status {
  const lessons = planets[planet]?.lessons ?? [];
  if (lessons.length === 0) return "locked";
  const cleared = lessons.filter((id) => (bests[id]?.bestStars ?? 0) >= 1);
  if (cleared.length === 0) return "available";
  if (cleared.length === lessons.length) {
    return lessons.every((id) => bests[id]?.bestStars === 3) ? "mastered" : "in-progress";
  }
  return "in-progress";
}

export function MapPage() {
  const { t } = useTranslation();
  const user = useProgress((p) => p.user);
  const bests = useProgress((p) => p.bests);
  const locale = useSettings((s) => s.locale);

  const xpForLevel = xpToReach(user.level);
  const xpForNext = xpToReach(user.level + 1);
  const xpProgress = (user.xp - xpForLevel) / Math.max(1, xpForNext - xpForLevel);

  const unlocked: Record<PlanetId, boolean> = {
    terra: true,
    aqua: false,
    pyra: false,
    numa: false,
    nova: false,
  };
  for (let i = 0; i < PLANET_ORDER.length - 1; i++) {
    const id = PLANET_ORDER[i]!;
    const ls = planets[id]?.lessons ?? [];
    const allCleared = ls.length > 0 && ls.every((lid) => (bests[lid]?.bestStars ?? 0) >= 1);
    if (allCleared) unlocked[PLANET_ORDER[i + 1]!] = true;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("map.greeting")} 👋</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-text-muted">
            <Flame size={18} className="text-[var(--warning)]" />
            <span className="tabular">{t("map.streak", { count: user.streak.current })}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{t("map.level", { level: user.level })}</span>
            <div className="w-32 h-2 bg-[var(--surface-2)] rounded-pill overflow-hidden">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${Math.max(0, Math.min(1, xpProgress)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center gap-12 py-8">
        {[...PLANET_ORDER].reverse().map((id, i) => {
          const status = unlocked[id] ? planetStatus(id, bests) : "locked";
          const gradient = PLANET_GRADIENTS[id];
          const offset = i % 2 === 0 ? "translate-x-12" : "-translate-x-12";
          return (
            <PlanetNode
              key={id}
              id={id}
              status={status}
              gradient={gradient}
              offset={offset}
              locale={locale}
            />
          );
        })}
      </div>
    </div>
  );
}

function PlanetNode({
  id,
  status,
  gradient,
  offset,
  locale,
}: {
  id: PlanetId;
  status: Status;
  gradient: [string, string];
  offset: string;
  locale: "zh-CN" | "en-US";
}) {
  const { t } = useTranslation();
  const planet = planets[id];
  const name = id.charAt(0).toUpperCase() + id.slice(1);
  const lessonCount = planet?.lessons.length ?? 0;
  const locked = status === "locked";
  const content = (
    <div className={`flex flex-col items-center gap-2 transform ${offset} transition-transform hover:scale-105`}>
      <div
        className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center text-white font-bold uppercase tracking-wide ${
          locked ? "opacity-40 grayscale" : ""
        }`}
        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      >
        {locked ? <Lock size={36} /> : name}
      </div>
      <div className="text-center">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-text-muted">
          {locked
            ? t("planet.lockedHint")
            : t("planet.lessons", { count: lessonCount, locale })}
        </div>
      </div>
    </div>
  );
  if (locked) return <div>{content}</div>;
  return <Link to={`/planet/${id}`}>{content}</Link>;
}
