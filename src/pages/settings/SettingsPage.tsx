import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useSettings } from "@/stores/settings";
import { clearAll } from "@/storage/repositories";

export function SettingsPage() {
  const { t } = useTranslation();
  const settings = useSettings();
  const [confirm, setConfirm] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{t("settings.title")}</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t("settings.display")}</h2>
        <Row label={t("settings.language")}>
          <select
            value={settings.locale}
            onChange={(e) => settings.set("locale", e.target.value as "zh-CN" | "en-US")}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-md h-10 px-3"
          >
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
          </select>
        </Row>
        <Row label={t("settings.theme")}>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={settings.theme === m ? "primary" : "secondary"}
                onClick={() => settings.set("theme", m)}
              >
                {t(`settings.theme${m.charAt(0).toUpperCase() + m.slice(1)}` as const)}
              </Button>
            ))}
          </div>
        </Row>
        <Row label={t("settings.reducedMotion")}>
          <Toggle
            checked={settings.reducedMotion === true}
            onChange={(v) => settings.set("reducedMotion", v)}
          />
        </Row>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t("settings.practice")}</h2>
        <Row label={t("settings.sound")}>
          <Toggle checked={settings.sound} onChange={(v) => settings.set("sound", v)} />
        </Row>
        <Row label={t("settings.haptics")}>
          <Toggle checked={settings.haptics} onChange={(v) => settings.set("haptics", v)} />
        </Row>
        <Row label={t("settings.showKeyboard")}>
          <Toggle checked={settings.showKeyboard} onChange={(v) => settings.set("showKeyboard", v)} />
        </Row>
        <Row label={t("settings.showFingerOverlay")}>
          <Toggle checked={settings.showFingerOverlay} onChange={(v) => settings.set("showFingerOverlay", v)} />
        </Row>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t("settings.data")}</h2>
        <p className="text-text-muted text-sm mb-3">{t("settings.resetConfirm")}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="RESET"
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-md h-10 px-3 font-mono"
          />
          <Button
            variant="danger"
            disabled={confirm !== "RESET"}
            onClick={async () => {
              await clearAll();
              window.location.reload();
            }}
          >
            {t("settings.reset")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--surface-2)] border border-[var(--border)]"
      } relative`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
