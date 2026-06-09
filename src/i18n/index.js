import { createI18n } from "vue-i18n";

export const LOCALE_STORAGE_KEY = "lonekit.locale";
export const DEFAULT_LOCALE = "zh-CN";
export const SUPPORTED_LOCALES = ["zh-CN", "en-US"];

const localeLoaders = {
  "zh-CN": () => import("./locales/zh-CN"),
  "en-US": () => import("./locales/en-US"),
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
  messages: {},
});

const loadedLocales = new Set();

export async function loadLocaleMessages(locale) {
  const normalizedLocale = normalizeLocale(locale);
  if (loadedLocales.has(normalizedLocale)) {
    return normalizedLocale;
  }

  const loader = localeLoaders[normalizedLocale];
  if (!loader) {
    return DEFAULT_LOCALE;
  }

  const messages = await loader();
  i18n.global.setLocaleMessage(normalizedLocale, messages.default);
  loadedLocales.add(normalizedLocale);
  return normalizedLocale;
}
