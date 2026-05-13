import { useTranslation } from "react-i18next";

export function SplashScreen() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5EE2A0] to-[#3BB4B0] animate-pulse" />
        <h1 className="text-2xl font-semibold tracking-tight">{t("splash.title")}</h1>
      </div>
    </div>
  );
}
