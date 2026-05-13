import { openDB, type IDBPDatabase } from "idb";
import type { LessonBest, LessonResult, Settings, UserState } from "@/types";

export interface AppDbSchema {
  lessonResults: {
    key: [string, number];
    value: LessonResult;
    indexes: { byCompletedAt: number; byLessonId: string };
  };
  lessonBests: {
    key: string;
    value: LessonBest;
  };
  userState: {
    key: string;
    value: UserState & { id: "singleton" };
  };
  settings: {
    key: string;
    value: Settings & { id: "singleton" };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "typing-planet";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("lessonResults")) {
          const store = db.createObjectStore("lessonResults", {
            keyPath: ["lessonId", "completedAt"],
          });
          store.createIndex("byCompletedAt", "completedAt");
          store.createIndex("byLessonId", "lessonId");
        }
        if (!db.objectStoreNames.contains("lessonBests")) {
          db.createObjectStore("lessonBests", { keyPath: "lessonId" });
        }
        if (!db.objectStoreNames.contains("userState")) {
          db.createObjectStore("userState", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export function isStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}
