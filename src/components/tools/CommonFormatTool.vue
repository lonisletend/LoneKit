<template>
  <div class="common-format-root h-full" :class="{ 'is-dark': resolvedTheme === 'dark' }">
    <SplitPanel>
    <template #left>
      <!-- 左侧输入区域 -->
      <div class="h-full p-2 flex flex-col">
        <!-- 固定的操作按钮 -->
        <div class="lk-toolbar mb-2">
          <n-tag size="large" type="warning">
            {{ t('common.input') }}
          </n-tag>
          <n-button @click="readClipboard">{{ t('common.clipboard') }}</n-button>
          <n-button @click="showExample">{{ t('common.example') }}</n-button>
          <n-button @click="clear">{{ t('common.clear') }}</n-button>
          <n-button @click="copySource">{{ t('common.copy') }}</n-button>
        </div>
        <!-- 可滚动的输入区域 -->
        <div class="flex-1 min-h-0 w-full overflow-hidden">
          <n-input v-model:value="sourceText" type="textarea" class="w-full h-full text-lg"
                   :placeholder="t('tool.commonFormat.inputPlaceholder')" @input="handleSourceTextChange"/>
        </div>
      </div>
    </template>
    <template #right>
      <!-- 右侧输出区域 -->
      <div class="h-full p-2 flex flex-col">
        <!-- 固定的操作按钮 -->
        <div class="lk-toolbar mb-2">
          <n-tag size="large" type="success">{{ t('common.output') }}</n-tag>
          <n-button @click="copyAll">{{ t('common.copy') }}</n-button>
          <n-button @click="collapseAll">
            <template #icon> <component :is="CollapseIcon" /> </template>
          </n-button>
          <n-button @click="expandAll">
            <template #icon> <component :is="ExpandIcon" /> </template>
          </n-button>
          <n-dropdown :options="moreOptions" @select="handleMoreSelect">
            <n-button>
              <template #icon><n-icon :component="ChevronDownOutline" /></template>
            </n-button>
          </n-dropdown>
        </div>
        <!-- 可滚动的输出区域 -->
        <div class="flex-1 min-h-0 w-full overflow-auto custom-show-area result-pane lk-result-surface lk-result-surface-padded">
          <div v-for="(segment, index) in parsedSegments" :key="index" class="mb-3">
            <!-- 普通文本 -->
            <div v-if="segment.type === 'plainText'" class="plain-text-segment whitespace-pre-wrap">
              {{ segment.content }}
            </div>
            <!-- JSON 格式化 -->
            <div v-else-if="segment.type === 'json'" class="relative rounded format-block json-segment">
              <!-- 悬浮工具栏 -->
              <div class="absolute top-0 right-0 flex items-center format-toolbar opacity-0 hover:opacity-100 transition-opacity duration-200"
                   :class="{ 'filter-open': filterVisibility[index] }">
                <n-tag size="small" type="info">JSON</n-tag>
                <n-button size="small" circle @click="copyJsonSegment(index)">
                  <template #icon>
                    <component :is="CopyIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="collapseJsonSegment(index)">
                  <template #icon>
                    <component :is="CollapseIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="expandJsonSegment(index)">
                  <template #icon>
                    <component :is="ExpandIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="toggleJsonSort(index)" :secondary="jsonSortStates[index]" :type="jsonSortStates[index] ? 'success' : 'default'">
                  <template #icon>
                    <component :is="SortIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="toggleSegmentFilter(index)" :secondary="!!filterVisibility[index]"
                          :aria-label="t('tool.json.jsonPathPlaceholder')" :aria-expanded="!!filterVisibility[index]">
                  <template #icon><component :is="FilterIcon" /></template>
                </n-button>
                <n-input
                  v-if="filterVisibility[index]"
                  v-model:value="filterExpressions[index]"
                  class="format-filter-input"
                  size="small"
                  clearable
                  :placeholder="t('tool.json.jsonPathPlaceholder')"
                  @keydown.enter="executeSegmentFilter(index)"
                  @clear="clearSegmentFilter(index)"
                />
              </div>
              <JsonFormat
                :ref="el => setJsonFormatRef(el, index)"
                :modelValue="segment.content" 
                :theme="formatTheme"
                class="w-full"
              />
            </div>
            <!-- XML 格式化 -->
            <div v-else-if="segment.type === 'xml'" class="relative rounded format-block xml-segment">
              <!-- 悬浮工具栏 -->
              <div class="absolute top-0 right-0 flex items-center format-toolbar opacity-0 hover:opacity-100 transition-opacity duration-200"
                   :class="{ 'filter-open': filterVisibility[index] }">
                <n-tag size="small" type="success">XML</n-tag>
                <n-button size="small" circle @click="copyXmlSegment(index)">
                  <template #icon>
                    <component :is="CopyIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="collapseXmlSegment(index)">
                  <template #icon>
                    <component :is="CollapseIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="expandXmlSegment(index)">
                  <template #icon>
                    <component :is="ExpandIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="toggleXmlSort(index)" :secondary="xmlSortStates[index]" :type="xmlSortStates[index] ? 'success' : 'default'">
                  <template #icon>
                    <component :is="SortIcon" />
                  </template>
                </n-button>
                <n-button size="small" circle @click="toggleSegmentFilter(index)" :secondary="!!filterVisibility[index]"
                          :aria-label="t('tool.format.xpathPlaceholder')" :aria-expanded="!!filterVisibility[index]">
                  <template #icon><component :is="FilterIcon" /></template>
                </n-button>
                <n-input
                  v-if="filterVisibility[index]"
                  v-model:value="filterExpressions[index]"
                  class="format-filter-input"
                  size="small"
                  clearable
                  :placeholder="t('tool.format.xpathPlaceholder')"
                  @keydown.enter="executeSegmentFilter(index)"
                  @clear="clearSegmentFilter(index)"
                />
              </div>
              <XmlFormat
                :ref="el => setXmlFormatRef(el, index)"
                :modelValue="segment.content" 
                :theme="formatTheme"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    </SplitPanel>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { NInput, NTag, NButton, NDropdown, NIcon } from "naive-ui";
