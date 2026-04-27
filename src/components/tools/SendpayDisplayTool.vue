<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { NButton, NEmpty, NIcon, NInput, NModal, NSelect, NSwitch, NTag } from "naive-ui";
import { ChevronDownCircleOutline, ChevronUpCircleOutline } from "@vicons/ionicons5";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";

const { notify, readFromClipboard } = useCommon();

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
const expandedCompareRows = ref({});

const formatOptions = [
  { label: "Json", value: FORMAT_JSON },
  { label: "URL", value: FORMAT_URL },
];

function normalizeSendpay(raw) {
  return String(raw ?? "").replace(/\D+/g, "");
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
        error: "sendpayMap 需为 JSON 对象",
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
      error: "sendpayMap JSON 解析失败",
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
      message: "配置内容必须是 JSON 对象",
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
        message: "新版本配置缺少有效 title",
        config: {},
        title: "",
        nameLocked: false,
        raw: payload,
      };
    }

    if (!isObject(payload.config)) {
      return {
        ok: false,
        message: "新版本配置中的 config 必须是 JSON 对象",
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
  return `配置${index + 1}`;
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
        explanation: attemptedValues.length ? "当前输入未匹配到解释" : "当前无可用于匹配的输入值",
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
  return `{
  "1": [
    {"0": "示例-单标位：第1位=0的含义"},
    {"1": "示例-单标位：第1位=1的含义"}
  ],
  "3-5": [
    {"123": "示例-区间：第3-5位=123的含义"}
  ],
  "3,5": [
    {"1,4": "示例-多标位组合：第3位=1 且 第5位=4的含义"}
  ]
}`;
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
      notify("warning", "配置列表读取失败，已重置为空");
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
          name: "配置1",
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
    notify("warning", "旧配置读取失败，已重置为空");
    configProfiles.value = [];
    selectedProfileId.value = null;
    saveProfilesToStorage([], false);
  }
}

async function fetchProfileConfigByUrl(profile) {
  const url = String(profile.url || "").trim();
  if (!url) {
    return { ok: false, message: `配置「${profile.name}」未填写 URL` };
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, message: `配置「${profile.name}」拉取失败: HTTP ${response.status}` };
    }

    const data = await response.json();
    const parsed = parseExplainConfigPayload(data);
    if (!parsed.ok) {
      return { ok: false, message: `配置「${profile.name}」拉取失败: ${parsed.message}` };
    }

    return {
      ok: true,
      config: parsed.config,
      title: parsed.title,
      nameLocked: parsed.nameLocked,
      raw: parsed.raw,
    };
  } catch {
    return { ok: false, message: `配置「${profile.name}」拉取失败，请检查 URL 或跨域策略` };
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
  notify("success", `配置「${profile.name}」拉取成功`);
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
          notify("warning", `配置「${normalized.name}」${parsedPayload.message}`);
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
    notify("success", "标位解释配置已保存");
  } catch {
    notify("error", "JSON 格式错误，请检查后重试");
  }
}

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    sendpayInput.value = normalizeSendpay(text);
    return;
  }
  notify("warning", "剪贴板中没有可用文本");
}

