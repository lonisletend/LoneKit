<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NDatePicker,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NSelect,
  NTooltip,
} from "naive-ui";
import { Copy24Regular, Play24Filled } from "@vicons/fluent";
import { Cron } from "croner";
import cronstrue from "cronstrue";
import "cronstrue/locales/zh_CN";
import SplitPanel from "../common/SplitPanel.vue";
import CronFieldEditor from "./cron/CronFieldEditor.vue";
import { useCommon } from "../../composables/useCommon";
import {
  CRON_DIALECTS,
  convertCronDialect,
  parseCron,
  stringifyCron,
} from "../../utils/cronUtil";

const { t, locale } = useI18n();
const { copyToClipboard, readFromClipboard, notify } = useCommon();
const nextYear = new Date().getFullYear() + 1;

const examples = [
  { dialect: "standard-5", expression: "* * * * *" },
  { dialect: "standard-5", expression: "*/5 * * * *" },
  { dialect: "standard-5", expression: "30 8 * * 1-5" },
  { dialect: "standard-5", expression: "0,30 9-18 * * 1-5" },
  { dialect: "standard-5", expression: "5-55/10 8-20 1,15 1-6 1-5" },
  { dialect: "seconds-6", expression: "* * * * * *" },
  { dialect: "seconds-6", expression: "*/10 * * * * *" },
  { dialect: "seconds-6", expression: "0 30 8 * * 1-5" },
  { dialect: "seconds-6", expression: "0,30 0,30 9-18 * * 1-5" },
  { dialect: "seconds-6", expression: "5-55/10 0,30 8-20 1,15 1-6 1-5" },
  { dialect: "year-7", expression: "* * * * * * *" },
  { dialect: "year-7", expression: "0 0 9 ? * 1-5 *" },
  { dialect: "year-7", expression: "0 0 9 L * ? *" },
  { dialect: "year-7", expression: "0 0 9 15W * ? *" },
  { dialect: "year-7", expression: `0 0 9 ? 1-6 1#2 ${nextYear}-${nextYear + 4}/2` },
];

const dialect = ref("standard-5");
const expression = ref(examples[0].expression);
const document = ref(parseCron(expression.value, dialect.value));
const parseError = ref("");
const exampleIndex = ref(0);
const runCount = ref(10);
const startMode = ref("current");
const startTime = ref(Date.now());
const runDates = ref([]);

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const dialectOptions = computed(() => [
  { label: t("tool.cron.dialects.standard5"), value: "standard-5" },
  { label: t("tool.cron.dialects.seconds6"), value: "seconds-6" },
  { label: t("tool.cron.dialects.year7"), value: "year-7" },
]);
const countOptions = [5, 10, 20, 50, 100].map((value) => ({ label: String(value), value }));
const startModeOptions = computed(() => [
  { label: t("tool.cron.startModes.current"), value: "current" },
  { label: t("tool.cron.startModes.custom"), value: "custom" },
]);
const activeFieldKeys = computed(() => CRON_DIALECTS[dialect.value].fieldKeys);

function describeNode(node) {
  switch (node.type) {
    case "any":
      return t("tool.cron.structured.any");
    case "noSpecific":
      return t("tool.cron.structured.noSpecific");
    case "value":
      return String(node.value);
    case "range":
      return t("tool.cron.structured.range", { from: node.from, to: node.to });
    case "step":
      if (node.base.type === "any") {
        return t("tool.cron.structured.step", { step: node.step });
      }
      return node.base.type === "value"
        ? t("tool.cron.structured.valueStep", { from: node.base.value, step: node.step })
        : t("tool.cron.structured.rangeStep", { from: node.base.from, to: node.base.to, step: node.step });
    case "list":
      return node.items.map(describeNode).join(t("tool.cron.structured.separator"));
    case "lastDay":
      return t("tool.cron.structured.lastDay");
    case "lastWeekday":
      return t("tool.cron.structured.lastWeekday");
    case "nearestWeekday":
      return t("tool.cron.structured.nearestWeekday", { day: node.day });
    case "lastWeekdayOfMonth":
      return t("tool.cron.structured.lastWeekdayOfMonth", { weekday: node.weekday });
    case "nthWeekdayOfMonth":
      return t("tool.cron.structured.nthWeekdayOfMonth", { weekday: node.weekday, nth: node.nth });
    default:
      return "";
  }
}

function describeDocument() {
  return activeFieldKeys.value
    .map((fieldKey) => t("tool.cron.structured.field", {
      field: t(`tool.cron.fields.${fieldKey}`),
      value: describeNode(document.value.fields[fieldKey]),
    }))
    .join(t("tool.cron.structured.fieldSeparator"));
}