import { 
  Copy24Regular as CopyIcon,
  Filter24Regular as FilterIcon,
  TextSortAscending24Regular as SortIcon,
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';
import { ChevronDownOutline } from '@vicons/ionicons5';

import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';
import { useDataTransfer } from '../../composables/useDataTransfer';
import { useThemeMode } from "../../composables/useThemeMode";
import JsonFormat from 'lone-format/json-format'
import XmlFormat from 'lone-format/xml-format'
import 'lone-format/style.css';

const { notify, copyToClipboard, readFromClipboard } = useCommon();
const { send } = useDataTransfer();
const { t, tm } = useI18n();

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: 0
  }
});

const sourceText = ref('');
const parsedSegments = ref([]);
const jsonFormatRefs = ref({});
const xmlFormatRefs = ref({});
const jsonSortStates = ref({});
const xmlSortStates = ref({});
const filterVisibility = ref({});
const filterExpressions = ref({});
const { resolvedTheme } = useThemeMode();
const formatTheme = computed(() => (resolvedTheme.value === "dark" ? "min-dark" : "min-light"));


// 设置 JSON 格式化组件的 ref
function setJsonFormatRef(el, index) {
  if (el) {
    jsonFormatRefs.value[index] = el;
  }
}

// 设置 XML 格式化组件的 ref
function setXmlFormatRef(el, index) {
  if (el) {
    xmlFormatRefs.value[index] = el;
  }
}

// JSON 块操作方法
async function copyJsonSegment(index) {
  await jsonFormatRefs.value[index]?.copyJson();
  notify('success', t('common.copied'));
}

function collapseJsonSegment(index) {
  jsonFormatRefs.value[index]?.collapseAll();
}

function expandJsonSegment(index) {
  jsonFormatRefs.value[index]?.expandAll();
}

// XML 块操作方法
async function copyXmlSegment(index) {
  await xmlFormatRefs.value[index]?.copyXml();
  notify('success', t('common.copied'));
}

function collapseXmlSegment(index) {
  xmlFormatRefs.value[index]?.collapseAll();
}

function expandXmlSegment(index) {
  xmlFormatRefs.value[index]?.expandAll();
}

// JSON 排序切换
function toggleJsonSort(index) {
  jsonSortStates.value[index] = !jsonSortStates.value[index];
  if (jsonSortStates.value[index]) {
    jsonFormatRefs.value[index]?.sortKeys();
  } else {
    jsonFormatRefs.value[index]?.clearSortKeys();
  }
}