function showExample() {
  sendpayInput.value = Array.from({ length: 256 }, (_, index) => String(index % 10)).join("");
  if (sendpayMapEnabled.value) {
    sendpayMapInput.value = '{"520":"1","1002":"6","1024":9}';
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
      notify("warning", "只能输入 1 位数字");
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
  <div class="w-full h-full p-2 flex flex-col gap-2">
    <div class="w-full flex flex-col gap-2">
      <div class="h-8 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <n-tag size="large" type="warning">Sendpay 输入</n-tag>
          <n-button @click="readClipboard">剪贴板</n-button>
          <n-button @click="showExample">示例</n-button>
          <n-button @click="clearAll">清空</n-button>
          <n-switch v-model:value="sendpayMapEnabled" size="large">
              <template #checked>sendpayMap</template>
              <template #unchecked>sendpayMap</template>
            </n-switch>
        </div>
        <div class="flex items-center gap-2">
          <n-switch v-model:value="allExplainEnabled" size="large">
            <template #checked>所有解释</template>
            <template #unchecked>所有解释</template>
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
            placeholder="选择配置"
            clearable
          />
          <n-button @click="openConfig">设置</n-button>
        </div>
      </div>
      <n-input
        v-model:value="sendpayInput"
        class="sendpay-input"
        type="textarea"
        inputmode="numeric"
        :autosize="{ minRows: 3, maxRows: 10 }"
        placeholder="输入订单 sendpay 信息"
        @input="handleSendpayInput"
      />
      <n-input
        v-if="sendpayMapEnabled"
        v-model:value="sendpayMapInput"
        class="sendpay-input"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder='输入 sendpayMap，例如：{"520":"1","1002":"6","1024":9}'
      />
      <div v-if="sendpayMapEnabled && sendpayMapError" class="text-xs text-red-500">
        {{ sendpayMapError }}
      </div>
    </div>

    <div class="flex-1 min-h-0">
      <SplitPanel :default-size="0.75" :min="0.5" :max="0.9">
        <template #left>
          <div class="h-full p-2 border border-green-100 rounded overflow-auto">
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
                        <td class="pair-value">{{ item.value }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else class="h-full flex items-center justify-center">
              <n-empty description="请输入 sendpay 或 sendpayMap 信息" />
            </div>
          </div>
        </template>

        <template #right>
          <div class="h-full p-2 border border-green-100 rounded overflow-auto">
            <div v-if="!parsedConfigEntries.length" class="h-full flex items-center justify-center">
              <n-empty description="当前配置暂无可展示解释" />
            </div>
            <div v-else-if="!allExplainEnabled && !hasExplainInput" class="h-full flex items-center justify-center">
              <n-empty description="输入 sendpay 或 sendpayMap 后展示解释" />
            </div>
            <div v-else-if="!displayExplanationRows.length" class="h-full flex items-center justify-center">
              <n-empty description="当前配置中无可匹配解释" />
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="row in displayExplanationRows"
                :key="row.rowKey"
                :class="['explain-item', { 'explain-item-unmatched': allExplainEnabled && !row.matched }]"
              >
                <div class="explain-head">
                  <span>
                    第 {{ row.positionLabel }} 位
                    <template v-if="row.matched"> = {{ row.value }} ({{ row.sourceLabel }})</template>
                    <template v-else> (未匹配)</template>
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

    <n-modal v-model:show="showConfigModal" preset="card" title="标位解释配置" style="width: 860px" :mask-closable="false">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            支持多份配置，格式可选 URL/Json。URL 配置在保存和页面进入时会自动拉取并更新。
          </div>
          <n-button size="small" @click="addProfile">新增配置</n-button>
        </div>

        <div v-if="!editingProfiles.length" class="h-36 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
          暂无配置，点击右上角“新增配置”创建。
        </div>

        <div v-else class="max-h-[520px] overflow-auto pr-1 space-y-3">
          <div v-for="(profile, index) in editingProfiles" :key="profile.id" class="border border-green-100 rounded p-3 bg-green-50/20 space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>#{{ index + 1 }}</span>
                <span>ID: {{ profile.id }}</span>
              </div>
              <n-button size="tiny" @click="removeProfile(profile.id)">删除</n-button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <n-input
                v-model:value="profile.name"
                class="config-setting-input"
                placeholder="配置名称"
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
              <n-button @click="pullProfileConfig(profile)">拉取</n-button>
            </div>

            <n-input
              v-model:value="profile.configText"
              class="config-setting-input"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 12 }"
              placeholder='{"1":[{"0":"第1位0的含义"}],"8":[{"2":"第8位2的含义"}]}'
              :readonly="isUrlFormatProfile(profile)"
            />
          </div>
        </div>
      </div>
      <template #action>
        <div class="w-full flex justify-end gap-2">
          <n-button @click="showConfigModal = false">取消</n-button>
          <n-button type="primary" @click="saveConfig">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.pair-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 6px;
}

.map-title {
  font-size: 12px;
  color: #2d6a4f;
  font-weight: 600;
}

.pair-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #b7e4c7;
  border-radius: 6px;
  overflow: hidden;
  background: #f2fbf4;
}

