<template>
  <div class="w-full h-full" :style="{ '--time-field-label-width': timeFieldLabelWidth }">
    <SplitPanel :default-size="0.5">
      <template #left>
        <div class="h-full p-2 mr-4 overflow-y-auto overflow-x-hidden">
          <div class="tool-block">
            <div class="flex-shrink-0 w-full min-h-8 flex flex-wrap items-center gap-2 mb-2">
              <n-tag size="large" type="warning">
                {{ t('tool.time.timestampConvert') }}
              </n-tag>
              <n-button @click="readTimestampClipboard">{{ t('common.clipboard') }}</n-button>
              <n-button @click="timeNow">{{ t('tool.time.now') }}</n-button>
              <n-button @click="showTimestampExample">{{ t('common.example') }}</n-button>
              <n-button @click="clearTimestampTool">{{ t('common.clear') }}</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.inputTime') }}</n-input-group-label>
                <n-input class="time-flex-control" :placeholder="t('tool.time.inputTimePlaceholder')" :status="status.inputTime" clearable
                        v-model:value="inputTime" @input="handleInputTimeChange" />
                <n-button type="primary" ghost class="time-action-button" @click="copyInputTime">{{ t('common.copy') }}</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.timestampSeconds') }}</n-input-group-label>
                <n-input-number :show-button="false" class="time-flex-control" placeholder="" :status="status.timestamp" clearable
                                v-model:value="timestamp" @update:value="handleTimestampChange" />
                <n-button type="primary" ghost class="time-action-button" @click="copyTimestamp">{{ t('common.copy') }}</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.timestampMilliseconds') }}</n-input-group-label>
                <n-input-number :show-button="false" class="time-flex-control" placeholder="" :status="status.milliTimestamp" clearable
                                v-model:value="milliTimestamp" @update:value="handleMilliTimestampChange" />
                <n-button type="primary" ghost class="time-action-button" @click="copyMilliTimestamp">{{ t('common.copy') }}</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.date') }}</n-input-group-label>
                <n-date-picker v-model:value="milliTimestamp" type="date" class="time-flex-control" :placeholder="t('tool.time.datePlaceholder')" clearable
                              @update:value="handleMilliTimestampChange"/>
                <n-button type="primary" ghost class="time-action-button" @click="copyDate">{{ t('common.copy') }}</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.dateTime') }}</n-input-group-label>
                <n-date-picker v-model:value="milliTimestamp" type="datetime" class="time-flex-control" :placeholder="t('tool.time.dateTimePlaceholder')" clearable
                              @update:value="handleMilliTimestampChange"/>
                <n-button type="primary" ghost class="time-action-button" @click="copyDateTime">{{ t('common.copy') }}</n-button>
              </n-input-group>
            </div>
          </div>

          <n-divider dashed class="my-12" />

          <div class="tool-block">
            <div class="flex-shrink-0 w-full min-h-8 flex flex-wrap items-center gap-2 mb-2">
              <n-tag size="large" type="success">
                {{ t('tool.time.intervalCalc') }}
              </n-tag>
              <n-button @click="showIntervalExample">{{ t('common.example') }}</n-button>
              <n-button @click="clearIntervalTool">{{ t('common.clear') }}</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.startTime') }}</n-input-group-label>
                <n-date-picker
                  v-model:value="intervalStart"
                  type="datetime"
                  class="time-flex-control"
                  :placeholder="t('tool.time.startDateTimePlaceholder')"
                  clearable
                />
                <n-button type="primary" ghost class="time-action-button" @click="copyIntervalStart">{{ t('common.copy') }}</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.endTime') }}</n-input-group-label>
                <n-date-picker
                  v-model:value="intervalEnd"
                  type="datetime"
                  class="time-flex-control"
                  :placeholder="t('tool.time.endDateTimePlaceholder')"
                  clearable
                />
                <n-button type="primary" ghost class="time-action-button" @click="copyIntervalEnd">{{ t('common.copy') }}</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.intervalTime') }}</n-input-group-label>
                <n-input
                  :value="intervalResult"
                  readonly
                  class="time-flex-control"
                  :placeholder="t('tool.time.intervalPlaceholder')"
                />
                <n-select
                  v-model:value="intervalUnit"
                  :options="intervalUnitOptions"
                  class="interval-unit-select"
                />
                <n-button type="primary" ghost class="time-action-button" @click="copyIntervalResult">{{ t('common.copy') }}</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label class="interval-format-label time-field-label">{{ t('tool.time.formatted') }}</n-input-group-label>
                <div class="shift-fields interval-format-fields">
                  <div class="shift-field-item" v-for="item in intervalFormatItems" :key="item.key">
                    <n-input-group>
                      <n-input
                        :value="intervalFormattedParts[item.key]"
                        readonly
                        placeholder=""
                      />
                      <n-input-group-label class="shift-unit-label">{{ item.label }}</n-input-group-label>
                    </n-input-group>
                  </div>
                </div>
                <n-button type="primary" ghost class="time-action-button" @click="copyIntervalFormattedResult">{{ t('common.copy') }}</n-button>
              </n-input-group>
            </div>
          </div>

          <n-divider dashed class="my-12" />

          <div class="tool-block">
            <div class="flex-shrink-0 w-full min-h-8 flex flex-wrap items-center gap-2 mb-2">
              <n-tag size="large" type="info">
                {{ t('tool.time.shiftCalc') }}
              </n-tag>
              <n-button @click="showShiftExample">{{ t('common.example') }}</n-button>
              <n-button @click="clearShiftTool">{{ t('common.clear') }}</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.startTime') }}</n-input-group-label>
                <n-date-picker
                  v-model:value="shiftStart"
                  type="datetime"
                  class="time-flex-control"
                  :placeholder="t('tool.time.startDateTimePlaceholder')"
                  clearable
                />
                <n-button type="primary" ghost class="time-action-button" @click="copyShiftStart">{{ t('common.copy') }}</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-select
                  v-model:value="shiftDirection"
                  :options="shiftDirectionOptions"
                  class="shift-direction-select"
                />
                <div class="shift-fields">
                  <div class="shift-field-item" v-for="item in shiftItems" :key="item.key">
                    <n-input-group>
                      <n-input-number
                        v-model:value="shiftValues[item.key]"
                        :show-button="false"
                        :min="0"
                        :step="1"
                        :precision="0"
                        placeholder="0"
                        class="time-flex-control"
                        @update:value="(val) => handleShiftValueChange(item.key, val)"
                      />
                      <n-input-group-label class="shift-unit-label">{{ item.label }}</n-input-group-label>
                    </n-input-group>
                  </div>
                </div>
                <n-button type="primary" ghost class="time-action-button" @click="copyShiftInfo">{{ t('common.copy') }}</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label class="time-field-label">{{ t('tool.time.resultTime') }}</n-input-group-label>
                <n-input
                  :value="shiftResult"
                  readonly
                  class="time-flex-control"
                  :placeholder="t('tool.time.shiftResultPlaceholder')"
                />
                <n-button type="primary" ghost class="time-action-button" @click="copyShiftResult">{{ t('common.copy') }}</n-button>
              </n-input-group>
            </div>
          </div>
        </div>
        

      </template>
      <template #right>
        <div class="h-full p-2 ml-4 overflow-y-auto overflow-x-hidden"></div>
      </template>
    </SplitPanel>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useI18n } from "vue-i18n";
