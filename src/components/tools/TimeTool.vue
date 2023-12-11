<template>
  <div class="w-full h-full space-y-4">
    <n-input-group>
      <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">输入时间</n-input-group-label>
      <n-input :style="{ width: '50%' }" placeholder="输入格式任意时间" :status="status.inputTime" clearable
               v-model:value="inputTime" @input="handleInputTimeChange" />
      <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="timeNow">当前时间</n-button>
    </n-input-group>
    <n-input-group>
      <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">时间戳(s)</n-input-group-label>
      <n-input-number :show-button="false" :style="{ width: '50%' }" placeholder="" :status="status.timestamp" clearable
                      v-model:value="timestamp" @update:value="handleTimestampChange" />
      <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyTimestamp">复制</n-button>
    </n-input-group>
    <n-input-group>
      <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">时间戳(ms)</n-input-group-label>
      <n-input-number :show-button="false" :style="{ width: '50%' }" placeholder="" :status="status.milliTimestamp" clearable
                      v-model:value="milliTimestamp" @update:value="handleMilliTimestampChange" />
      <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyMilliTimestamp">复制</n-button>
    </n-input-group>
    <n-input-group>
      <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">日期</n-input-group-label>
      <n-date-picker v-model:value="milliTimestamp" type="date" :style="{ width: '50%' }" placeholder="选择日期" clearable
                     @update:value="handleMilliTimestampChange"/>
      <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyDate">复制</n-button>
    </n-input-group>
    <n-input-group>
      <n-input-group-label :style="{ width: '100px', 'text-align': 'center' }">日期时间</n-input-group-label>
      <n-date-picker v-model:value="milliTimestamp" type="datetime" :style="{ width: '50%' }" placeholder="选择日期时间" clearable
                     @update:value="handleMilliTimestampChange"/>
      <n-button type="primary" ghost :style="{ width: '80px', 'text-align': 'center' }" @click="copyDateTime">复制</n-button>
    </n-input-group>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { NInputGroup, NInputGroupLabel, NInput, NInputNumber, NButton, NDatePicker, NNotificationProvider } from "naive-ui";
import { useNotification } from "naive-ui";
import dayjs from "dayjs";
import { writeText } from "@tauri-apps/api/clipboard";

const inputTime = ref();
const timestamp = ref();
const milliTimestamp = ref();

const status = reactive({
  inputTime: '',
  timestamp: '',
  milliTimestamp: '',
});

onMounted(() => {
})

function handleInputTimeChange(val) {
  console.log('Time change val ==> ', val);
  console.log('Time change value ==> ', inputTime.value);
  if (inputTime.value === '') {
    status.inputTime = '';
    initResult();
    return;
  }
  if (isTimestamp(inputTime.value)) {
    status.inputTime = '';
    transfer(dayjs.unix(Number.parseInt(inputTime.value)));
    return;
  }
  if (isMilliTimestamp(inputTime.value)) {
    status.inputTime = '';
    transfer(dayjs(Number.parseInt(inputTime.value)));
    return;
  }
  if (isDate(inputTime.value)) {
    status.inputTime = '';
    transfer(dayjs(inputTime.value + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss'));
    return;
  }
  if (isDatetime(inputTime.value)) {
    status.inputTime = '';
    transfer(dayjs(inputTime.value, 'YYYY-MM-DD HH:mm:ss'));
    return;
  }
  status.inputTime = 'error';
  initResult();
  console.log('Time change status ==> ', status);
}

function handleTimestampChange(val) {
  console.log('Timestamp change val ==> ', val);
  if (val && !isTimestamp(val.toString())) {
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
  if (val && !isMilliTimestamp(val.toString())) {
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

function isDate(str) {
  let dateReg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  return dateReg.test(str);
}

function isDatetime(str) {
  let datetimeReg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(2[0-3]|[0-1]\d):[0-5]\d:[0-5]\d$/;
  return datetimeReg.test(str);
}

function copyTimestamp() {
  copy(timestamp.value);
}
function copyMilliTimestamp() {
  copy(milliTimestamp.value);
}
function copyDate() {
  copy(dayjs(milliTimestamp.value).format('YYYY-MM-DD'));
}
function copyDateTime() {
  copy(dayjs(milliTimestamp.value).format('YYYY-MM-DD HH:mm:ss'));
}

const notification = useNotification();
function notify(type, message) {
  notification[type]({
    content: message,
    // meta: "想不出来",
    duration: 2500,
    keepAliveOnHover: true
  });
}

function copy(value) {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(value);
  }
  if (window.__TAURI_IPC__) {
    writeText(value.toString());
  }
  notify('success', '复制成功!');
}
</script>

<style>

</style>