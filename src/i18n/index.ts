import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zhCN from "./zh-CN.json";
import enUS from "./en-US.json";

void i18n.use(initReactI18next).init({
  lng: "zh-CN",
  fallbackLng: "zh-CN",
  resources: {
    "zh-CN": { translation: zhCN },
    "en-US": { translation: enUS },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