const description = computed(() => {
  if (parseError.value) return "";
  try {
    return cronstrue.toString(expression.value, {
      locale: locale.value === "zh-CN" ? "zh_CN" : "en",
      use24HourTimeFormat: true,
      dayOfWeekStartIndexZero: true,
      throwExceptionOnParseError: true,
    });
  } catch {
    return describeDocument();
  }
});

function getCronOptions(value, expressionDialect) {
  const config = CRON_DIALECTS[expressionDialect];
  const parts = value.trim().split(/\s+/);
  const usesNoSpecificDay = ["dayOfMonth", "dayOfWeek"].some((fieldKey) => {
    const index = config.fieldKeys.indexOf(fieldKey);
    return index >= 0 && parts[index] === "?";
  });
  return {
    mode: config.cronerMode,
    timezone: localTimezone,
    domAndDow: usesNoSpecificDay,
    sloppyRanges: true,
  };
}

function validateExpression(value, expressionDialect) {
  new Cron(value, getCronOptions(value, expressionDialect));
}

function applyExpression(value, forcedDialect) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const dialectByPartCount = {
    5: "standard-5",
    6: "seconds-6",
    7: "year-7",
  };
  const inferredDialect = forcedDialect || dialectByPartCount[parts.length] || dialect.value;
  try {
    const parsed = parseCron(value, inferredDialect);
    const normalized = stringifyCron(parsed);
    validateExpression(normalized, inferredDialect);
    dialect.value = inferredDialect;
    document.value = parsed;
    parseError.value = "";
    return true;
  } catch (error) {
    parseError.value = error.message;
    return false;
  }
}

function handleExpressionInput(value) {
  expression.value = value;
  applyExpression(value);
  runDates.value = [];
}

function handleDialectChange(value) {
  const converted = convertCronDialect(document.value, value);
  dialect.value = value;
  exampleIndex.value = 0;
  applyDocument(converted);
  runDates.value = [];
}

function applyDocument(nextDocument) {
  document.value = nextDocument;
  try {
    expression.value = stringifyCron(nextDocument);
    validateExpression(expression.value, nextDocument.dialect);
    parseError.value = "";
  } catch (error) {
    parseError.value = error.message;
  }
}

function updateField(fieldKey, value) {
  const nextDocument = {
    ...document.value,
    fields: { ...document.value.fields, [fieldKey]: value },
  };
  applyDocument(nextDocument);
  runDates.value = [];
}

async function readClipboard() {
  const value = await readFromClipboard();
  if (!value?.trim()) {
    notify("warning", t("tool.cron.clipboardNoText"));
    return;
  }
  expression.value = value.trim();
  applyExpression(expression.value);
}

function showExample() {
  const dialectExamples = examples.filter((example) => example.dialect === dialect.value);
  if (!dialectExamples.length) return;
  const example = dialectExamples[exampleIndex.value % dialectExamples.length];
  exampleIndex.value += 1;
  expression.value = example.expression;
  applyExpression(example.expression, example.dialect);
  runDates.value = [];
}

function clear() {
  expression.value = "";
  parseError.value = t("tool.cron.emptyExpression");
  runDates.value = [];
}

