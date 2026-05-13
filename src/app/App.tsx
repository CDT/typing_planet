import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { router } from "./router";
import { useSettings } from "@/stores/settings";
import { useProgress } from "@/stores/progress";
import { SplashScreen } from "@/pages/splash/SplashScreen";

export function App() {
  const [ready, setReady] = useState(false);
  const hydrateSettings = useSettings((s) => s.hydrate);
  const hydrateProgress = useProgress((s) => s.hydrate);
  const locale = useSettings((s) => s.locale);
  const theme = useSettings((s) => s.theme);
  const { i18n } = useTranslation();

  useEffect(() => {
    void Promise.all([hydrateSettings(), hydrateProgress()]).then(() => {
      setTimeout(() => setReady(true), 600);
    });
  }, [hydrateSettings, hydrateProgress]);

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [locale, i18n]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      if (theme === "system") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", dark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", theme);
      }
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  if (!ready) return <SplashScreen />;
  return <RouterProvider router={router} />;
}
