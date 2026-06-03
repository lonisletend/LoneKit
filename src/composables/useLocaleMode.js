import { computed, ref, watch } from "vue";
import { dateEnUS, dateZhCN, enUS, zhCN } from "naive-ui";
import { i18n, LOCALE_STORAGE_KEY, normalizeLocale } from "../i18n";

const localeMode = ref(normalizeLocale(i18n.global.locale.value));
let initialized = false;

const localeOptions = [
  { labelKey: "common.chinese", value: "zh-CN" },
  { labelKey: "common.english", value: "en-US" },
];

const naiveLocale = computed(() => (localeMode.value === "en-US" ? enUS : zhCN));
const naiveDateLocale = computed(() => (localeMode.value === "en-US" ? dateEnUS : dateZhCN));

function syncDocumentLocale(locale) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("lang", locale);
}

function initLocaleMode() {
  if (initialized) {
    return;
  }
  initialized = true;

  watch(
    localeMode,
    (locale) => {
      const normalizedLocale = normalizeLocale(locale);
      if (normalizedLocale !== localeMode.value) {
        localeMode.value = normalizedLocale;
        return;
      }
      i18n.global.locale.value = normalizedLocale;
      syncDocumentLocale(normalizedLocale);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, normalizedLocale);
      }
    },
    { immediate: true }
  );
}

function setLocaleMode(locale) {
  localeMode.value = normalizeLocale(locale);
}

function toggleLocaleMode() {
  setLocaleMode(localeMode.value === "zh-CN" ? "en-US" : "zh-CN");
}

export function useLocaleMode() {
  return {
    localeMode,
    localeOptions,
    naiveLocale,
    naiveDateLocale,
    initLocaleMode,
    setLocaleMode,
    toggleLocaleMode,
  };
}
