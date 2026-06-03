import { createI18n } from "vue-i18n";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";

export const LOCALE_STORAGE_KEY = "lonekit.locale";
export const DEFAULT_LOCALE = "zh-CN";
export const SUPPORTED_LOCALES = ["zh-CN", "en-US"];

const messages = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export function normalizeLocale(value) {
  const locale = String(value || "").trim();
  if (SUPPORTED_LOCALES.includes(locale)) {
    return locale;
  }
  const lowerLocale = locale.toLowerCase();
  if (lowerLocale.startsWith("zh")) {
    return "zh-CN";
  }
  if (lowerLocale.startsWith("en")) {
    return "en-US";
  }
  return DEFAULT_LOCALE;
}

export function getInitialLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale) {
    return normalizeLocale(savedLocale);
  }
  return normalizeLocale(window.navigator?.language);
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});
