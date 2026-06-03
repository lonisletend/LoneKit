<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NEmpty, NIcon, NInput, NModal, NSelect, NSwitch, NTag } from "naive-ui";
import { ChevronDownCircleOutline, ChevronUpCircleOutline } from "@vicons/ionicons5";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";

const { notify, readFromClipboard } = useCommon();
const { t, tm } = useI18n();

const STORAGE_KEY = "lonekit-sendpay-config-profiles";
const LEGACY_STORAGE_KEY = "lonekit-sendpay-explain-config";
const CONFIG_SYNC_EVENT = "lonekit-sendpay-config-updated";
const FORMAT_JSON = "JSON";
const FORMAT_URL = "URL";

const sendpayInput = ref("");
const sendpayMapEnabled = ref(false);
const sendpayMapInput = ref("");
const allExplainEnabled = ref(false);
const showConfigModal = ref(false);
const configProfiles = ref([]);
const selectedProfileId = ref(null);
const editingProfiles = ref([]);
const editingPosition = ref(null);
const editingValue = ref("");
const editingMapPosition = ref(null);
const editingMapValue = ref("");
const expandedCompareRows = ref({});

const formatOptions = [
  { label: "Json", value: FORMAT_JSON },
  { label: "URL", value: FORMAT_URL },
];

function normalizeSendpay(raw) {
  return String(raw ?? "").replace(/\D+/g, "");
}

function parseClipboardSendpay(raw) {
  const text = String(raw ?? "").trim();
  if (!text || !/^\d+$/.test(text)) {
    return "";
  }
  return text;
}

function handleSendpayInput(value) {
  sendpayInput.value = normalizeSendpay(value);
}

function parseSendpayMap(raw) {
  const text = String(raw ?? "").trim();
  if (!text) {
    return {
      map: {},
      error: "",
    };
  }

  try {
    const parsed = JSON.parse(text);
    if (!isObject(parsed)) {
      return {
        map: {},
        error: t("tool.sendpayDisplay.errors.sendpayMapMustBeObject"),
      };
    }

    const nextMap = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const normalizedKey = String(key ?? "").trim();
      if (!normalizedKey) {
        return;
      }

      if (typeof value === "string" || typeof value === "number") {
        nextMap[normalizedKey] = String(value).trim();
      }
    });

    return {
      map: nextMap,
      error: "",
    };
  } catch {
    return {
      map: {},
      error: t("tool.sendpayDisplay.errors.sendpayMapParseFailed"),
    };
  }
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeExplainConfig(value) {
  return isObject(value) ? value : {};
}

function parseExplainConfigPayload(payload) {
  if (!isObject(payload)) {
    return {
      ok: false,
      message: t("tool.sendpayDisplay.errors.configMustBeObject"),
      config: {},
      title: "",
      nameLocked: false,
      raw: payload,
    };
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(payload, "title");
  const hasConfig = Object.prototype.hasOwnProperty.call(payload, "config");

  if (hasTitle || hasConfig) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return {
        ok: false,
        message: t("tool.sendpayDisplay.errors.missingTitle"),
        config: {},
        title: "",
        nameLocked: false,
        raw: payload,
      };
    }

    if (!isObject(payload.config)) {
      return {
        ok: false,
        message: t("tool.sendpayDisplay.errors.configFieldMustBeObject"),
        config: {},
        title: "",
        nameLocked: false,
        raw: payload,
      };
    }

    return {
      ok: true,
      message: "",
      config: normalizeExplainConfig(payload.config),
      title,
      nameLocked: true,
      raw: payload,
    };
  }

  return {
    ok: true,
    message: "",
    config: normalizeExplainConfig(payload),
    title: "",
    nameLocked: false,
    raw: payload,
  };
}

function normalizeFormat(value) {
  return String(value || FORMAT_JSON).toUpperCase() === FORMAT_URL ? FORMAT_URL : FORMAT_JSON;
}

function isUrlFormatProfile(profile) {
  return normalizeFormat(profile?.format) === FORMAT_URL;
}

function makeDefaultProfileName(index) {
  return t("tool.sendpayDisplay.defaultProfileName", { index: index + 1 });
}

function createProfile(partial = {}, index = 0) {
  const id = Number.isFinite(Number(partial.id)) ? Number(partial.id) : Date.now() + index;
  const format = normalizeFormat(partial.format);
  const parsedPayload = parseExplainConfigPayload(partial.config);
  const fallbackName = makeDefaultProfileName(index);
  const baseName = String(partial.name || fallbackName).trim() || fallbackName;
  const nameLocked = !!partial.nameLocked || (parsedPayload.ok && parsedPayload.nameLocked);

  return {
    id,
    name: parsedPayload.ok && parsedPayload.nameLocked ? parsedPayload.title : baseName,
    nameLocked,
    format,
    url: format === FORMAT_URL ? String(partial.url || "").trim() : "",
    config: parsedPayload.ok ? parsedPayload.config : {},
  };
}