import { NInputGroup, NInputGroupLabel, NInput, NInputNumber, NButton, NDatePicker, NTag, NSelect, NDivider } from "naive-ui";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCommon } from '../../composables/useCommon';
import SplitPanel from '../common/SplitPanel.vue';

dayjs.extend(customParseFormat);

const { copyToClipboard, readFromClipboard, notify } = useCommon();
const { t, tm, locale } = useI18n();

const inputTime = ref();
const timestamp = ref();
const milliTimestamp = ref();
const timestampExampleIndex = ref(0);

const status = reactive({
  inputTime: '',
  timestamp: '',
  milliTimestamp: '',
});

const inputTimeFormats = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'YYYY.MM.DD',
  'YYYYMMDD',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm:ss.SSS',
  'YYYY/MM/DD HH:mm',
  'YYYY/MM/DD HH:mm:ss',
  'YYYY/MM/DD HH:mm:ss.SSS',
  'YYYY.MM.DD HH:mm',
  'YYYY.MM.DD HH:mm:ss',
  'YYYY.MM.DD HH:mm:ss.SSS',
  'YYYYMMDDHHmm',
  'YYYYMMDDHHmmss',
  'YYYYMMDDHHmmssSSS',
  'YYYY-MM-DDTHH:mm',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm:ss.SSS',
];
const timestampExamples = computed(() => tm('examples.time.timestamps'));