.pair-table td {
  border: 1px solid #b7e4c7;
  padding: 4px 6px;
  text-align: center;
  font-size: 12px;
}

.map-pair-table .pair-value {
  cursor: default;
}

.pair-position {
  background: #d8f3dc;
  color: #1b4332;
  font-weight: 600;
}

.pair-value {
  background: #f7fff8;
  color: #2d6a4f;
  font-weight: 600;
  cursor: text;
}

.pair-value-editor {
  width: 100%;
  border: 1px solid #7ccf98;
  border-radius: 4px;
  padding: 2px 0;
  text-align: center;
  outline: none;
  background: #ffffff;
  color: #2d6a4f;
}

.pair-value-editor:focus {
  border-color: #63c784;
  box-shadow: 0 0 0 2px rgba(99, 199, 132, 0.18);
}

.pair-value-editor::selection {
  background: rgba(99, 199, 132, 0.22);
  color: #1b4332;
}

.pair-value-editor::-moz-selection {
  background: rgba(99, 199, 132, 0.22);
  color: #1b4332;
}

.explain-item {
  border: 1px solid #b7e4c7;
  border-radius: 6px;
  overflow: hidden;
}

.explain-item-unmatched {
  border-color: #f4a5a5;
}

.explain-head {
  background: #d8f3dc;
  color: #1b4332;
  font-size: 13px;
  padding: 6px 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.explain-body {
  background: #f7fff8;
  color: #2d6a4f;
  font-size: 13px;
  padding: 8px;
  line-height: 1.5;
  white-space: pre-line;
}

.explain-item-unmatched .explain-head {
  background: #fee2e2;
  color: #991b1b;
}

.explain-item-unmatched .explain-body {
  background: #fff5f5;
  color: #b91c1c;
}

.explain-toggle-btn {
  border: none;
  background: transparent;
  color: #2d6a4f;
  width: 22px;
  height: 22px;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.explain-toggle-btn:hover {
  color: #1b4332;
}

.explain-item-unmatched .explain-toggle-btn {
  color: #b91c1c;
}

.explain-item-unmatched .explain-toggle-btn:hover {
  color: #991b1b;
}

.explain-toggle-icon {
  font-size: 20px;
}

.explain-compare-list {
  border-top: 1px dashed #b7e4c7;
  background: #fbfffc;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.explain-item-unmatched .explain-compare-list {
  border-top-color: #fecaca;
  background: #fffafa;
}

.explain-compare-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
}

.explain-compare-key {
  min-width: 36px;
  color: #2d6a4f;
  font-weight: 600;
}

.explain-compare-text {
  color: #52796f;
  line-height: 1.4;
  white-space: pre-line;
}

.profile-select {
  width: 200px;
}

.sendpay-input :deep(textarea::selection) {
  background: rgba(99, 199, 132, 0.2);
  color: #1b4332;
}

.sendpay-input :deep(textarea::-moz-selection) {
  background: rgba(99, 199, 132, 0.2);
  color: #1b4332;
}

.config-setting-input :deep(input::selection),
.config-setting-input :deep(textarea::selection) {
  background: rgba(99, 199, 132, 0.2);
  color: #1b4332;
}

.config-setting-input :deep(input::-moz-selection),
.config-setting-input :deep(textarea::-moz-selection) {
  background: rgba(99, 199, 132, 0.2);
  color: #1b4332;
}
</style>