function toEditingProfile(profile, index = 0) {
  const normalized = createProfile(profile, index);
  const configTextPayload = normalized.nameLocked
    ? {
      title: normalized.name,
      config: normalized.config,
    }
    : normalized.config;

  return {
    ...normalized,
    configText: JSON.stringify(configTextPayload, null, 2),
  };
}

const selectedProfile = computed(() => {
  return configProfiles.value.find((item) => item.id === selectedProfileId.value) || null;
});

const selectedExplainConfig = computed(() => {
  return selectedProfile.value?.config || {};
});

const profileOptions = computed(() => {
  return configProfiles.value.map((item) => ({
    label: `${item.name} (${item.format})`,
    value: item.id,
  }));
});
const sendpayMapPlaceholder = computed(() => {
  return `${t("tool.sendpayDisplay.sendpayMapPlaceholderPrefix")} ${JSON.stringify({ 520: "1", 1002: "6", 1024: 9 })}`;
});
const configPlaceholder = computed(() => {
  return JSON.stringify({ 1: [{ 0: t("tool.sendpayDisplay.configPlaceholderExample") }], 8: [{ 2: t("tool.sendpayDisplay.configPlaceholderExample8") }] });
});

const sendpayValue = computed(() => normalizeSendpay(sendpayInput.value));
const sendpayMapResult = computed(() => parseSendpayMap(sendpayMapInput.value));
const sendpayMapError = computed(() => {
  if (!sendpayMapEnabled.value) {
    return "";
  }
  return sendpayMapResult.value.error;
});
const activeSendpayMap = computed(() => {
  if (!sendpayMapEnabled.value || sendpayMapError.value) {
    return {};
  }
  return sendpayMapResult.value.map;
});
const hasSendpayMapEntries = computed(() => Object.keys(activeSendpayMap.value).length > 0);
const hasExplainInput = computed(() => !!sendpayValue.value || hasSendpayMapEntries.value);

const sendpayPairs = computed(() => {
  return sendpayValue.value.split("").map((value, index) => ({
    position: index + 1,
    value,
  }));
});

const sendpayMapPairs = computed(() => {
  return Object.entries(activeSendpayMap.value)
    .map(([position, value]) => ({
      position: String(position),
      value: String(value),
    }))
    .sort((a, b) => a.position.localeCompare(b.position, "zh-Hans-CN", { numeric: true }));
});

function buildValueExplainMap(configItem) {
  const valueExplainMap = {};

  const normalizeExplainText = (text) => String(text).replace(/\\n/g, "\n");

  if (Array.isArray(configItem)) {
    configItem.forEach((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return;
      }
      Object.entries(item).forEach(([code, desc]) => {
        if (typeof desc === "string") {
          valueExplainMap[String(code)] = normalizeExplainText(desc);
        }
      });
    });
    return valueExplainMap;
  }

  if (configItem && typeof configItem === "object" && !Array.isArray(configItem)) {
    Object.entries(configItem).forEach(([code, desc]) => {
      if (typeof desc === "string") {
        valueExplainMap[String(code)] = normalizeExplainText(desc);
      }
    });
  }

  return valueExplainMap;
}

function parsePositionSpec(positionKey) {
  const raw = String(positionKey || "").trim();

  const singlePos = Number(raw);
  if (Number.isInteger(singlePos) && singlePos > 0) {
    return {
      mode: "single",
      start: singlePos,
      end: singlePos,
      positions: [singlePos],
      label: String(singlePos),
    };
  }

  const comboMatch = raw.match(/^(\d+)\s*(,\s*\d+)+$/);
  if (comboMatch) {
    const positions = raw
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0);

    if (positions.length >= 2) {
      return {
        mode: "combo",
        start: Math.min(...positions),
        end: Math.max(...positions),
        positions,
        label: positions.join(","),
      };
    }
  }

  const rangeMatch = raw.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!rangeMatch) {
    return null;
  }

  const start = Number(rangeMatch[1]);
  const end = Number(rangeMatch[2]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end <= 0 || start > end) {
    return null;
  }

  return {
    mode: "range",
    start,
    end,
    positions: [],
    label: `${start}-${end}`,
  };
}

function normalizeExplainValue(value) {
  return String(value ?? "").replace(/\s+/g, "");
}