const intervalStart = ref(null);
const intervalEnd = ref(null);
const intervalUnit = ref('second');
const intervalUnitOptions = computed(() => [
  { label: t('tool.time.units.year'), value: 'year' },
  { label: t('tool.time.units.month'), value: 'month' },
  { label: t('tool.time.units.day'), value: 'day' },
  { label: t('tool.time.units.hour'), value: 'hour' },
  { label: t('tool.time.units.minute'), value: 'minute' },
  { label: t('tool.time.units.second'), value: 'second' },
  { label: t('tool.time.units.millisecond'), value: 'millisecond' },
]);
const intervalFormatItems = computed(() => [
  { key: 'year', label: t('tool.time.units.year') },
  { key: 'month', label: t('tool.time.units.month') },
  { key: 'day', label: t('tool.time.units.day') },
  { key: 'hour', label: t('tool.time.units.hour') },
  { key: 'minute', label: t('tool.time.units.minute') },
  { key: 'second', label: t('tool.time.units.second') },
]);

const shiftStart = ref(null);
const shiftDirection = ref('forward');
const shiftDirectionOptions = computed(() => [
  { label: t('tool.time.backward'), value: 'backward' },
  { label: t('tool.time.forward'), value: 'forward' },
]);
const shiftItems = computed(() => [
  { key: 'year', label: t('tool.time.units.year') },
  { key: 'month', label: t('tool.time.units.month') },
  { key: 'day', label: t('tool.time.units.day') },
  { key: 'hour', label: t('tool.time.units.hour') },
  { key: 'minute', label: t('tool.time.units.minute') },
  { key: 'second', label: t('tool.time.units.second') },
]);
const shiftValues = reactive({
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  second: null,
});
const timeFieldLabelKeys = [
  'tool.time.inputTime',
  'tool.time.timestampSeconds',
  'tool.time.timestampMilliseconds',
  'tool.time.date',
  'tool.time.dateTime',
  'tool.time.startTime',
  'tool.time.endTime',
  'tool.time.intervalTime',
  'tool.time.formatted',
  'tool.time.resultTime',
];
const timeFieldLabelWidth = computed(() => {
  const maxLength = timeFieldLabelKeys.reduce((max, key) => Math.max(max, t(key).length), 0);
  return `${Math.min(180, Math.max(100, maxLength * 8 + 28))}px`;
});

const intervalResult = computed(() => {
  if (!intervalStart.value || !intervalEnd.value) {
    return '';
  }

  const start = dayjs(intervalStart.value);
  const end = dayjs(intervalEnd.value);
  if (!start.isValid() || !end.isValid()) {
    return '';
  }

  const sign = end.valueOf() >= start.valueOf() ? '' : '-';

  const diffMap = {
    year: Math.abs(end.diff(start, 'year', true)),
    month: Math.abs(end.diff(start, 'month', true)),
    day: Math.abs(end.diff(start, 'day', true)),
    hour: Math.abs(end.diff(start, 'hour', true)),
    minute: Math.abs(end.diff(start, 'minute', true)),
    second: Math.abs(end.diff(start, 'second', true)),
    millisecond: Math.abs(end.diff(start, 'millisecond', true)),
  };

  const value = diffMap[intervalUnit.value] ?? 0;
  return `${sign}${trimTrailingZero(value.toFixed(6))}`;
});

const intervalFormattedResult = computed(() => {
  if (!intervalStart.value || !intervalEnd.value) {
    return '';
  }

  const start = dayjs(intervalStart.value);
  const end = dayjs(intervalEnd.value);
  if (!start.isValid() || !end.isValid()) {
    return '';
  }

  const sign = end.valueOf() >= start.valueOf() ? '' : '-';
  return `${sign}${formatDuration(start, end)}`;
});

