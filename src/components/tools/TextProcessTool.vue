<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NCascader, NDropdown, NIcon, NInput, NModal, NSelect, NTag } from "naive-ui";
import {
  Add24Regular as AddIcon,
  ArrowMaximizeVertical24Regular as ExpandAllIcon,
  ArrowMinimizeVertical24Regular as CollapseAllIcon,
  ChevronDown24Regular as ChevronDownIcon,
  ChevronRight24Regular as ChevronRightIcon,
  Delete24Regular as DeleteIcon,
  Play24Regular as PlayIcon,
  Settings24Regular as SettingsIcon,
} from "@vicons/fluent";
import { ChevronDownOutline } from "@vicons/ionicons5";
import SplitPanel from "../common/SplitPanel.vue";
import { useCommon } from "../../composables/useCommon";
import { useDataTransfer } from "../../composables/useDataTransfer";

const STORAGE_KEY = "lonekit.textProcess.scripts";

const OP_PREFIX = "prefix";
const OP_SUFFIX = "suffix";
const OP_LINE_PREFIX = "linePrefix";
const OP_LINE_SUFFIX = "lineSuffix";
const OP_LINE_SUFFIX_EXCEPT_LAST = "lineSuffixExceptLast";
const OP_REMOVE_LINE_PREFIX = "removeLinePrefix";
const OP_REMOVE_LINE_SUFFIX = "removeLineSuffix";
const OP_LINE_NUMBER = "lineNumber";
const OP_REMOVE_EMPTY_LINES = "removeEmptyLines";
const OP_TRIM_LINES = "trimLines";
const OP_SORT_LINES = "sortLines";
const OP_UNIQUE_LINES = "uniqueLines";
const OP_JOIN_LINES = "joinLines";
const OP_SPLIT_BY_DELIMITER = "splitByDelimiter";
const OP_COMPRESS_SPACES = "compressSpaces";
const OP_COMPRESS_EMPTY_LINES = "compressEmptyLines";
const OP_REPLACE_NEWLINE = "replaceNewline";
const OP_ADD_EMPTY_LINE_SPACING = "addEmptyLineSpacing";
const OP_TYPES = [
  OP_PREFIX,
  OP_SUFFIX,
  OP_LINE_PREFIX,
  OP_LINE_SUFFIX,
  OP_LINE_SUFFIX_EXCEPT_LAST,
  OP_REMOVE_LINE_PREFIX,
  OP_REMOVE_LINE_SUFFIX,
  OP_LINE_NUMBER,
  OP_REMOVE_EMPTY_LINES,
  OP_TRIM_LINES,
  OP_SORT_LINES,
  OP_UNIQUE_LINES,
  OP_JOIN_LINES,
  OP_SPLIT_BY_DELIMITER,
  OP_COMPRESS_SPACES,
  OP_COMPRESS_EMPTY_LINES,
  OP_REPLACE_NEWLINE,
  OP_ADD_EMPTY_LINE_SPACING,
];

const { t, tm } = useI18n();
const { notify, readFromClipboard, copyToClipboard } = useCommon();
const { send } = useDataTransfer();

const source = ref("");
const result = ref("");
const scripts = ref(readScripts());
const selectedScriptId = ref(scripts.value[0]?.id ?? null);
const showSettings = ref(false);
const editingScripts = ref([]);

const operationOptions = computed(() => [
  {
    label: t("tool.textProcess.categories.wholeText"),
    value: "wholeText",
    children: [
      { label: t("tool.textProcess.operations.prefix"), value: OP_PREFIX },
      { label: t("tool.textProcess.operations.suffix"), value: OP_SUFFIX },
    ],
  },
  {
    label: t("tool.textProcess.categories.line"),
    value: "line",
    children: [
      { label: t("tool.textProcess.operations.linePrefix"), value: OP_LINE_PREFIX },
      { label: t("tool.textProcess.operations.lineSuffix"), value: OP_LINE_SUFFIX },
      { label: t("tool.textProcess.operations.lineSuffixExceptLast"), value: OP_LINE_SUFFIX_EXCEPT_LAST },
      { label: t("tool.textProcess.operations.removeLinePrefix"), value: OP_REMOVE_LINE_PREFIX },
      { label: t("tool.textProcess.operations.removeLineSuffix"), value: OP_REMOVE_LINE_SUFFIX },
      { label: t("tool.textProcess.operations.lineNumber"), value: OP_LINE_NUMBER },
      { label: t("tool.textProcess.operations.removeEmptyLines"), value: OP_REMOVE_EMPTY_LINES },
      { label: t("tool.textProcess.operations.trimLines"), value: OP_TRIM_LINES },
      { label: t("tool.textProcess.operations.sortLines"), value: OP_SORT_LINES },
      { label: t("tool.textProcess.operations.uniqueLines"), value: OP_UNIQUE_LINES },
    ],
  },
  {
    label: t("tool.textProcess.categories.joinSplit"),
    value: "joinSplit",
    children: [
      { label: t("tool.textProcess.operations.joinLines"), value: OP_JOIN_LINES },
      { label: t("tool.textProcess.operations.splitByDelimiter"), value: OP_SPLIT_BY_DELIMITER },
      { label: t("tool.textProcess.operations.compressSpaces"), value: OP_COMPRESS_SPACES },
      { label: t("tool.textProcess.operations.compressEmptyLines"), value: OP_COMPRESS_EMPTY_LINES },
      { label: t("tool.textProcess.operations.replaceNewline"), value: OP_REPLACE_NEWLINE },
      { label: t("tool.textProcess.operations.addEmptyLineSpacing"), value: OP_ADD_EMPTY_LINE_SPACING },
    ],
  },
]);