const parsedConfigEntries = computed(() => {
  const config = selectedExplainConfig.value || {};
  return Object.keys(config)
    .map((positionKey) => {
      const positionSpec = parsePositionSpec(positionKey);
      if (!positionSpec) {
        return null;
      }

      const valueExplainMap = buildValueExplainMap(config[positionKey]);

      return {
        ...positionSpec,
        rawKey: String(positionKey || "").trim(),
        valueExplainMap,
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return a.end - b.end;
    });
});

function collectSourceValues(item) {
  const sourceValues = [];

  const mapValue = activeSendpayMap.value[item.rawKey] ?? activeSendpayMap.value[item.label];
  if (mapValue !== undefined && mapValue !== null && String(mapValue).trim() !== "") {
    sourceValues.push({
      source: "sendpayMap",
      value: String(mapValue).trim(),
    });
  }

  if (item.mode === "combo") {
    const digits = item.positions
      .map((position) => sendpayValue.value[position - 1])
      .filter((char) => char !== undefined);

    if (digits.length === item.positions.length) {
      sourceValues.push({
        source: "sendpay",
        value: digits.join(","),
      });
    }
  } else {
    const startIndex = item.start - 1;
    const endIndex = item.end;
    const actualValue = sendpayValue.value.slice(startIndex, endIndex);
    const expectedLength = item.end - item.start + 1;

    if (actualValue && actualValue.length === expectedLength) {
      sourceValues.push({
        source: "sendpay",
        value: actualValue,
      });
    }
  }

  return sourceValues;
}

function buildCandidateEntries(item, sourceValues) {
  return sourceValues.flatMap((itemValue) => {
    const candidates = [itemValue.value, normalizeExplainValue(itemValue.value)];
    if (item.mode === "combo") {
      candidates.push(itemValue.value.replace(/\s+/g, "").replace(/,/g, ""));
    }

    return candidates
      .filter((candidate, index, arr) => candidate && arr.indexOf(candidate) === index)
      .map((candidate) => ({
        source: itemValue.source,
        displayValue: itemValue.value,
        candidate,
      }));
  });
}

const resolvedExplanationRows = computed(() => {
  return parsedConfigEntries.value.map((item) => {
    const sourceValues = collectSourceValues(item);
    const candidateEntries = buildCandidateEntries(item, sourceValues);
    const matchedEntry = candidateEntries.find((entry) => !!item.valueExplainMap[entry.candidate]);
    const explanation = matchedEntry ? item.valueExplainMap[matchedEntry.candidate] : "";
    const allValueEntries = Object.entries(item.valueExplainMap)
      .filter(([, text]) => typeof text === "string" && text)
      .map(([key, text]) => ({
        value: key,
        explanation: text,
      }));

    const sourceLabels = Array.from(new Set(sourceValues.map((entry) => entry.source)));
    const sourceLabel = sourceLabels.length > 1 ? "sendpay + sendpayMap" : (sourceLabels[0] || "-");

    if (!matchedEntry || !explanation) {
      const attemptedValues = sourceValues.map((entry) => `${entry.source}: ${entry.value}`);
      return {
        rowKey: `${item.rawKey}|unmatched`,
        positionLabel: item.label,
        value: attemptedValues.length ? attemptedValues.join(" / ") : "-",
        sourceLabel,
        explanation: attemptedValues.length
          ? t("tool.sendpayDisplay.unmatchedInput")
          : t("tool.sendpayDisplay.noInputForMatch"),
        expandValueEntries: allValueEntries,
        matched: false,
      };
    }

    const matchedKey = matchedEntry.candidate;
    const otherValueEntries = allValueEntries.filter((entry) => entry.value !== matchedKey);

    return {
      rowKey: `${item.rawKey}|${matchedEntry.source}|${matchedEntry.displayValue}`,
      positionLabel: item.label,
      value: matchedEntry.displayValue,
      sourceLabel,
      explanation,
      expandValueEntries: otherValueEntries,
      matched: true,
    };
  });
});

const explanationRows = computed(() => {
  if (!hasExplainInput.value) {
    return [];
  }

  return resolvedExplanationRows.value.filter((row) => row.matched);
});

const displayExplanationRows = computed(() => {
  if (allExplainEnabled.value) {
    return resolvedExplanationRows.value;
  }
  return explanationRows.value;
});

const expandableRowKeys = computed(() => {
  return displayExplanationRows.value
    .filter((row) => row.expandValueEntries.length)
    .map((row) => row.rowKey);
});

const allRowsExpanded = computed(() => {
  const keys = expandableRowKeys.value;
  if (!keys.length) {
    return false;
  }
  return keys.every((rowKey) => !!expandedCompareRows.value[rowKey]);
});

function toggleCompareRow(rowKey) {
  expandedCompareRows.value[rowKey] = !expandedCompareRows.value[rowKey];
}

function toggleAllCompareRows() {
  const keys = expandableRowKeys.value;
  if (!keys.length) {
    return;
  }

  const nextExpanded = !allRowsExpanded.value;
  const nextRows = { ...expandedCompareRows.value };
  keys.forEach((rowKey) => {
    nextRows[rowKey] = nextExpanded;
  });
  expandedCompareRows.value = nextRows;
}

function isCompareRowExpanded(rowKey) {
  return !!expandedCompareRows.value[rowKey];
}

function getDefaultConfigText() {
  return JSON.stringify({
    "1": [
      { "0": t("tool.sendpayDisplay.examples.singleZero") },
      { "1": t("tool.sendpayDisplay.examples.singleOne") },
    ],
    "3-5": [
      { "123": t("tool.sendpayDisplay.examples.range") },
    ],
    "3,5": [
      { "1,4": t("tool.sendpayDisplay.examples.combo") },
    ],
  }, null, 2);
}

function applyProfiles(profiles, preferCurrent = true) {
  const nextProfiles = profiles.map((item, index) => createProfile(item, index));
  const prevSelectedId = selectedProfileId.value;

  configProfiles.value = nextProfiles;

  if (!nextProfiles.length) {
    selectedProfileId.value = null;
    return;
  }

  if (preferCurrent && nextProfiles.some((item) => item.id === prevSelectedId)) {
    selectedProfileId.value = prevSelectedId;
    return;
  }

  selectedProfileId.value = nextProfiles[0].id;
}

function saveProfilesToStorage(profiles, broadcast = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  if (broadcast) {
    window.dispatchEvent(new CustomEvent(CONFIG_SYNC_EVENT));
  }
}

function loadProfilesFromStorage() {
  const localValue = localStorage.getItem(STORAGE_KEY);
  if (localValue) {
    try {
      const parsed = JSON.parse(localValue);
      if (!Array.isArray(parsed)) {
        throw new Error("invalid profiles");
      }

      applyProfiles(parsed, true);
      return;
    } catch {
      notify("warning", t("tool.sendpayDisplay.profileListReadFailed"));
      configProfiles.value = [];
      selectedProfileId.value = null;
      saveProfilesToStorage([], false);
      return;
    }
  }

  const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyValue) {
    configProfiles.value = [];
    selectedProfileId.value = null;
    saveProfilesToStorage([], false);
    return;
  }

  try {
    const parsed = JSON.parse(legacyValue);
    if (!isObject(parsed)) {
      throw new Error("invalid format");
    }

    const migrated = [
      createProfile(
        {
          id: Date.now(),
          name: makeDefaultProfileName(0),
          format: FORMAT_JSON,
          url: "",
          config: parsed,
        },
        0
      ),
    ];
    applyProfiles(migrated, false);
    saveProfilesToStorage(migrated, false);
  } catch {
    notify("warning", t("tool.sendpayDisplay.legacyConfigReadFailed"));
    configProfiles.value = [];
    selectedProfileId.value = null;
    saveProfilesToStorage([], false);
  }
}