const intervalFormattedParts = computed(() => {
  const emptyParts = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    second: '',
  };

  if (!intervalStart.value || !intervalEnd.value) {
    return emptyParts;
  }

  const start = dayjs(intervalStart.value);
  const end = dayjs(intervalEnd.value);
  if (!start.isValid() || !end.isValid()) {
    return emptyParts;
  }

  const parts = getDurationParts(start, end);
  return {
    year: String(parts.years),
    month: String(parts.months),
    day: String(parts.days),
    hour: String(parts.hours),
    minute: String(parts.minutes),
    second: String(parts.seconds),
  };
});

const shiftResult = computed(() => {
  if (!shiftStart.value) {
    return '';
  }

  const start = dayjs(shiftStart.value);
  if (!start.isValid()) {
    return '';
  }

  const result = applyTimeShift(start, shiftDirection.value, shiftValues);
  return result.format('YYYY-MM-DD HH:mm:ss');
});

const shiftInfoText = computed(() => {
  const directionLabel = shiftDirection.value === 'backward' ? t('tool.time.backward') : t('tool.time.forward');
  const parts = [];

  shiftItems.value.forEach((item) => {
    const value = shiftValues[item.key] ?? 0;
    if (value) {
      parts.push(formatDurationPart(value, item.label));
    }
  });

  return `${directionLabel} ${parts.length ? joinDurationParts(parts) : formatDurationPart(0, t('tool.time.units.second'))}`;
});

onMounted(() => {
})

function handleInputTimeChange(val) {
  console.log('Time change val ==> ', val);
  console.log('Time change value ==> ', inputTime.value);
  const parsedTime = parseInputTime(inputTime.value);
  if (!parsedTime.raw) {
    status.inputTime = '';
    initResult();
    return;
  }

  if (parsedTime.value?.isValid()) {
    status.inputTime = '';
    transfer(parsedTime.value);
    return;
  }

  status.inputTime = 'error';
  initResult();
  console.log('Time change status ==> ', status);
}

function handleTimestampChange(val) {
  console.log('Timestamp change val ==> ', val);
  if (val === null || val === undefined || val === '') {
    status.timestamp = '';
    inputTime.value = '';
    milliTimestamp.value = null;
    return;
  }

  if (!isTimestamp(val.toString())) {
    status.timestamp = 'error';
    inputTime.value = '';
    milliTimestamp.value = null;
  } else {
    status.timestamp = '';
    inputTime.value = val.toString();
    handleInputTimeChange(val.toString());
  }
}

function handleMilliTimestampChange(val) {
  console.log('MilliTimestamp change val ==> ', val);
  if (val === null || val === undefined || val === '') {
    status.milliTimestamp = '';
    inputTime.value = '';
    timestamp.value = null;
    return;
  }

  if (!isMilliTimestamp(val.toString())) {
    status.milliTimestamp = 'error';
    inputTime.value = '';
    timestamp.value = null;
  } else {
    status.milliTimestamp = '';
    const value = val ? val.toString() : '';
    inputTime.value = value;
    handleInputTimeChange(value);
  }
}

function initResult() {
  timestamp.value = null;
  milliTimestamp.value = null;
}

function transfer(day) {
  console.log('Transfer ==> ', day);
  if (day.isValid()) {
    timestamp.value = day.unix();
    milliTimestamp.value = day.valueOf();
  } else {
    timestamp.value = 'ERROR';
    milliTimestamp.value = 'ERROR';
  }
}

function timeNow() {
  let now = dayjs();
  inputTime.value = now.format('YYYY-MM-DD HH:mm:ss');
  transfer(now);
}

async function readTimestampClipboard() {
  const text = await readFromClipboard();
  if (text) {
    inputTime.value = text;
    handleInputTimeChange(inputTime.value);
  } else {
    notify('warning', t('tool.time.clipboardNoText'));
  }
}

function showTimestampExample() {
  const examples = timestampExamples.value;
  inputTime.value = examples[timestampExampleIndex.value];
  timestampExampleIndex.value = (timestampExampleIndex.value + 1) % examples.length;
  handleInputTimeChange(inputTime.value);
}

function clearTimestampTool() {
  inputTime.value = '';
  status.inputTime = '';
  status.timestamp = '';
  status.milliTimestamp = '';
  initResult();
}

function showIntervalExample() {
  const example = tm('examples.time.interval');
  intervalStart.value = dayjs(example.start, 'YYYY-MM-DD HH:mm:ss').valueOf();
  intervalEnd.value = dayjs(example.end, 'YYYY-MM-DD HH:mm:ss').valueOf();
  intervalUnit.value = example.unit;
}