// XML 排序切换
function toggleXmlSort(index) {
  xmlSortStates.value[index] = !xmlSortStates.value[index];
  if (xmlSortStates.value[index]) {
    xmlFormatRefs.value[index]?.sort();
  } else {
    xmlFormatRefs.value[index]?.clearSort();
  }
}

// 每个片段独立维护过滤输入，隐藏输入框不会清除已执行的过滤。
function toggleSegmentFilter(index) {
  filterVisibility.value[index] = !filterVisibility.value[index];
  filterExpressions.value[index] ??= '';
}

function getSegmentFormatRef(index) {
  return parsedSegments.value[index]?.type === 'json'
    ? jsonFormatRefs.value[index]
    : xmlFormatRefs.value[index];
}

function executeSegmentFilter(index) {
  const expression = (filterExpressions.value[index] ?? '').trim();
  if (!expression) {
    clearSegmentFilter(index);
    return;
  }

  getSegmentFormatRef(index)?.filter({
    type: parsedSegments.value[index]?.type === 'json' ? 'jsonpath' : 'xpath',
    expression
  });
}

function clearSegmentFilter(index) {
  filterExpressions.value[index] = '';
  const formatRef = getSegmentFormatRef(index);
  formatRef?.clearFilter();
  formatRef?.expandAll();
}

// 查找完整的 JSON 对象或数组（支持任意层级嵌套）
function findJsonMatches(text) {
  const matches = [];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    // 检测 JSON 对象或数组的开始
    if (char === '{' || char === '[') {
      const startChar = char;
      const endChar = char === '{' ? '}' : ']';
      let depth = 1;
      let j = i + 1;
      let inString = false;
      let escaped = false;
      
      // 使用栈匹配括号，支持任意层级嵌套
      while (j < text.length && depth > 0) {
        const currentChar = text[j];
        
        // 处理转义字符
        if (escaped) {
          escaped = false;
          j++;
          continue;
        }
        
        if (currentChar === '\\') {
          escaped = true;
          j++;
          continue;
        }
        
        // 处理字符串
        if (currentChar === '"') {
          inString = !inString;
        }
        
        // 只在非字符串中统计括号
        if (!inString) {
          if (currentChar === startChar) {
            depth++;
          } else if (currentChar === endChar) {
            depth--;
          }
        }
        
        j++;
      }
      
      // 找到完整的 JSON 结构
      if (depth === 0) {
        const content = text.substring(i, j);
        
        // 验证是否为有效的 JSON
        try {
          JSON.parse(content);
          matches.push({
            start: i,
            end: j,
            content: content,
            type: 'json'
          });
          // 跳过已匹配的内容
          i = j - 1;
        } catch (e) {
          // 无效的 JSON，继续查找
        }
      }
    }
  }
  
  return matches;
}

// 查找单个 XML 元素（支持同名标签任意层级嵌套）
function findXmlElement(text, start) {
  if (start >= text.length || text[start] !== '<') return null;

  let i = start + 1;
  if (i < text.length && (text[i] === '?' || text[i] === '!' || text[i] === '/')) return null;

  let tagName = '';
  while (i < text.length && /[\w:.-]/.test(text[i])) tagName += text[i++];
  if (!tagName) return null;

  // 跳过属性，处理引号字符串
  let inStr = false, strCh = '';
  while (i < text.length) {
    const ch = text[i];
    if (inStr) {
      if (ch === strCh) inStr = false;
    } else if (ch === '"' || ch === "'") {
      inStr = true; strCh = ch;
    } else if (ch === '/' && text[i + 1] === '>') {
      return { end: i + 2 }; // 自闭合标签
    } else if (ch === '>') {
      break;
    }
    i++;
  }
  if (i >= text.length) return null;
  i++; // 跳过 '>'

  // 用深度计数跟踪同名标签的嵌套
  let depth = 1;
  while (i < text.length && depth > 0) {
    const lt = text.indexOf('<', i);
    if (lt === -1) break;
    i = lt;

    if (text[i + 1] === '/') {
      let k = i + 2, name = '';
      while (k < text.length && /[\w:.-]/.test(text[k])) name += text[k++];
      if (name === tagName) {
        while (k < text.length && text[k] !== '>') k++;
        if (k < text.length) { depth--; i = k + 1; continue; }
      }
    } else if (text[i + 1] !== '?' && text[i + 1] !== '!') {
      let k = i + 1, name = '';
      while (k < text.length && /[\w:.-]/.test(text[k])) name += text[k++];
      if (name === tagName && k < text.length && /[\s>\/]/.test(text[k])) depth++;
    }
    i++;
  }

  return depth === 0 ? { end: i } : null;
}