async function fetchProfileConfigByUrl(profile) {
  const url = String(profile.url || "").trim();
  if (!url) {
    return { ok: false, message: t("tool.sendpayDisplay.profileUrlMissing", { name: profile.name }) };
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, message: t("tool.sendpayDisplay.profileFetchHttpFailed", { name: profile.name, status: response.status }) };
    }

    const data = await response.json();
    const parsed = parseExplainConfigPayload(data);
    if (!parsed.ok) {
      return { ok: false, message: t("tool.sendpayDisplay.profileFetchFailed", { name: profile.name, message: parsed.message }) };
    }

    return {
      ok: true,
      config: parsed.config,
      title: parsed.title,
      nameLocked: parsed.nameLocked,
      raw: parsed.raw,
    };
  } catch {
    return { ok: false, message: t("tool.sendpayDisplay.profileFetchNetworkFailed", { name: profile.name }) };
  }
}

async function refreshUrlProfilesOnLoad() {
  if (!configProfiles.value.length) {
    return;
  }

  const nextProfiles = configProfiles.value.map((item) => ({ ...item }));
  let changed = false;

  for (let i = 0; i < nextProfiles.length; i += 1) {
    if (nextProfiles[i].format !== FORMAT_URL) {
      continue;
    }

    const result = await fetchProfileConfigByUrl(nextProfiles[i]);
    if (result.ok) {
      nextProfiles[i].config = normalizeExplainConfig(result.config);
      nextProfiles[i].nameLocked = !!result.nameLocked;
      if (result.nameLocked && result.title) {
        nextProfiles[i].name = result.title;
      }
      changed = true;
    }
  }

  if (changed) {
    applyProfiles(nextProfiles, true);
    saveProfilesToStorage(nextProfiles);
  }
}

function openConfig() {
  editingProfiles.value = configProfiles.value.map((item, index) => toEditingProfile(item, index));
  showConfigModal.value = true;
}

function addProfile() {
  const profile = toEditingProfile(
    {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: makeDefaultProfileName(editingProfiles.value.length),
      format: FORMAT_JSON,
      url: "",
      config: {},
    },
    editingProfiles.value.length
  );
  profile.configText = getDefaultConfigText();
  editingProfiles.value.push(profile);
}

function removeProfile(id) {
  editingProfiles.value = editingProfiles.value.filter((item) => item.id !== id);
}

function onProfileFormatChange(profile) {
  profile.format = normalizeFormat(profile.format);
  if (profile.format !== FORMAT_URL) {
    profile.url = "";
  }
}

async function pullProfileConfig(profile) {
  const result = await fetchProfileConfigByUrl(profile);
  if (!result.ok) {
    notify("error", result.message);
    return;
  }

  profile.configText = JSON.stringify(result.raw, null, 2);
  if (result.nameLocked && result.title) {
    profile.name = result.title;
  }
  profile.nameLocked = !!result.nameLocked;
  notify("success", t("tool.sendpayDisplay.profileFetchSuccess", { name: profile.name }));
}