function clearIntervalTool() {
  intervalStart.value = null;
  intervalEnd.value = null;
  intervalUnit.value = 'second';
}

function showShiftExample() {
  const example = tm('examples.time.shift');
  shiftStart.value = dayjs(example.start, 'YYYY-MM-DD HH:mm:ss').valueOf();
  shiftDirection.value = example.direction;
  Object.assign(shiftValues, example.values);
}

function clearShiftTool() {
  shiftStart.value = null;
  shiftDirection.value = 'forward';
  shiftItems.value.forEach((item) => {
    shiftValues[item.key] = null;
  });
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function isTimestamp(str) {
  if (isNumeric(str) && str.length === 10) {
    return Number.parseInt(str).toString().length === 10;
  }
  return false;
}

function isMilliTimestamp(str) {
  if (isNumeric(str) && str.length === 13) {
    return Number.parseInt(str).toString().length === 13;
  }
  return false;
}

function parseInputTime(value) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return { raw, value: null };
  }

  if (isTimestamp(raw)) {
    return { raw, value: dayjs.unix(Number.parseInt(raw)) };
  }

  if (isMilliTimestamp(raw)) {
    return { raw, value: dayjs(Number.parseInt(raw)) };
  }

  const normalized = raw.replace(/\s+/, ' ');
  const strictParsed = dayjs(normalized, inputTimeFormats, true);
  if (strictParsed.isValid()) {
    return { raw, value: strictParsed };
  }

  const isoParsed = dayjs(raw);
  return { raw, value: isoParsed.isValid() ? isoParsed : null };
}

function copyTimestamp() {
  copyToClipboard(timestamp.value.toString());
}
function copyInputTime() {
  copyToClipboard(inputTime.value?.toString() || '');
}
function copyMilliTimestamp() {
  copyToClipboard(milliTimestamp.value.toString());
}
function copyDate() {
  copyToClipboard(dayjs(milliTimestamp.value).format('YYYY-MM-DD'));
}
function copyDateTime() {
  copyToClipboard(dayjs(milliTimestamp.value).format('YYYY-MM-DD HH:mm:ss'));
}

function copyIntervalStart() {
  copyToClipboard(formatDateTime(intervalStart.value));
}

function copyIntervalEnd() {
  copyToClipboard(formatDateTime(intervalEnd.value));
}

function copyIntervalResult() {
  copyToClipboard(intervalResult.value || '');
}

function copyIntervalFormattedResult() {
  copyToClipboard(intervalFormattedResult.value || '');
}

function copyShiftStart() {
  copyToClipboard(formatDateTime(shiftStart.value));
}

function copyShiftInfo() {
  copyToClipboard(shiftInfoText.value);
}

function copyShiftResult() {
  copyToClipboard(shiftResult.value || '');
}

function formatDateTime(value) {
  if (!value && value !== 0) {
    return '';
  }
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '';
}

function trimTrailingZero(val) {
  return val.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function formatDuration(startTime, endTime) {
  const parts = getDurationParts(startTime, endTime);

  const resultParts = [];
  if (parts.years) resultParts.push(formatDurationPart(parts.years, t('tool.time.units.year')));
  if (parts.months) resultParts.push(formatDurationPart(parts.months, t('tool.time.units.month')));
  if (parts.days) resultParts.push(formatDurationPart(parts.days, t('tool.time.units.day')));
  if (parts.hours) resultParts.push(formatDurationPart(parts.hours, t('tool.time.units.hour')));
  if (parts.minutes) resultParts.push(formatDurationPart(parts.minutes, t('tool.time.units.minute')));
  if (parts.seconds) resultParts.push(formatDurationPart(parts.seconds, t('tool.time.units.second')));

  return resultParts.length ? joinDurationParts(resultParts) : formatDurationPart(0, t('tool.time.units.second'));
}

function formatDurationPart(value, unitLabel) {
  return locale.value === 'en-US' ? `${value} ${unitLabel}` : `${value}${unitLabel}`;
}

function joinDurationParts(parts) {
  return locale.value === 'en-US' ? parts.join(' ') : parts.join('');
}

function getDurationParts(startTime, endTime) {
  const isForward = endTime.valueOf() >= startTime.valueOf();
  let cursor = isForward ? startTime : endTime;
  const target = isForward ? endTime : startTime;

  const years = target.diff(cursor, 'year');
  cursor = cursor.add(years, 'year');

  const months = target.diff(cursor, 'month');
  cursor = cursor.add(months, 'month');

  const days = target.diff(cursor, 'day');
  cursor = cursor.add(days, 'day');

  const hours = target.diff(cursor, 'hour');
  cursor = cursor.add(hours, 'hour');

  const minutes = target.diff(cursor, 'minute');
  cursor = cursor.add(minutes, 'minute');

  const seconds = target.diff(cursor, 'second');

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  };
}

