<template>
  <div class="w-full h-full">
    <SplitPanel :default-size="0.5">
      <template #left>
        <div class="h-full p-2 mr-4 overflow-y-auto overflow-x-hidden">
          <div class="tool-block">
            <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
              <n-tag size="large" type="warning">
                时间戳转换
              </n-tag>
              <n-button @click="readTimestampClipboard">剪贴板</n-button>
              <n-button @click="showTimestampExample">示例</n-button>
              <n-button @click="clearTimestampTool">清空</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">输入时间</n-input-group-label>
                <n-input :style="{ flex: 1 }" placeholder="支持时间戳、YYYY-MM-DD、YYYY/MM/DD、ISO 等常见格式" :status="status.inputTime" clearable
                        v-model:value="inputTime" @input="handleInputTimeChange" />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="timeNow">当前时间</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">时间戳(s)</n-input-group-label>
                <n-input-number :show-button="false" :style="{ flex: 1 }" placeholder="" :status="status.timestamp" clearable
                                v-model:value="timestamp" @update:value="handleTimestampChange" />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyTimestamp">复制</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">时间戳(ms)</n-input-group-label>
                <n-input-number :show-button="false" :style="{ flex: 1 }" placeholder="" :status="status.milliTimestamp" clearable
                                v-model:value="milliTimestamp" @update:value="handleMilliTimestampChange" />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyMilliTimestamp">复制</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">日期</n-input-group-label>
                <n-date-picker v-model:value="milliTimestamp" type="date" :style="{ flex: 1 }" placeholder="选择日期" clearable
                              @update:value="handleMilliTimestampChange"/>
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyDate">复制</n-button>
              </n-input-group>
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">日期时间</n-input-group-label>
                <n-date-picker v-model:value="milliTimestamp" type="datetime" :style="{ flex: 1 }" placeholder="选择日期时间" clearable
                              @update:value="handleMilliTimestampChange"/>
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyDateTime">复制</n-button>
              </n-input-group>
            </div>
          </div>

          <n-divider dashed class="my-12" />

          <div class="tool-block">
            <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
              <n-tag size="large" type="success">
                时间间隔计算
              </n-tag>
              <n-button @click="showIntervalExample">示例</n-button>
              <n-button @click="clearIntervalTool">清空</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">开始时间</n-input-group-label>
                <n-date-picker
                  v-model:value="intervalStart"
                  type="datetime"
                  :style="{ flex: 1 }"
                  placeholder="选择开始日期时间"
                  clearable
                />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyIntervalStart">复制</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">结束时间</n-input-group-label>
                <n-date-picker
                  v-model:value="intervalEnd"
                  type="datetime"
                  :style="{ flex: 1 }"
                  placeholder="选择结束日期时间"
                  clearable
                />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyIntervalEnd">复制</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">间隔时间</n-input-group-label>
                <n-input
                  :value="intervalResult"
                  readonly
                  :style="{ flex: 1 }"
                  placeholder="请选择开始和结束时间"
                />
                <n-select
                  v-model:value="intervalUnit"
                  :options="intervalUnitOptions"
                  class="interval-unit-select"
                  :style="{ width: '90px' }"
                />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyIntervalResult">复制</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label class="interval-format-label" :style="{ width: '100px', 'text-align': 'center' }">格式化</n-input-group-label>
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
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyIntervalFormattedResult">复制</n-button>
              </n-input-group>
            </div>
          </div>

          <n-divider dashed class="my-12" />

          <div class="tool-block">
            <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
              <n-tag size="large" type="info">
                时间推移计算
              </n-tag>
              <n-button @click="showShiftExample">示例</n-button>
              <n-button @click="clearShiftTool">清空</n-button>
            </div>
            <div class="space-y-4">
              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">开始时间</n-input-group-label>
                <n-date-picker
                  v-model:value="shiftStart"
                  type="datetime"
                  :style="{ flex: 1 }"
                  placeholder="选择开始日期时间"
                  clearable
                />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyShiftStart">复制</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-select
                  v-model:value="shiftDirection"
                  :options="shiftDirectionOptions"
                  class="shift-direction-select"
                  :style="{ width: '100px' }"
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
                        :style="{ flex: 1 }"
                        @update:value="(val) => handleShiftValueChange(item.key, val)"
                      />
                      <n-input-group-label class="shift-unit-label">{{ item.label }}</n-input-group-label>
                    </n-input-group>
                  </div>
                </div>
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyShiftInfo">复制</n-button>
              </n-input-group>

              <n-input-group class="w-full">
                <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">结果时间</n-input-group-label>
                <n-input
                  :value="shiftResult"
                  readonly
                  :style="{ flex: 1 }"
                  placeholder="请选择开始时间并输入推移信息"
                />
                <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyShiftResult">复制</n-button>
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
import { NInputGroup, NInputGroupLabel, NInput, NInputNumber, NButton, NDatePicker, NTag, NSelect, NDivider } from "naive-ui";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useCommon } from '../../composables/useCommon';
import SplitPanel from '../common/SplitPanel.vue';