// 查找所有 XML 匹配（支持同名标签任意层级嵌套）
function findXmlMatches(text) {
  const matches = [];
  let i = 0;

  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt === -1) break;

    let start = lt;
    let elementStart = lt;

    // 处理可选的 XML 声明 <?xml...?>
    if (text.startsWith('<?xml', lt)) {
      const declEnd = text.indexOf('?>', lt);
      if (declEnd === -1) { i = lt + 1; continue; }
      elementStart = declEnd + 2;
      while (elementStart < text.length && /\s/.test(text[elementStart])) elementStart++;
    }

    const result = findXmlElement(text, elementStart);
    if (result && result.end > elementStart) {
      matches.push({ start, end: result.end, content: text.substring(start, result.end), type: 'xml' });
      i = result.end;
    } else {
      i = lt + 1;
    }
  }

  return matches;
}

// 解析输入文本，提取 JSON 和 XML
function resolveText(text) {
  if (!text || text.trim() === '') {
    return [];
  }

  const segments = [];
  let currentIndex = 0;

  // 查找 JSON（使用括号匹配算法）
  const jsonMatches = findJsonMatches(text);

  // 查找 XML（使用深度追踪算法，支持同名标签嵌套）
  const xmlMatches = findXmlMatches(text);
  
  // 合并所有匹配
  const allMatches = [...jsonMatches, ...xmlMatches];

  // 处理重叠：按长度降序挑选互不重叠的片段。
  // 不能按起始位置贪心替换——长片段挤掉短片段后，若自身又被更长的片段替换，
  // 被挤掉的短片段不会恢复，会导致合法片段退化成普通文本。
  const matchLength = (match) => match.end - match.start;
  const filteredMatches = [];
  const candidates = allMatches
    .slice()
    .sort((a, b) => matchLength(b) - matchLength(a) || a.start - b.start);

  for (const candidate of candidates) {
    const overlapped = filteredMatches.some(
      (kept) => candidate.start < kept.end && candidate.end > kept.start
    );
    if (!overlapped) {
      filteredMatches.push(candidate);
    }
  }

  // 按起始位置排序，用于拼接片段与普通文本
  filteredMatches.sort((a, b) => a.start - b.start);
  
  // 构建最终的片段列表
  filteredMatches.forEach(match => {
    // 添加匹配前的普通文本
    if (currentIndex < match.start) {
      const plainText = text.substring(currentIndex, match.start);
      // 去除无用的空行，保留有内容的文本
      const trimmedText = plainText.split('\n')
        .filter(line => line.trim() !== '')
        .join('\n')
        .trim();
      if (trimmedText) {
        segments.push({
          type: 'plainText',
          content: trimmedText
        });
      }
    }
    
    // 添加匹配的 JSON/XML
    segments.push({
      type: match.type,
      content: match.content
    });
    
    currentIndex = match.end;
  });
  
  // 添加剩余的普通文本
  if (currentIndex < text.length) {
    const plainText = text.substring(currentIndex);
    // 去除无用的空行，保留有内容的文本
    const trimmedText = plainText.split('\n')
      .filter(line => line.trim() !== '')
      .join('\n')
      .trim();
    if (trimmedText) {
      segments.push({
        type: 'plainText',
        content: trimmedText
      });
    }
  }
  
  return segments;
}

function handleSourceTextChange() {
  // 片段索引可能改变，避免旧过滤条件作用于新内容。
  Object.keys(filterExpressions.value).forEach(clearSegmentFilter);
  filterVisibility.value = {};
  filterExpressions.value = {};
  try {
    parsedSegments.value = resolveText(sourceText.value);
  } catch (error) {
    notify('error', t('tool.parseFailed', { message: error.message }));
    parsedSegments.value = [{
      type: 'plainText',
      content: sourceText.value
    }];
  }
}