function applyTimeShift(start, direction, values) {
  const method = direction === 'backward' ? 'subtract' : 'add';
  const steps = ['year', 'month', 'day', 'hour', 'minute', 'second'];

  return steps.reduce((cursor, unit) => {
    const raw = values[unit];
    const amount = Number.isFinite(raw) ? raw : Number(raw || 0);
    if (!amount) {
      return cursor;
    }
    return cursor[method](amount, unit);
  }, start);
}

function handleShiftValueChange(key, val) {
  shiftValues[key] = toNonNegativeInteger(val);
}

function toNonNegativeInteger(val) {
  if (val === null || val === undefined || val === '') {
    return null;
  }
  const num = Number(val);
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Math.max(0, Math.trunc(num));
}
</script>

<style>
.time-field-label {
  width: var(--time-field-label-width);
  min-width: var(--time-field-label-width);
  justify-content: center;
  text-align: center;
  white-space: nowrap;
}

.time-flex-control {
  flex: 1;
  min-width: 0;
}

.time-action-button {
  min-width: max-content;
  padding-left: 14px;
  padding-right: 14px;
  text-align: center;
}

.interval-unit-select,
.shift-direction-select {
  flex: 0 0 auto;
}

.interval-unit-select {
  width: 130px;
  min-width: 130px;
}

.shift-direction-select {
  width: var(--time-field-label-width);
  min-width: var(--time-field-label-width);
}

.interval-unit-select .n-base-selection,
.shift-direction-select .n-base-selection {
  min-width: max-content;
}

.shift-direction-select .n-base-selection {
  width: 100%;
}

.interval-unit-select .n-base-selection-label,
.interval-unit-select .n-base-selection-placeholder,
.shift-direction-select .n-base-selection-label,
.shift-direction-select .n-base-selection-placeholder {
  padding-left: 12px;
  padding-right: 12px;
  white-space: nowrap;
}

.shift-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 0;
  align-items: center;
  margin-left: -1px;
}

.shift-field-item {
  min-width: 0;
}

.shift-field-item + .shift-field-item {
  margin-left: -1px;
}

.shift-direction-select .n-base-selection {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.shift-direction-select .n-base-selection-label,
.shift-direction-select .n-base-selection-placeholder {
  text-align: center;
}

.interval-unit-select .n-base-selection-label,
.interval-unit-select .n-base-selection-placeholder {
  text-align: center;
}

.interval-format-label {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.shift-field-item .n-input-number .n-input-wrapper,
.shift-field-item .n-input .n-input-wrapper,
.shift-field-item .n-input-group-label {
  border-radius: 0 !important;
}

.shift-field-item .n-input .n-input__input-el,
.shift-field-item .n-input-number .n-input__input-el {
  text-align: right;
}

.shift-field-item .n-input .n-input__input,
.shift-field-item .n-input-number .n-input__input {
  display: flex;
  align-items: center;
}

.shift-field-item .n-input .n-input__placeholder,
.shift-field-item .n-input-number .n-input__placeholder,
.shift-field-item .n-input .n-input__placeholder span,
.shift-field-item .n-input-number .n-input__placeholder span {
  text-align: right;
}

.shift-field-item:last-child .n-input-group-label {
  border-top-right-radius: 3px !important;
  border-bottom-right-radius: 3px !important;
}

.shift-field-item .n-input-group {
  width: 100%;
}

.shift-field-item .n-input-number {
  flex: 1;
  min-width: 0;
}

.shift-unit-label {
  min-width: max-content;
  text-align: center;
  padding-left: 8px;
  padding-right: 8px;
  white-space: nowrap;
}
</style>