const scriptOptions = computed(() =>
  scripts.value.map((script) => ({
    label: script.name,
    value: script.id,
  }))
);

function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createOperation(type = "", value = "") {
  return {
    id: createId("operation"),
    type,
    value,
  };
}

function createScript(name = "") {
  return {
    id: createId("script"),
    name: name || t("tool.textProcess.defaultScriptName", { index: editingScripts.value.length + 1 }),
    operations: [createOperation()],
  };
}

function normalizeOperation(operation) {
  if (!OP_TYPES.includes(operation?.type)) return null;
  return createOperation(operation.type, String(operation?.value ?? ""));
}

function normalizeScript(script, index) {
  const operations = Array.isArray(script?.operations)
    ? script.operations.map(normalizeOperation).filter(Boolean)
    : [];

  return {
    id: typeof script?.id === "string" && script.id ? script.id : createId("script"),
    name: String(script?.name || t("tool.textProcess.defaultScriptName", { index: index + 1 })).trim(),
    operations,
  };
}

function readScripts() {
  if (typeof window === "undefined") return [];
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeScript).filter((script) => script.name);
  } catch (error) {
    console.warn("[text-process] read scripts failed", error);
    return [];
  }
}

function saveScripts(nextScripts) {
  scripts.value = nextScripts;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextScripts));
  }
  if (!scripts.value.some((script) => script.id === selectedScriptId.value)) {
    selectedScriptId.value = scripts.value[0]?.id ?? null;
  }
}

function splitLines(text) {
  return String(text ?? "").split(/\r\n|\r|\n/);
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function applyOperation(input, operation) {
  const text = String(input ?? "");
  const value = String(operation.value ?? "");
  if (!OP_TYPES.includes(operation.type)) return text;

  switch (operation.type) {
    case OP_PREFIX:
      return `${value}${text}`;
    case OP_SUFFIX:
      return `${text}${value}`;
    case OP_LINE_PREFIX:
      return splitLines(text).map((line) => `${value}${line}`).join("\n");
    case OP_LINE_SUFFIX:
      return splitLines(text).map((line) => `${line}${value}`).join("\n");
    case OP_LINE_SUFFIX_EXCEPT_LAST: {
      const lines = splitLines(text);
      return lines.map((line, index) => (index === lines.length - 1 ? line : `${line}${value}`)).join("\n");
    }
    case OP_REMOVE_LINE_PREFIX:
      return value ? splitLines(text).map((line) => (line.startsWith(value) ? line.slice(value.length) : line)).join("\n") : text;
    case OP_REMOVE_LINE_SUFFIX:
      return value ? splitLines(text).map((line) => (line.endsWith(value) ? line.slice(0, -value.length) : line)).join("\n") : text;
    case OP_LINE_NUMBER:
      return splitLines(text).map((line, index) => `${index + 1}${value || ". "}${line}`).join("\n");
    case OP_REMOVE_EMPTY_LINES:
      return splitLines(text).filter((line) => line.trim() !== "").join("\n");
    case OP_TRIM_LINES:
      return splitLines(text).map((line) => line.trim()).join("\n");
    case OP_SORT_LINES:
      return [...splitLines(text)].sort((a, b) => a.localeCompare(b)).join("\n");
    case OP_UNIQUE_LINES: {
      const seen = new Set();
      return splitLines(text).filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      }).join("\n");
    }
    case OP_JOIN_LINES:
      return splitLines(text).join(value);
    case OP_SPLIT_BY_DELIMITER:
      return value ? text.split(value).join("\n") : text;
    case OP_COMPRESS_SPACES:
      return text.replace(/[^\S\r\n]+/g, " ");
    case OP_COMPRESS_EMPTY_LINES:
      return text.replace(/(?:\r\n|\r|\n){3,}/g, "\n\n");
    case OP_REPLACE_NEWLINE:
      return splitLines(text).join(value);
    case OP_ADD_EMPTY_LINE_SPACING: {
      const emptyLineCount = parsePositiveInteger(value, 1);
      return splitLines(text).join("\n".repeat(emptyLineCount + 1));
    }
    default:
      return text;
  }
}

