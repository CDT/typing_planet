import { useTranslation } from "react-i18next";
import { Card } from "@/components/Card";
import { useProgress } from "@/stores/progress";

const TOTAL_BADGES = 12;

export function MePage() {
  const { t } = useTranslation();
  const user = useProgress((p) => p.user);

  const avgWpm =
    user.lifetime.msTyped > 1000
      ? Math.round((user.lifetime.charsTyped / 5) / (user.lifetime.msTyped / 60000))
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{t("me.title")}</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t("me.lifetime")}</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <Stat label={t("me.sessions")} value={user.lifetime.sessions} />
          <Stat label={t("me.chars")} value={user.lifetime.charsTyped} />
          <Stat label={t("me.avgWpm")} value={avgWpm} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t("me.badges", { earned: user.badges.length, total: TOTAL_BADGES })}
        </h2>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {Array.from({ length: TOTAL_BADGES }).map((_, i) => {
            const earned = i < user.badges.length;
            return (
              <div
                key={i}
                className={`aspect-square rounded-md flex items-center justify-center text-lg ${
                  earned ? "bg-[var(--warning)]/20 text-[var(--warning)]" : "bg-[var(--surface-2)] text-text-faint"
                }`}
              >
                {earned ? "★" : "?"}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className="font-mono text-3xl font-semibold tabular">{value}</div>
    </div>
  );
}