dayjs.extend(customParseFormat);

const { copyToClipboard, readFromClipboard, notify } = useCommon();

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
const timestampExamples = [
  '2026-01-25 14:23:45',
  '2026/01/25 14:23:45',
  '2026.01.25 14:23:45.123',
  '20260125142345',
  '2026-01-25T14:23:45.123',
  '1769341425',
  '1769341425123',
];

const intervalStart = ref(null);
const intervalEnd = ref(null);
const intervalUnit = ref('second');
const intervalUnitOptions = [
  { label: '年', value: 'year' },
  { label: '月', value: 'month' },
  { label: '天', value: 'day' },
  { label: '小时', value: 'hour' },
  { label: '分钟', value: 'minute' },
  { label: '秒', value: 'second' },
  { label: '毫秒', value: 'millisecond' },
];
const intervalFormatItems = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'day', label: '天' },
  { key: 'hour', label: '时' },
  { key: 'minute', label: '分' },
  { key: 'second', label: '秒' },
];

const shiftStart = ref(null);
const shiftDirection = ref('forward');
const shiftDirectionOptions = [
  { label: '向前', value: 'backward' },
  { label: '向后', value: 'forward' },
];
const shiftItems = [
  { key: 'year', label: '年' },
  { key: 'month', label: '月' },
  { key: 'day', label: '天' },
  { key: 'hour', label: '时' },
  { key: 'minute', label: '分' },
  { key: 'second', label: '秒' },
];
const shiftValues = reactive({
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  second: null,
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
  const directionLabel = shiftDirection.value === 'backward' ? '向前' : '向后';
  const parts = [];

  shiftItems.forEach((item) => {
    const value = shiftValues[item.key] ?? 0;
    if (value) {
      parts.push(`${value}${item.label}`);
    }
  });

  return `${directionLabel} ${parts.length ? parts.join('') : '0秒'}`;
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
    notify('warning', '剪贴板中没有可用文本');
  }
}

function showTimestampExample() {
  inputTime.value = timestampExamples[timestampExampleIndex.value];
  timestampExampleIndex.value = (timestampExampleIndex.value + 1) % timestampExamples.length;
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
  intervalStart.value = dayjs('2026-01-25 14:23:45', 'YYYY-MM-DD HH:mm:ss').valueOf();
  intervalEnd.value = dayjs('2026-02-28 18:05:12', 'YYYY-MM-DD HH:mm:ss').valueOf();
  intervalUnit.value = 'day';
}

function clearIntervalTool() {
  intervalStart.value = null;
  intervalEnd.value = null;
  intervalUnit.value = 'second';
}

function showShiftExample() {
  shiftStart.value = dayjs('2026-01-25 14:23:45', 'YYYY-MM-DD HH:mm:ss').valueOf();
  shiftDirection.value = 'forward';
  shiftValues.year = null;
  shiftValues.month = 1;
  shiftValues.day = 3;
  shiftValues.hour = 2;
  shiftValues.minute = 30;
  shiftValues.second = null;
}

function clearShiftTool() {
  shiftStart.value = null;
  shiftDirection.value = 'forward';
  shiftItems.forEach((item) => {
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
  copyToClipboard(timestamp.value.toString(), '复制成功!');
}
function copyMilliTimestamp() {
  copyToClipboard(milliTimestamp.value.toString(), '复制成功!');
}
function copyDate() {
  copyToClipboard(dayjs(milliTimestamp.value).format('YYYY-MM-DD'), '复制成功!');
}
function copyDateTime() {
  copyToClipboard(dayjs(milliTimestamp.value).format('YYYY-MM-DD HH:mm:ss'), '复制成功!');
}

function copyIntervalStart() {
  copyToClipboard(formatDateTime(intervalStart.value), '复制成功!');
}

function copyIntervalEnd() {
  copyToClipboard(formatDateTime(intervalEnd.value), '复制成功!');
}

function copyIntervalResult() {
  copyToClipboard(intervalResult.value || '', '复制成功!');
}

function copyIntervalFormattedResult() {
  copyToClipboard(intervalFormattedResult.value || '', '复制成功!');
}

function copyShiftStart() {
  copyToClipboard(formatDateTime(shiftStart.value), '复制成功!');
}

function copyShiftInfo() {
  copyToClipboard(shiftInfoText.value, '复制成功!');
}

function copyShiftResult() {
  copyToClipboard(shiftResult.value || '', '复制成功!');
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
  if (parts.years) resultParts.push(`${parts.years}年`);
  if (parts.months) resultParts.push(`${parts.months}月`);
  if (parts.days) resultParts.push(`${parts.days}天`);
  if (parts.hours) resultParts.push(`${parts.hours}小时`);
  if (parts.minutes) resultParts.push(`${parts.minutes}分`);
  if (parts.seconds) resultParts.push(`${parts.seconds}秒`);

  return resultParts.length ? resultParts.join('') : '0秒';
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
.shift-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
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
  min-width: 32px;
  text-align: center;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