function runScript() {
  const script = scripts.value.find((item) => item.id === selectedScriptId.value);
  if (!script) {
    notify("warning", t("tool.textProcess.noScriptSelected"));
    return;
  }

  result.value = script.operations.reduce((current, operation) => applyOperation(current, operation), source.value || "");
  notify("success", t("tool.textProcess.executed"));
}

async function readClipboard() {
  const text = await readFromClipboard();
  if (text !== null && text !== undefined) {
    source.value = text;
  }
}

function showExample() {
  source.value = tm("examples.textProcess");
}

function clearAll() {
  source.value = "";
  result.value = "";
}

function copySource() {
  copyToClipboard(source.value);
}

function copyResult() {
  copyToClipboard(result.value);
}

function sendTextToDiff(text) {
  if (!text) {
    notify("warning", t("tool.noSendableContent"));
    return;
  }

  send("DiffTool", text);
  notify("success", t("tool.sentToDiff"));
}

function sendSourceToDiff() {
  sendTextToDiff(source.value);
}

function sendResultToDiff() {
  sendTextToDiff(result.value);
}

const sourceMoreOptions = computed(() => [
  { label: t("tool.sendToDiff"), key: "diff" },
]);

const resultMoreOptions = computed(() => [
  { label: t("tool.sendToDiff"), key: "diff" },
]);

function handleSourceMoreSelect(key) {
  if (key === "diff") sendSourceToDiff();
}

function handleResultMoreSelect(key) {
  if (key === "diff") sendResultToDiff();
}

function openSettings() {
  editingScripts.value = scripts.value.map((script, index) => ({
    ...normalizeScript(script, index),
    collapsed: false,
  }));
  showSettings.value = true;
}

function addScript() {
  editingScripts.value.push(createScript());
}

function removeScript(scriptId) {
  editingScripts.value = editingScripts.value.filter((script) => script.id !== scriptId);
}

function addOperation(script) {
  script.operations.push(createOperation());
}

function removeOperation(script, operationId) {
  script.operations = script.operations.filter((operation) => operation.id !== operationId);
}

function toggleScriptCollapse(script) {
  script.collapsed = !script.collapsed;
}

function collapseAllScripts() {
  editingScripts.value.forEach((script) => {
    script.collapsed = true;
  });
}

function expandAllScripts() {
  editingScripts.value.forEach((script) => {
    script.collapsed = false;
  });
}

