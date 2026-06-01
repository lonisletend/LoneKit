import { computed, ref, watch } from "vue";

const STORAGE_KEY = "lonekit.themeMode";
const VALID_THEME_MODES = new Set(["light", "dark", "auto"]);

const themeMode = ref("auto");
const systemPrefersDark = ref(false);
const resolvedTheme = computed(() => {
  if (themeMode.value === "auto") {
    return systemPrefersDark.value ? "dark" : "light";
  }
  return themeMode.value;
});

let initialized = false;
let mediaQuery = null;

function normalizeThemeMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  return VALID_THEME_MODES.has(mode) ? mode : "auto";
}

function syncDocumentTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
}

function handleSystemThemeChange(event) {
  systemPrefersDark.value = !!event.matches;
}

function initThemeMode() {
  if (initialized || typeof window === "undefined") {
    return;
  }
  initialized = true;

  themeMode.value = normalizeThemeMode(window.localStorage.getItem(STORAGE_KEY));

  if (typeof window.matchMedia === "function") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    systemPrefersDark.value = mediaQuery.matches;
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  watch(
    themeMode,
    (mode) => {
      window.localStorage.setItem(STORAGE_KEY, mode);
    },
    { immediate: true }
  );

  watch(
    resolvedTheme,
    (theme) => {
      syncDocumentTheme(theme);
    },
    { immediate: true }
  );
}

function setThemeMode(mode) {
  themeMode.value = normalizeThemeMode(mode);
}

export function useThemeMode() {
  return {
    themeMode,
    resolvedTheme,
    initThemeMode,
    setThemeMode,
  };
}
