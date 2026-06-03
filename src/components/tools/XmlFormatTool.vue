<script setup>

import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NDropdown, NIcon, NInput, NInputGroup, NSelect, NTag } from "naive-ui";
import { 
  TextSortAscending24Regular as SortIcon,
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';
import { ChevronDownOutline } from '@vicons/ionicons5';

import SplitPanel from '../common/SplitPanel.vue'
import { useCommon } from '../../composables/useCommon';
import { useDataTransfer } from '../../composables/useDataTransfer';
import { useThemeMode } from "../../composables/useThemeMode";
import { XmlFormat } from 'lone-format';

const { notify, copyToClipboard, readFromClipboard } = useCommon();
const { send } = useDataTransfer();
const { t, tm } = useI18n();

const source = ref();
const target = ref();
const customXmlFormatRef = ref(null);
const filterType = ref('xpath');
const filterExpression = ref('');
const isSorted = ref(false);
const hasSourceContent = computed(() => !!source.value?.trim());
const { resolvedTheme } = useThemeMode();
const formatTheme = computed(() => (resolvedTheme.value === "dark" ? "min-dark" : "min-light"));

// 过滤类型选项
const filterTypeOptions = [
  { label: 'XPath', value: 'xpath' }
];

// 监听过滤类型变化，自动清空表达式
watch(filterType, () => {
  filterExpression.value = '';
  executeFilter(); // 清空后执行过滤（实际上是清空过滤）
});

function handleChange(val) {
}

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    source.value = text;
    handleChange(source.value);
  }
}

function showExample() {
  source.value = tm('examples.xmlFormat');
  handleChange(source.value);
}

function clear() {
  source.value = '';
  target.value = '';
}

function compressive() {
  customXmlFormatRef.value?.compressSource();
}

function copySource() {
  copyToClipboard(source.value);
}

async function copyValue() {
  await customXmlFormatRef.value?.copyXml()
  notify('success', t('common.copied'));
}

function executeFilter() {
  const expression = filterExpression.value.trim();
  
  if (!expression) {
    // 表达式为空时，清空过滤
    customXmlFormatRef.value?.clearFilter();
    customXmlFormatRef.value?.expandAll();
    return;
  }
  
  // 表达式有值时，执行过滤
  const filterConfig = {
    type: filterType.value,
    expression: expression
  };
  
  customXmlFormatRef.value?.filter(filterConfig);
}

function onFilterExpressionClear() {
  // 清空表达式时也触发过滤执行
  executeFilter();
}

function xmlFilter() {
  executeFilter();
}

function expandAll() {
  customXmlFormatRef.value?.expandAll();
}

function collapseAll() {
  customXmlFormatRef.value?.collapseAll();
}

function toggleSort() {
  isSorted.value = !isSorted.value;
  if (isSorted.value) {
    customXmlFormatRef.value?.sort();
  } else {
    customXmlFormatRef.value?.clearSort();
  }
}

async function sendToDiff() {
  await customXmlFormatRef.value?.copyXml();

  const xml = await readFromClipboard();
  if (xml == null) {
    notify('warning', t('tool.noSendableContent'))
    return
  }
  send('DiffTool', xml)
  notify('success', t('tool.sentToDiff'))
}

const moreOptions = computed(() => [
  { label: t('tool.sendToDiff'), key: 'diff' }
])

function handleMoreSelect(key) {
  if (key === 'diff') sendToDiff()
}

</script>

<template>
  <SplitPanel>
    <template #left>
      <div class="h-full p-2 flex flex-col">
        <div class="lk-toolbar mb-2">
          <n-tag size="large" type="warning">{{ t('common.input') }}</n-tag>
          <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
          <n-button @click="showExample">{{ t('common.example') }}</n-button>
          <n-button @click="clear">{{ t('common.clear') }}</n-button>
          <n-button @click="compressive">{{ t('common.compress') }}</n-button>
          <n-button @click="copySource">{{ t('common.copy') }}</n-button>
        </div>
        <div class="flex-1 min-h-0 w-full overflow-hidden">
          <n-input v-model:value="source" type="textarea" class="w-full h-full text-xl" :placeholder="t('tool.format.xmlInputPlaceholder')"
            @input="handleChange" />
        </div>
      </div>
    </template>
    <template #right>
      <div class="h-full p-2 flex flex-col">
        <div class="lk-toolbar mb-2">
          <n-tag size="large" type="success">{{ t('common.output') }}</n-tag>
          <n-button @click="copyValue">{{ t('common.copy') }}</n-button>
          <n-button @click="collapseAll">
            <template #icon> <component :is="CollapseIcon" /> </template>
          </n-button>
          <n-button @click="expandAll">
            <template #icon> <component :is="ExpandIcon" /> </template>
          </n-button>
          <n-button @click="toggleSort" :secondary="isSorted" :type="isSorted ? 'success' : 'default'">
            <template #icon> <component :is="SortIcon" /> </template>
          </n-button>
          <n-dropdown :options="moreOptions" @select="handleMoreSelect">
            <n-button>
              <template #icon><n-icon :component="ChevronDownOutline" /></template>
            </n-button>
          </n-dropdown>
          <n-input-group class="lk-toolbar-filter">
            <n-select v-model:value="filterType" :options="filterTypeOptions" class="lk-fit-select" />
            <n-input
              class="lk-toolbar-filter-input"
              v-model:value="filterExpression" 
              type="text" 
              @keydown.enter="xmlFilter" 
              @clear="onFilterExpressionClear"
              clearable
              :placeholder="t('tool.format.xpathPlaceholder')"
            />
          </n-input-group>
        </div>
        <div class="flex-1 min-h-0 w-full overflow-hidden text-lg lk-result-surface">
          <XmlFormat
            v-if="hasSourceContent"
            class="w-full h-full"
            ref="customXmlFormatRef"
            v-model="source"
            :theme="formatTheme"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <!-- 输入内容后加载格式化视图 -->
          </div>
        </div>
      </div>
    </template>
  </SplitPanel>
</template>

<style scoped>
</style>