async function saveConfig() {
  try {
    const nextProfiles = [];

    for (let i = 0; i < editingProfiles.value.length; i += 1) {
      const profile = editingProfiles.value[i];
      const normalized = createProfile(profile, i);

      if (normalized.format === FORMAT_URL) {
        const pulled = await fetchProfileConfigByUrl(normalized);
        if (!pulled.ok) {
          notify("error", pulled.message);
          return;
        }
        normalized.config = normalizeExplainConfig(pulled.config);
        normalized.nameLocked = !!pulled.nameLocked;
        if (pulled.nameLocked && pulled.title) {
          normalized.name = pulled.title;
        }
      } else {
        const parsedPayload = parseExplainConfigPayload(JSON.parse(profile.configText || "{}"));
        if (!parsedPayload.ok) {
          notify("warning", t("tool.sendpayDisplay.profileConfigInvalid", { name: normalized.name, message: parsedPayload.message }));
          return;
        }
        normalized.config = parsedPayload.config;
        normalized.nameLocked = !!parsedPayload.nameLocked;
        if (parsedPayload.nameLocked && parsedPayload.title) {
          normalized.name = parsedPayload.title;
        }
      }

      nextProfiles.push(normalized);
    }

    applyProfiles(nextProfiles, true);
    saveProfilesToStorage(nextProfiles);

    showConfigModal.value = false;
    notify("success", t("tool.sendpayDisplay.configSaved"));
  } catch {
    notify("error", t("tool.sendpayDisplay.jsonFormatError"));
  }
}

async function readSendpayClipboard() {
  const text = await readFromClipboard();
  const sendpayText = parseClipboardSendpay(text);
  if (sendpayText) {
    sendpayInput.value = sendpayText;
    return;
  }
  notify("warning", t("tool.sendpayDisplay.clipboardNoText"));
}

function fillSendpayExample() {
  sendpayInput.value = tm('examples.sendpayDisplay.sendpay');
  if (sendpayMapEnabled.value) {
    sendpayMapInput.value = JSON.stringify(tm('examples.sendpayDisplay.sendpayMap'));
  }
}

function clearAll() {
  sendpayInput.value = "";
  sendpayMapInput.value = "";
}

function startEdit(position, currentValue) {
  editingPosition.value = position;
  editingValue.value = String(currentValue ?? "").replace(/\D/g, "").slice(0, 1);

  nextTick(() => {
    const el = document.getElementById(`pair-edit-${position}`);
    if (!el) {
      return;
    }
    el.focus();
    el.select();
  });
}

function onEditInput(event) {
  const value = String(event.target?.value ?? "").replace(/\D/g, "").slice(0, 1);
  editingValue.value = value;
  if (event.target) {
    event.target.value = value;
  }
}

function cancelEdit() {
  editingPosition.value = null;
  editingValue.value = "";
}

function saveEdit(silent = false) {
  if (editingPosition.value === null) {
    return;
  }

  if (!/^\d$/.test(editingValue.value)) {
    if (!silent) {
      notify("warning", t("tool.sendpayDisplay.onlyOneDigit"));
    }
    cancelEdit();
    return;
  }

  const chars = sendpayValue.value.split("");
  const idx = editingPosition.value - 1;
  if (idx < 0 || idx >= chars.length) {
    cancelEdit();
    return;
  }

  chars[idx] = editingValue.value;
  sendpayInput.value = chars.join("");
  cancelEdit();
}

function startMapEdit(position, currentValue) {
  editingMapPosition.value = position;
  editingMapValue.value = String(currentValue ?? "");
  nextTick(() => {
    const el = document.getElementById(`map-edit-${position}`);
    if (!el) {
      return;
    }
    el.focus();
    el.select();
  });
}

function onMapEditInput(event) {
  const value = String(event.target?.value ?? "");
  editingMapValue.value = value;
  if (event.target) {
    event.target.value = value;
  }
}

function cancelMapEdit() {
  editingMapPosition.value = null;
  editingMapValue.value = "";
}

function saveMapEdit(silent = false) {
  if (editingMapPosition.value === null) {
    return;
  }

  const newValue = editingMapValue.value.trim();
  if (!newValue) {
    if (!silent) {
      notify("warning", t("tool.sendpayDisplay.nonEmptyValueOnly"));
    }
    cancelMapEdit();
    return;
  }

  try {
    const text = String(sendpayMapInput.value ?? "").trim();
    const parsed = text ? JSON.parse(text) : {};
    parsed[editingMapPosition.value] = newValue;
    sendpayMapInput.value = JSON.stringify(parsed);
  } catch {
    if (!silent) {
      notify("error", t("tool.sendpayDisplay.sendpayMapEditFailed"));
    }
  }
  cancelMapEdit();
}

function handleProfilesSync() {
  loadProfilesFromStorage();
}

function handleStorageSync(event) {
  if (event.key === STORAGE_KEY) {
    loadProfilesFromStorage();
  }
}

onMounted(() => {
  window.addEventListener(CONFIG_SYNC_EVENT, handleProfilesSync);
  window.addEventListener("storage", handleStorageSync);
});

onUnmounted(() => {
  window.removeEventListener(CONFIG_SYNC_EVENT, handleProfilesSync);
  window.removeEventListener("storage", handleStorageSync);
});