function saveSettings() {
  const nextScripts = editingScripts.value
    .map((script, index) => normalizeScript(script, index))
    .filter((script) => script.name);

  saveScripts(nextScripts);
  showSettings.value = false;
  notify("success", t("tool.textProcess.saved"));
}
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel>
      <template #left>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="lk-toolbar lk-toolbar--compact text-process-toolbar">
            <n-tag size="large" type="warning">{{ t('common.input') }}</n-tag>
            <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExample">{{ t('common.example') }}</n-button>
            <n-button @click="clearAll">{{ t('common.clear') }}</n-button>
            <n-button @click="copySource">{{ t('common.copy') }}</n-button>
            <n-dropdown :options="sourceMoreOptions" @select="handleSourceMoreSelect">
              <n-button>
                <template #icon>
                  <n-icon :component="ChevronDownOutline" />
                </template>
              </n-button>
            </n-dropdown>
          </div>
          <div class="flex-1 min-h-0 w-full text-xl">
            <n-input
              v-model:value="source"
              type="textarea"
              class="w-full h-full"
              :placeholder="t('tool.textProcess.inputPlaceholder')"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="h-full p-2 flex flex-col space-y-2">
          <div class="lk-toolbar lk-toolbar--compact text-process-toolbar">
            <n-tag size="large" type="success">{{ t('common.output') }}</n-tag>
            <n-select
              v-model:value="selectedScriptId"
              :options="scriptOptions"
              :placeholder="t('tool.textProcess.selectScript')"
              class="text-process-script-select"
            />
            <n-button type="primary" @click="runScript">
              <template #icon>
                <n-icon :component="PlayIcon" />
              </template>
              {{ t('tool.textProcess.execute') }}
            </n-button>
            <n-button @click="copyResult">{{ t('common.copy') }}</n-button>
            <n-dropdown :options="resultMoreOptions" @select="handleResultMoreSelect">
              <n-button>
                <template #icon>
                  <n-icon :component="ChevronDownOutline" />
                </template>
              </n-button>
            </n-dropdown>
            <n-button class="text-process-settings-button" circle :title="t('tool.textProcess.settings')" @click="openSettings">
              <template #icon>
                <n-icon :component="SettingsIcon" />
              </template>
            </n-button>
          </div>
          <div class="flex-1 min-h-0 w-full text-xl">
            <n-input
              v-model:value="result"
              type="textarea"
              class="w-full h-full"
              readonly
              :placeholder="t('tool.textProcess.resultPlaceholder')"
            />
          </div>
        </div>
      </template>
    </SplitPanel>

    <n-modal v-model:show="showSettings" preset="card" :title="t('tool.textProcess.scriptSettings')" style="width: 920px" :mask-closable="false">
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-slate-500 dark:text-slate-400">{{ t('tool.textProcess.settingsHelp') }}</div>
          <div class="flex items-center gap-2">
            <n-button size="small" circle :title="t('common.collapseAll')" @click="collapseAllScripts">
              <template #icon>
                <n-icon :component="CollapseAllIcon" />
              </template>
            </n-button>
            <n-button size="small" circle :title="t('common.expandAll')" @click="expandAllScripts">
              <template #icon>
                <n-icon :component="ExpandAllIcon" />
              </template>
            </n-button>
            <n-button size="small" @click="addScript">
              <template #icon>
                <n-icon :component="AddIcon" />
              </template>
              {{ t('tool.textProcess.addScript') }}
            </n-button>
          </div>
        </div>

        <div v-if="!editingScripts.length" class="h-36 border border-dashed empty-result-surface flex items-center justify-center text-slate-400 dark:text-slate-500">
          {{ t('tool.textProcess.noScriptTip') }}
        </div>

        <div v-else class="max-h-[560px] overflow-auto pr-1 space-y-3">
          <div v-for="(script, scriptIndex) in editingScripts" :key="script.id" class="lk-result-surface p-3 space-y-3">
            <div class="flex items-center gap-2">
              <n-button size="small" circle :title="script.collapsed ? t('tool.textProcess.expandScript') : t('tool.textProcess.collapseScript')" @click="toggleScriptCollapse(script)">
                <template #icon>
                  <n-icon :component="script.collapsed ? ChevronRightIcon : ChevronDownIcon" />
                </template>
              </n-button>
              <n-tag size="small" type="info">#{{ scriptIndex + 1 }}</n-tag>
              <n-input v-model:value="script.name" :placeholder="t('tool.textProcess.scriptNamePlaceholder')" />
              <n-button size="small" circle :title="t('tool.textProcess.deleteScript')" @click="removeScript(script.id)">
                <template #icon>
                  <n-icon :component="DeleteIcon" />
                </template>
              </n-button>
            </div>

            <div v-if="!script.collapsed" class="space-y-2">
              <div v-for="(operation, operationIndex) in script.operations" :key="operation.id" class="text-process-operation-row">
                <span class="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{{ operationIndex + 1 }}</span>
                <n-cascader
                  v-model:value="operation.type"
                  :options="operationOptions"
                  check-strategy="child"
                  expand-trigger="hover"
                  :placeholder="t('tool.textProcess.operationPlaceholder')"
                  class="text-process-operation-cascader"
                />
                <n-input v-model:value="operation.value" :placeholder="t('tool.textProcess.paramPlaceholder')" />
                <n-button size="small" circle :title="t('tool.textProcess.deleteOperation')" @click="removeOperation(script, operation.id)">
                  <template #icon>
                    <n-icon :component="DeleteIcon" />
                  </template>
                </n-button>
              </div>
              <n-button size="small" dashed @click="addOperation(script)">
                <template #icon>
                  <n-icon :component="AddIcon" />
                </template>
                {{ t('tool.textProcess.addOperation') }}
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div class="w-full flex justify-end gap-2">
          <n-button @click="showSettings = false">{{ t('tool.textProcess.cancel') }}</n-button>
          <n-button type="primary" @click="saveSettings">{{ t('tool.textProcess.save') }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.text-process-toolbar {
  min-height: 34px;
  flex-wrap: wrap;
}

.text-process-script-select {
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  flex: 1 1 220px;
}

.text-process-settings-button {
  margin-left: auto;
}

.text-process-operation-row {
  display: grid;
  grid-template-columns: 24px 210px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 8px;
}

.text-process-operation-cascader {
  width: 210px;
}

@media (max-width: 760px) {
  .text-process-toolbar {
    flex-wrap: wrap;
  }

  .text-process-script-select {
    width: 100%;
    flex: 1 1 100%;
  }

  .text-process-operation-row {
    grid-template-columns: 24px minmax(0, 1fr) 34px;
  }

  .text-process-operation-row :deep(.text-process-operation-cascader) {
    grid-column: 2 / 3;
  }

  .text-process-operation-row :deep(.n-input) {
    grid-column: 2 / 4;
  }
}
</style>
