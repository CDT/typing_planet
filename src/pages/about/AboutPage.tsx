import { useTranslation } from "react-i18next";
import { Card } from "@/components/Card";

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{t("settings.about")}</h1>
      <Card className="p-6">
        <p className="text-text-muted">{t("settings.version")}: 0.1.0</p>
      </Card>
    </div>
  );
}