loadProfilesFromStorage();
refreshUrlProfilesOnLoad();
</script>

<template>
  <div class="sendpay-root w-full h-full p-2 flex flex-col gap-2">
    <div class="w-full flex flex-col gap-2">
      <div class="h-8 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <n-tag size="large" type="warning">{{ t('tool.sendpayDisplay.input') }}</n-tag>
          <n-button @click="readSendpayClipboard">{{ t('common.clipboard') }}</n-button>
          <n-button @click="fillSendpayExample">{{ t('common.example') }}</n-button>
          <n-button @click="clearAll">{{ t('common.clear') }}</n-button>
          <n-switch v-model:value="sendpayMapEnabled" size="large">
              <template #checked>sendpayMap</template>
              <template #unchecked>sendpayMap</template>
            </n-switch>
        </div>
        <div class="flex items-center gap-2">
          <n-switch v-model:value="allExplainEnabled" size="large">
            <template #checked>{{ t('tool.sendpayDisplay.allExplanations') }}</template>
            <template #unchecked>{{ t('tool.sendpayDisplay.allExplanations') }}</template>
          </n-switch>
          <n-button
            quaternary
            circle
            size="small"
            :disabled="!expandableRowKeys.length"
            @click="toggleAllCompareRows"
          >
            <n-icon class="explain-toggle-icon">
              <ChevronUpCircleOutline v-if="allRowsExpanded" />
              <ChevronDownCircleOutline v-else />
            </n-icon>
          </n-button>
          <n-select
            v-model:value="selectedProfileId"
            class="profile-select"
            :options="profileOptions"
            :placeholder="t('tool.sendpayDisplay.selectProfile')"
            clearable
          />
          <n-button @click="openConfig">{{ t('tool.sendpayDisplay.settings') }}</n-button>
        </div>
      </div>
      <n-input
        v-model:value="sendpayInput"
        class="sendpay-input"
        type="textarea"
        inputmode="numeric"
        :autosize="{ minRows: 3, maxRows: 10 }"
        :placeholder="t('tool.sendpayDisplay.sendpayPlaceholder')"
        @input="handleSendpayInput"
      />
      <n-input
        v-if="sendpayMapEnabled"
        v-model:value="sendpayMapInput"
        class="sendpay-input"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :placeholder="sendpayMapPlaceholder"
      />
      <div v-if="sendpayMapEnabled && sendpayMapError" class="text-xs text-red-500">
        {{ sendpayMapError }}
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <SplitPanel :default-size="0.75" :min="0.5" :max="0.9">
        <template #left>
          <div class="h-full overflow-auto lk-result-surface p-2">
            <div v-if="sendpayPairs.length || sendpayMapPairs.length" class="space-y-3">
              <div v-if="sendpayPairs.length" class="pair-grid">
                <table v-for="item in sendpayPairs" :key="item.position" class="pair-table">
                  <tbody>
                    <tr>
                      <td class="pair-position">{{ item.position }}</td>
                    </tr>
                    <tr>
                      <td class="pair-value" @dblclick="startEdit(item.position, item.value)">
                        <input
                          v-if="editingPosition === item.position"
                          :id="`pair-edit-${item.position}`"
                          class="pair-value-editor"
                          :value="editingValue"
                          maxlength="1"
                          inputmode="numeric"
                          @input="onEditInput"
                          @blur="saveEdit(true)"
                          @keydown.enter.prevent="saveEdit"
                        />
                        <span v-else>{{ item.value }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="sendpayMapPairs.length" class="space-y-1">
                <div class="pair-grid">
                  <table v-for="item in sendpayMapPairs" :key="item.position" class="pair-table map-pair-table">
                    <tbody>
                      <tr>
                        <td class="pair-position">{{ item.position }}</td>
                      </tr>
                      <tr>
                        <td class="pair-value" @dblclick="startMapEdit(item.position, item.value)">
                          <input
                            v-if="editingMapPosition === item.position"
                            :id="`map-edit-${item.position}`"
                            class="pair-value-editor"
                            :value="editingMapValue"
                            @input="onMapEditInput"
                            @blur="saveMapEdit(true)"
                            @keydown.enter.prevent="saveMapEdit"
                          />
                          <span v-else>{{ item.value }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else class="h-full flex items-center justify-center">
              <n-empty :description="t('tool.sendpayDisplay.emptyInput')" />
            </div>
          </div>
        </template>

        <template #right>
          <div class="h-full overflow-auto lk-result-surface p-2">
            <div v-if="!parsedConfigEntries.length" class="h-full flex items-center justify-center">
              <n-empty :description="t('tool.sendpayDisplay.emptyConfig')" />
            </div>
            <div v-else-if="!allExplainEnabled && !hasExplainInput" class="h-full flex items-center justify-center">
              <n-empty :description="t('tool.sendpayDisplay.inputToShowExplanation')" />
            </div>
            <div v-else-if="!displayExplanationRows.length" class="h-full flex items-center justify-center">
              <n-empty :description="t('tool.sendpayDisplay.noMatchedExplanation')" />
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="row in displayExplanationRows"
                :key="row.rowKey"
                :class="['explain-item', { 'explain-item-unmatched': allExplainEnabled && !row.matched }]"
              >
                <div class="explain-head">
                  <span>
                    {{ t('tool.sendpayDisplay.positionLabel', { position: row.positionLabel }) }}
                    <template v-if="row.matched"> = {{ row.value }} ({{ row.sourceLabel }})</template>
                    <template v-else> ({{ t('tool.sendpayDisplay.unmatched') }})</template>
                  </span>
                  <button
                    v-if="row.expandValueEntries.length"
                    type="button"
                    class="explain-toggle-btn"
                    @click.stop="toggleCompareRow(row.rowKey)"
                  >
                    <n-icon class="explain-toggle-icon">
                      <ChevronUpCircleOutline v-if="isCompareRowExpanded(row.rowKey)" />
                      <ChevronDownCircleOutline v-else />
                    </n-icon>
                  </button>
                </div>
                <div class="explain-body">{{ row.explanation }}</div>
                <div v-if="row.expandValueEntries.length && isCompareRowExpanded(row.rowKey)" class="explain-compare-list">
                  <div v-for="item in row.expandValueEntries" :key="item.value" class="explain-compare-item">
                    <div class="explain-compare-key">{{ item.value }}</div>
                    <div class="explain-compare-text">{{ item.explanation }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </SplitPanel>
    </div>

    <n-modal v-model:show="showConfigModal" preset="card" :title="t('tool.sendpayDisplay.configTitle')" style="width: 860px" :mask-closable="false">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('tool.sendpayDisplay.configHelp') }}
          </div>
          <n-button size="small" @click="addProfile">{{ t('tool.sendpayDisplay.addProfile') }}</n-button>
        </div>

        <div v-if="!editingProfiles.length" class="h-36 border border-dashed empty-result-surface flex items-center justify-center text-slate-400 dark:text-slate-500">
          {{ t('tool.sendpayDisplay.noProfileTip') }}
        </div>

        <div v-else class="max-h-[520px] overflow-auto pr-1 space-y-3">
          <div v-for="(profile, index) in editingProfiles" :key="profile.id" class="lk-result-surface p-3 bg-green-50/20 dark:bg-green-950/20 space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>#{{ index + 1 }}</span>
                <span>ID: {{ profile.id }}</span>
              </div>
              <n-button size="tiny" @click="removeProfile(profile.id)">{{ t('tool.sendpayDisplay.deleteProfile') }}</n-button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <n-input
                v-model:value="profile.name"
                class="config-setting-input"
                :placeholder="t('tool.sendpayDisplay.profileNamePlaceholder')"
                :readonly="profile.nameLocked"
              />
              <n-select
                v-model:value="profile.format"
                :options="formatOptions"
                @update:value="onProfileFormatChange(profile)"
              />
            </div>

            <div v-if="isUrlFormatProfile(profile)" class="flex items-center gap-2">
              <n-input v-model:value="profile.url" class="config-setting-input" placeholder="https://example.com/config.json" />
              <n-button @click="pullProfileConfig(profile)">{{ t('tool.sendpayDisplay.pull') }}</n-button>
            </div>

            <n-input
              v-model:value="profile.configText"
              class="config-setting-input"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 12 }"
              :placeholder="configPlaceholder"
              :readonly="isUrlFormatProfile(profile)"
            />
          </div>
        </div>
      </div>
      <template #action>
        <div class="w-full flex justify-end gap-2">
          <n-button @click="showConfigModal = false">{{ t('tool.sendpayDisplay.cancel') }}</n-button>
          <n-button type="primary" @click="saveConfig">{{ t('tool.sendpayDisplay.save') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.sendpay-root {
  --sendpay-text-main: #2d6a4f;
  --sendpay-text-strong: #1b4332;
  --sendpay-text-subtle: #52796f;
  --sendpay-border: #b7e4c7;
  --sendpay-border-strong: #7ccf98;
  --sendpay-border-strong-hover: #63c784;
  --sendpay-bg-panel: #f2fbf4;
  --sendpay-bg-head: #d8f3dc;
  --sendpay-bg-body: #f7fff8;
  --sendpay-bg-input: #ffffff;
  --sendpay-unmatched-border: #f4a5a5;
  --sendpay-unmatched-head: #fee2e2;
  --sendpay-unmatched-body: #fff5f5;
  --sendpay-unmatched-text-main: #b91c1c;
  --sendpay-unmatched-text-strong: #991b1b;
  --sendpay-compare-bg: #fbfffc;
  --sendpay-compare-unmatched-bg: #fffafa;
  --sendpay-compare-unmatched-border: #fecaca;
}

:global(html.dark .sendpay-root),
:global(html[data-theme='dark'] .sendpay-root) {
  --sendpay-text-main: #a7f3d0;
  --sendpay-text-strong: #d1fae5;
  --sendpay-text-subtle: #86efac;
  --sendpay-border: #166534;
  --sendpay-border-strong: #16a34a;
  --sendpay-border-strong-hover: #22c55e;
  --sendpay-bg-panel: rgba(20, 83, 45, 0.26);
  --sendpay-bg-head: rgba(22, 101, 52, 0.45);
  --sendpay-bg-body: rgba(20, 83, 45, 0.28);
  --sendpay-bg-input: rgba(15, 23, 42, 0.8);
  --sendpay-unmatched-border: #b91c1c;
  --sendpay-unmatched-head: rgba(153, 27, 27, 0.45);
  --sendpay-unmatched-body: rgba(127, 29, 29, 0.3);
  --sendpay-unmatched-text-main: #fecaca;
  --sendpay-unmatched-text-strong: #fee2e2;
  --sendpay-compare-bg: rgba(20, 83, 45, 0.22);
  --sendpay-compare-unmatched-bg: rgba(127, 29, 29, 0.24);
  --sendpay-compare-unmatched-border: #fca5a5;
}

.pair-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 6px;
}

.map-title {
  font-size: 12px;
  color: var(--sendpay-text-main);
  font-weight: 600;
}

.pair-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--sendpay-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--sendpay-bg-panel);
}