async function readClipboard() {
  const text = await readFromClipboard();
  if (text) {
    sourceText.value = text;
    handleSourceTextChange();
  }
}

function showExample() {
  sourceText.value = tm('examples.commonFormat');
  handleSourceTextChange();
}

function clear() {
  sourceText.value = '';
  handleSourceTextChange();
}

function copySource() {
  copyToClipboard(sourceText.value);
}

async function getFormattedText() {
  const textParts = [];

  for (let i = 0; i < parsedSegments.value.length; i++) {
    const segment = parsedSegments.value[i];

    if (segment.type === 'plainText') {
      textParts.push(segment.content);
    } else if (segment.type === 'json') {
      // 调用组件的复制方法
      await jsonFormatRefs.value[i]?.copyJson();
      // 从剪贴板读取格式化后的内容
      const formattedJson = await readFromClipboard();
      textParts.push(formattedJson);
    } else if (segment.type === 'xml') {
      // 调用组件的复制方法
      await xmlFormatRefs.value[i]?.copyXml();
      // 从剪贴板读取格式化后的内容
      const formattedXml = await readFromClipboard();
      textParts.push(formattedXml);
    }
  }

  return textParts.join('\n');
}

async function copyAll() {
  const allText = await getFormattedText();
  await copyToClipboard(allText);
}

// 折叠全部
function collapseAll() {
  for (let i = 0; i < parsedSegments.value.length; i++) {
    const segment = parsedSegments.value[i];
    
    if (segment.type === 'json') {
      jsonFormatRefs.value[i]?.collapseAll();
    } else if (segment.type === 'xml') {
      xmlFormatRefs.value[i]?.collapseAll();
    }
  }
}

// 展开全部
function expandAll() {
  for (let i = 0; i < parsedSegments.value.length; i++) {
    const segment = parsedSegments.value[i];
    
    if (segment.type === 'json') {
      jsonFormatRefs.value[i]?.expandAll();
    } else if (segment.type === 'xml') {
      xmlFormatRefs.value[i]?.expandAll();
    }
  }
}

async function sendToDiff() {
  const text = await getFormattedText();
  if (!text) {
    notify('warning', t('tool.noSendableContent'))
    return
  }

  send('DiffTool', text)
  notify('success', t('tool.sentToDiff'))
}

const moreOptions = computed(() => [
  { label: t('tool.sendToDiff'), key: 'diff' }
])

function handleMoreSelect(key) {
  if (key === 'diff') sendToDiff()
}

</script>

<style scoped>
.common-format-root {
  --common-format-plain-text: #334155;
  --common-format-block-bg: #f8fafc;
  --common-format-toolbar-bg: rgba(255, 255, 255, 0.95);
  --common-format-toolbar-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.common-format-root.is-dark {
  --common-format-plain-text: #d4d4d8;
  --common-format-block-bg: rgba(39, 39, 42, 0.58);
  --common-format-toolbar-bg: rgba(24, 24, 27, 0.96);
  --common-format-toolbar-shadow: 0 4px 14px rgba(0, 0, 0, 0.42);
}

.result-pane {
  border-color: var(--lk-surface-border);
  background: var(--lk-surface-bg);
}

.plain-text-segment {
  color: var(--common-format-plain-text);
}

.json-segment {
  border: 1px solid var(--lk-surface-border);
  border-radius: var(--lk-surface-radius);
  background: var(--common-format-block-bg);
}

.xml-segment {
  border: 1px solid var(--lk-surface-border);
  border-radius: var(--lk-surface-radius);
  background: var(--common-format-block-bg);
}

/* 悬浮工具栏样式 */
.format-block:hover .format-toolbar,
.format-toolbar:focus-within,
.format-toolbar.filter-open {
  opacity: 1;
}

.format-filter-input {
  width: 240px;
  max-width: 100%;
}

.format-toolbar {
  max-width: 100%;
  flex-wrap: wrap;
  gap: 4px;
  background: var(--common-format-toolbar-bg);
  border: 1px solid var(--lk-surface-border);
  border-radius: var(--lk-surface-radius);
  padding: 4px;
  box-shadow: var(--common-format-toolbar-shadow);
  z-index: 10;
}
</style>
