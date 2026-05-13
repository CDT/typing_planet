import { create } from "zustand";
import type { Settings } from "@/types";
import { loadSettings, saveSettings } from "@/storage/repositories";

interface SettingsStore extends Settings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const DEFAULT_SETTINGS: Settings = {
  locale: "zh-CN",
  theme: "system",
  sound: true,
  haptics: true,
  showKeyboard: true,
  showFingerOverlay: false,
  reducedMotion: null,
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(snapshot: Settings) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveSettings(snapshot).catch(() => {
      /* swallow; storage banner handles this */
    });
  }, 200);
}

export const useSettings = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    const persisted = await loadSettings();
    if (persisted) {
      set({ ...persisted, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
  set: (key, value) => {
    set({ [key]: value } as Partial<SettingsStore>);
    const { hydrated: _h, hydrate: _hy, set: _s, ...snapshot } = get();
    scheduleSave(snapshot as Settings);
  },
}));
