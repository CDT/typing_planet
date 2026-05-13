import type { LessonBest, LessonResult, Settings, UserState } from "@/types";
import { getDb, isStorageAvailable } from "./db";

const SINGLETON = "singleton";

export async function loadUserState(): Promise<UserState | null> {
  if (!isStorageAvailable()) return null;
  const db = await getDb();
  const row = await db.get("userState", SINGLETON);
  if (!row) return null;
  const { id: _id, ...rest } = row as UserState & { id: string };
  return rest as UserState;
}

export async function saveUserState(state: UserState): Promise<void> {
  if (!isStorageAvailable()) return;
  const db = await getDb();
  await db.put("userState", { ...state, id: SINGLETON });
}

export async function loadSettings(): Promise<Settings | null> {
  if (!isStorageAvailable()) return null;
  const db = await getDb();
  const row = await db.get("settings", SINGLETON);
  if (!row) return null;
  const { id: _id, ...rest } = row as Settings & { id: string };
  return rest as Settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!isStorageAvailable()) return;
  const db = await getDb();
  await db.put("settings", { ...settings, id: SINGLETON });
}

export async function loadLessonBests(): Promise<LessonBest[]> {
  if (!isStorageAvailable()) return [];
  const db = await getDb();
  return (await db.getAll("lessonBests")) as LessonBest[];
}

export async function saveLessonBest(best: LessonBest): Promise<void> {
  if (!isStorageAvailable()) return;
  const db = await getDb();
  await db.put("lessonBests", best);
}

export async function appendLessonResult(result: LessonResult): Promise<void> {
  if (!isStorageAvailable()) return;
  const db = await getDb();
  await db.put("lessonResults", result);
}

export async function clearAll(): Promise<void> {
  if (!isStorageAvailable()) return;
  const db = await getDb();
  await Promise.all([
    db.clear("lessonResults"),
    db.clear("lessonBests"),
    db.clear("userState"),
    db.clear("settings"),
    db.clear("meta"),
  ]);
}
