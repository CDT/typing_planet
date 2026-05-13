import type { Lesson, LessonId, PlanetId } from "@/types";

const modules = import.meta.glob("./*/*.json", { eager: true });

const collected: Lesson[] = [];
for (const path in modules) {
  const mod = modules[path] as { default: Lesson };
  collected.push(mod.default);
}
collected.sort((a, b) => {
  if (a.planet !== b.planet) return a.planet.localeCompare(b.planet);
  return a.order - b.order;
});

export const lessons: Record<LessonId, Lesson> = Object.fromEntries(
  collected.map((l) => [l.id, l]),
);

const planetMap: Record<PlanetId, LessonId[]> = {
  terra: [],
  aqua: [],
  pyra: [],
  numa: [],
  nova: [],
};
for (const lesson of collected) {
  planetMap[lesson.planet].push(lesson.id);
}

export const planets: Record<PlanetId, { id: PlanetId; lessons: LessonId[] }> = {
  terra: { id: "terra", lessons: planetMap.terra },
  aqua: { id: "aqua", lessons: planetMap.aqua },
  pyra: { id: "pyra", lessons: planetMap.pyra },
  numa: { id: "numa", lessons: planetMap.numa },
  nova: { id: "nova", lessons: planetMap.nova },
};