.pair-table td {
  border: 1px solid var(--sendpay-border);
  padding: 4px 6px;
  text-align: center;
  font-size: 12px;
}

.map-pair-table .pair-value {
  cursor: text;
}

.pair-position {
  background: var(--sendpay-bg-head);
  color: var(--sendpay-text-strong);
  font-weight: 600;
}

.pair-value {
  background: var(--sendpay-bg-body);
  color: var(--sendpay-text-main);
  font-weight: 600;
  cursor: text;
}

.pair-value-editor {
  width: 100%;
  border: 1px solid var(--sendpay-border-strong);
  border-radius: 4px;
  padding: 2px 0;
  text-align: center;
  outline: none;
  background: var(--sendpay-bg-input);
  color: var(--sendpay-text-main);
}

.pair-value-editor:focus {
  border-color: var(--sendpay-border-strong-hover);
  box-shadow: 0 0 0 2px rgba(99, 199, 132, 0.18);
}

.pair-value-editor::selection {
  background: rgba(99, 199, 132, 0.22);
  color: var(--sendpay-text-strong);
}

.pair-value-editor::-moz-selection {
  background: rgba(99, 199, 132, 0.22);
  color: var(--sendpay-text-strong);
}

.explain-item {
  border: 1px solid var(--sendpay-border);
  border-radius: 6px;
  overflow: hidden;
}

