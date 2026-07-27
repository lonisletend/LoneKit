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
  NTag,
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

const examples = [
  { dialect: "standard-5", expression: "*/5 * * * *" },
  { dialect: "standard-5", expression: "0 9-18 * * 1-5" },
  { dialect: "standard-5", expression: "30 8 1,15 * *" },
  { dialect: "seconds-6", expression: "*/10 * * * * *" },
  { dialect: "seconds-6", expression: "0 0 12 * * 1-5" },
];

const dialect = ref("standard-5");
const expression = ref(examples[0].expression);
const document = ref(parseCron(expression.value, dialect.value));
const parseError = ref("");
const exampleIndex = ref(0);
const runCount = ref(10);
const startTime = ref(Date.now());
const runDates = ref([]);

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const timezone = ref(localTimezone);
const timezoneOptions = computed(() => {
  const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  const values = Array.from(new Set([localTimezone, "UTC", "Asia/Shanghai", ...supported]));
  return values.map((value) => ({
    label: value === localTimezone ? `${value} (${t("tool.cron.local")})` : value,
    value,
  }));
});
const dialectOptions = computed(() => [
  { label: t("tool.cron.dialects.standard5"), value: "standard-5" },
  { label: t("tool.cron.dialects.seconds6"), value: "seconds-6" },
]);
const countOptions = [5, 10, 20, 50, 100].map((value) => ({ label: String(value), value }));
const activeFieldKeys = computed(() => CRON_DIALECTS[dialect.value].fieldKeys);

function describeNode(node) {
  switch (node.type) {
    case "any":
      return t("tool.cron.structured.any");
    case "value":
      return String(node.value);
    case "range":
      return t("tool.cron.structured.range", { from: node.from, to: node.to });
    case "step":
      return node.base.type === "any"
        ? t("tool.cron.structured.step", { step: node.step })
        : t("tool.cron.structured.rangeStep", { from: node.base.from, to: node.base.to, step: node.step });
    case "list":
      return node.items.map(describeNode).join(t("tool.cron.structured.separator"));
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

const hasCompositeList = computed(() => activeFieldKeys.value.some((fieldKey) => {
  const field = document.value.fields[fieldKey];
  return field?.type === "list" && field.items.some((item) => item.type !== "value");
}));

const description = computed(() => {
  if (parseError.value) return "";
  if (hasCompositeList.value) return describeDocument();
  try {
    return cronstrue.toString(expression.value, {
      locale: locale.value === "zh-CN" ? "zh_CN" : "en",
      use24HourTimeFormat: true,
      dayOfWeekStartIndexZero: true,
      throwExceptionOnParseError: true,
    });
  } catch (error) {
    return error.message;
  }
});

function validateExpression(value, expressionDialect) {
  const mode = CRON_DIALECTS[expressionDialect].cronerMode;
  new Cron(value, { mode, timezone: timezone.value });
}

function applyExpression(value, forcedDialect) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const inferredDialect = forcedDialect || (parts.length === 6 ? "seconds-6" : parts.length === 5 ? "standard-5" : dialect.value);
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
  const example = examples[exampleIndex.value % examples.length];
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
  if (!applyExpression(expression.value, dialect.value)) {
    notify("warning", t("tool.cron.fixExpression"));
    return;
  }
  try {
    const cron = new Cron(expression.value, {
      mode: CRON_DIALECTS[dialect.value].cronerMode,
      timezone: timezone.value,
    });
    runDates.value = cron.nextRuns(runCount.value, new Date(startTime.value || Date.now()));
    if (!runDates.value.length) notify("warning", t("tool.cron.noRuns"));
  } catch (error) {
    parseError.value = error.message;
    notify("error", t("tool.cron.runFailed", { message: error.message }));
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat(locale.value, {
    timeZone: timezone.value,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function copyRunDate(date) {
  copyToClipboard(formatDate(date));
}

onMounted(run);
</script>

<template>
  <div class="w-full h-full">
    <SplitPanel :default-size="0.58" :min="0.36" :max="0.75">
      <template #left>
        <div class="cron-pane cron-editor-pane">
          <div class="lk-toolbar lk-toolbar--compact">
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
            <n-tag size="small" :type="parseError ? 'error' : 'success'">
              {{ parseError ? t('tool.cron.invalid') : t('tool.cron.description') }}
            </n-tag>
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
              <n-date-picker v-model:value="startTime" type="datetime" class="cron-start-picker" clearable />
            </n-input-group>
            <n-input-group class="cron-timezone-group">
              <n-input-group-label>{{ t('tool.cron.timezone') }}</n-input-group-label>
              <n-select v-model:value="timezone" class="cron-timezone-select" :options="timezoneOptions" filterable />
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
}

.cron-dialect-select {
  width: 180px;
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

.cron-start-group,
.cron-timezone-group {
  flex: 1 1 220px;
  min-width: 190px;
}

.cron-count-select {
  width: 78px;
}

.cron-start-picker,
.cron-timezone-select {
  flex: 1;
  min-width: 0;
}

.cron-run-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.cron-run-row {
  min-height: 48px;
  padding: 7px 10px;
  display: grid;
  grid-template-columns: minmax(76px, auto) minmax(0, 1fr) 34px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--lk-surface-border);
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