function run() {
  if (startMode.value === "current") {
    startTime.value = Date.now();
  }
  if (!applyExpression(expression.value, dialect.value)) {
    notify("warning", t("tool.cron.fixExpression"));
    return;
  }
  try {
    const cron = new Cron(expression.value, getCronOptions(expression.value, dialect.value));
    runDates.value = cron.nextRuns(runCount.value, new Date(startTime.value));
    if (!runDates.value.length) notify("warning", t("tool.cron.noRuns"));
  } catch (error) {
    parseError.value = error.message;
    notify("error", t("tool.cron.runFailed", { message: error.message }));
  }
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${day} ${time}`;
}

function copyRunDate(date) {
  copyToClipboard(formatDate(date));
}

onMounted(run);
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel :default-size="0.5">
      <template #left>
        <div class="cron-pane cron-editor-pane">
          <div class="lk-toolbar lk-toolbar--compact cron-editor-toolbar">
            <n-select class="cron-dialect-select" :value="dialect" :options="dialectOptions" @update:value="handleDialectChange" />
            <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
            <n-button @click="showExample">{{ t('common.example') }}</n-button>
            <n-button @click="clear">{{ t('common.clear') }}</n-button>
            <n-button type="primary" ghost @click="copyToClipboard(expression)">{{ t('common.copy') }}</n-button>
          </div>

          <n-input
            :value="expression"
            class="cron-expression-input"
            :status="parseError ? 'error' : 'success'"
            :placeholder="t('tool.cron.expressionPlaceholder')"
            clearable
            @update:value="handleExpressionInput"
          />

          <div class="cron-description" :class="{ 'cron-description--error': parseError }">
            <span>{{ parseError || description }}</span>
          </div>

          <div class="cron-field-list">
            <CronFieldEditor
              v-for="fieldKey in activeFieldKeys"
              :key="fieldKey"
              :field-key="fieldKey"
              :model-value="document.fields[fieldKey]"
              @update:model-value="(value) => updateField(fieldKey, value)"
              @invalid="(message) => notify('warning', message)"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="cron-pane cron-runs-pane">
          <div class="lk-toolbar lk-toolbar--compact cron-run-toolbar">
            <n-button type="primary" @click="run">
              <template #icon><n-icon :component="Play24Filled" /></template>
              {{ t('tool.cron.run') }}
            </n-button>
            <n-input-group class="cron-count-group">
              <n-input-group-label>{{ t('tool.cron.count') }}</n-input-group-label>
              <n-select v-model:value="runCount" class="cron-count-select" :options="countOptions" />
            </n-input-group>
            <n-input-group class="cron-start-group">
              <n-input-group-label>{{ t('tool.cron.startTime') }}</n-input-group-label>
              <n-select v-model:value="startMode" class="cron-start-mode-select" :options="startModeOptions" />
              <n-date-picker
                v-model:value="startTime"
                type="datetime"
                class="cron-start-picker"
                :disabled="startMode === 'current'"
              />
            </n-input-group>
          </div>

          <div class="cron-run-list lk-result-surface">
            <div v-if="!runDates.length" class="cron-empty-result">{{ t('tool.cron.noRunResults') }}</div>
            <div v-for="(date, index) in runDates" :key="date.getTime()" class="cron-run-row">
              <span class="cron-run-index">{{ t('tool.cron.runIndex', { index: index + 1 }) }}</span>
              <time :datetime="date.toISOString()">{{ formatDate(date) }}</time>
              <n-tooltip>
                <template #trigger>
                  <n-button quaternary circle size="small" :aria-label="t('common.copy')" @click="copyRunDate(date)">
                    <template #icon><n-icon :component="Copy24Regular" /></template>
                  </n-button>
                </template>
                {{ t('common.copy') }}
              </n-tooltip>
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>
.cron-pane {
  height: 100%;
  min-height: 0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cron-editor-pane {
  margin-right: 12px;
  overflow-y: auto;
}

.cron-runs-pane {
  margin-left: 12px;
  overflow: hidden;
}

.cron-dialect-select {
  width: 160px;
  min-width: 160px;
}

.cron-editor-toolbar {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
}

.cron-expression-input :deep(.n-input__input-el) {
  font-family: Monaco, Menlo, Consolas, monospace;
  font-size: 17px;
}

.cron-description {
  min-height: 42px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 3px solid #18a058;
  background: rgba(24, 160, 88, 0.07);
}

.cron-description--error {
  border-left-color: #d03050;
  background: rgba(208, 48, 80, 0.07);
}

.cron-field-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

.cron-run-toolbar {
  align-items: center;
}

.cron-count-group {
  width: 142px;
}

.cron-start-group {
  flex: 1 1 320px;
  min-width: 280px;
}

.cron-count-select {
  width: 78px;
}

.cron-start-mode-select {
  width: 88px;
  min-width: 88px;
}

.cron-start-picker {
  flex: 1;
  min-width: 0;
}

/* flex-basis 用 0px 而非 0%：WebKit(Tauri) 下百分比 basis 可能按 auto 处理，列表会被撑开而无法滚动 */
.cron-run-list {
  flex: 1 1 0px;
  min-height: 0;
  overflow-y: auto;
}

.cron-run-row {
  min-height: 44px;
  padding: 6px 10px;
  display: grid;
  grid-template-columns: minmax(76px, auto) minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px dashed color-mix(in srgb, var(--lk-surface-border) 60%, transparent);
}

.cron-run-row > * {
  display: flex;
  align-items: center;
  line-height: 1.4;
}

.cron-run-row:last-child {
  border-bottom: 0;
}

.cron-run-index {
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.cron-run-row time {
  font-family: Monaco, Menlo, Consolas, monospace;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.cron-empty-result {
  height: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

@media (max-width: 920px) {
  .cron-run-row {
    grid-template-columns: minmax(68px, auto) minmax(0, 1fr) 34px;
  }
}
</style>