.explain-item-unmatched {
  border-color: var(--sendpay-unmatched-border);
}

.explain-head {
  background: var(--sendpay-bg-head);
  color: var(--sendpay-text-strong);
  font-size: 13px;
  padding: 6px 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.explain-body {
  background: var(--sendpay-bg-body);
  color: var(--sendpay-text-main);
  font-size: 13px;
  padding: 8px;
  line-height: 1.5;
  white-space: pre-line;
}

.explain-item-unmatched .explain-head {
  background: var(--sendpay-unmatched-head);
  color: var(--sendpay-unmatched-text-strong);
}

.explain-item-unmatched .explain-body {
  background: var(--sendpay-unmatched-body);
  color: var(--sendpay-unmatched-text-main);
}

.explain-toggle-btn {
  border: none;
  background: transparent;
  color: var(--sendpay-text-main);
  width: 22px;
  height: 22px;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.explain-toggle-btn:hover {
  color: var(--sendpay-text-strong);
}

.explain-item-unmatched .explain-toggle-btn {
  color: var(--sendpay-unmatched-text-main);
}

.explain-item-unmatched .explain-toggle-btn:hover {
  color: var(--sendpay-unmatched-text-strong);
}

.explain-toggle-icon {
  font-size: 20px;
}

.explain-compare-list {
  border-top: 1px dashed var(--sendpay-border);
  background: var(--sendpay-compare-bg);
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.explain-item-unmatched .explain-compare-list {
  border-top-color: var(--sendpay-compare-unmatched-border);
  background: var(--sendpay-compare-unmatched-bg);
}

.explain-compare-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
}

.explain-compare-key {
  min-width: 36px;
  color: var(--sendpay-text-main);
  font-weight: 600;
}

.explain-compare-text {
  color: var(--sendpay-text-subtle);
  line-height: 1.4;
  white-space: pre-line;
}

.profile-select {
  width: 200px;
}

.sendpay-input :deep(textarea::selection) {
  background: rgba(99, 199, 132, 0.2);
  color: var(--sendpay-text-strong);
}

.sendpay-input :deep(textarea::-moz-selection) {
  background: rgba(99, 199, 132, 0.2);
  color: var(--sendpay-text-strong);
}

.config-setting-input :deep(input::selection),
.config-setting-input :deep(textarea::selection) {
  background: rgba(99, 199, 132, 0.2);
  color: var(--sendpay-text-strong);
}

.config-setting-input :deep(input::-moz-selection),
.config-setting-input :deep(textarea::-moz-selection) {
  background: rgba(99, 199, 132, 0.2);
  color: var(--sendpay-text-strong);
}
</style>
