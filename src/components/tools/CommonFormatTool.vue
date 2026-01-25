<template>
  <SplitPanel>
    <template #left>
      <!-- 左侧输入区域 -->
      <div class="h-full p-2 flex flex-col">
        <!-- 固定的操作按钮 -->
        <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
          <n-tag size="large" type="warning">
            输入
          </n-tag>
          <n-button @click="readClipboard">剪贴板</n-button>
          <n-button @click="showExample">示例</n-button>
          <n-button @click="clear">清空</n-button>
          <n-button @click="copySource">复制</n-button>
        </div>
        <!-- 可滚动的输入区域 -->
        <div class="flex-1 w-full overflow-hidden">
          <n-input v-model:value="sourceText" type="textarea" class="w-full h-full text-lg"
                   placeholder="输入包含 PlainText/JSON/XML 的文本" @input="handleSourceTextChange"/>
        </div>
      </div>
    </template>
    <template #right>
      <!-- 右侧输出区域 -->
      <div class="h-full p-2 flex flex-col">
        <!-- 固定的操作按钮 -->
        <div class="flex-shrink-0 w-full h-8 flex items-center space-x-4 mb-2">
          <n-tag size="large" type="success">输出</n-tag>
          <n-button @click="copyAll">复制</n-button>
          <n-button @click="collapseAll">
            <template #icon> <component :is="CollapseIcon" /> </template>
          </n-button>
          <n-button @click="expandAll">
            <template #icon> <component :is="ExpandIcon" /> </template>
          </n-button> 
        </div>
        <!-- 可滚动的输出区域 -->
        <div class="flex-1 w-full overflow-auto border border-gray-300 rounded p-3 custom-show-area">
          <div v-for="(segment, index) in parsedSegments" :key="index" class="mb-3">
            <!-- 普通文本 -->
            <div v-if="segment.type === 'plainText'" class="text-gray-700 whitespace-pre-wrap">
              {{ segment.content }}
            </div>
            <!-- JSON 格式化 -->
            <div v-else-if="segment.type === 'json'" class="relative border border-blue-200 rounded format-block">
              <!-- 悬浮工具栏 -->
              <div class="absolute top-0 right-0 flex items-center space-x-1 format-toolbar opacity-0 hover:opacity-100 transition-opacity duration-200">
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
              </div>
              <JsonFormat 
                :ref="el => setJsonFormatRef(el, index)"
                :modelValue="segment.content" 
                theme="min-light"
                class="w-full"
              />
            </div>
            <!-- XML 格式化 -->
            <div v-else-if="segment.type === 'xml'" class="relative border border-green-200 rounded format-block">
              <!-- 悬浮工具栏 -->
              <div class="absolute top-0 right-0 flex items-center space-x-1 format-toolbar opacity-0 hover:opacity-100 transition-opacity duration-200">
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
              </div>
              <XmlFormat 
                :ref="el => setXmlFormatRef(el, index)"
                :modelValue="segment.content" 
                theme="min-light"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </SplitPanel>
</template>

<script setup>
import { ref, watch } from "vue";
import { NInput, NTag, NButton } from "naive-ui";
import { 
  Copy24Regular as CopyIcon,
  TextSortAscending24Regular as SortIcon,
  ArrowMaximizeVertical24Regular as ExpandIcon,
  ArrowMinimizeVertical24Regular as CollapseIcon
} from '@vicons/fluent';

import { JsonFormat, XmlFormat } from 'lone-format';
import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';

const { notify, copyToClipboard, readFromClipboard } = useCommon();

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

const exampleText = ref(`[2026-01-25 14:23:45.123] [INFO] [OrderService] - 开始处理订单创建请求
[2026-01-25 14:23:45.156] [DEBUG] [OrderService] - 接收到订单请求数据: {"orderId":"ORD2026012545678","customerId":"CUST001","customerName":"LoneKit","items":[{"productId":"PROD001","productName":"iPhone 15 Pro","quantity":2,"price":7999.00,"discount":0.95},{"productId":"PROD002","productName":"AirPods Pro 2","quantity":1,"price":1899.00,"discount":1.0}],"shippingAddress":{"province":"北京市","city":"朝阳区","street":"建国路88号","zipCode":"100020","contact":"13800138000"},"paymentMethod":"ALIPAY","totalAmount":17897.05,"discount":799.95,"createTime":"2026-01-25T14:23:45.000Z","status":"PENDING"}
[2026-01-25 14:23:45.234] [INFO] [OrderService] - 订单数据验证通过，开始库存检查
[2026-01-25 14:23:45.267] [DEBUG] [InventoryService] - 调用库存服务 API: POST /api/v1/inventory/check
[2026-01-25 14:23:45.345] [INFO] [InventoryService] - 库存检查结果: {"success":true,"availableStock":{"PROD001":150,"PROD002":89},"reservationId":"RSV20260125001","expireTime":"2026-01-25T14:33:45.000Z"}
[2026-01-25 14:23:45.389] [DEBUG] [OrderService] - 生成支付请求，调用支付网关
[2026-01-25 14:23:45.445] [INFO] [PaymentGateway] - 创建支付订单，返回支付链接
[2026-01-25 14:23:45.501] [DEBUG] [MessageQueue] - 发送订单创建消息到 Kafka topic: order-events
[2026-01-25 14:23:45.534] [INFO] [MessageQueue] - 消息发送成功，partition: 3, offset: 123456789
[2026-01-25 14:23:45.578] [DEBUG] [AuditService] - 记录审计日志，写入数据库
[2026-01-25 14:23:45.612] [INFO] [AuditService] - 审计日志保存成功，日志ID: AUDIT20260125456789
[2026-01-25 14:23:45.645] [DEBUG] [NotificationService] - 发送 XML 格式通知到外部系统
[2026-01-25 14:23:45.678] [INFO] [NotificationService] - 通知消息内容: <?xml version="1.0" encoding="UTF-8"?><notification><type>ORDER_CREATED</type><orderId>ORD2026012545678</orderId><customer><id>CUST001</id><name>LoneKit</name><phone>13800138000</phone><level>VIP</level></customer><order><totalAmount>17897.05</totalAmount><itemCount>3</itemCount><status>PENDING</status><timestamp>2026-01-25T14:23:45.000Z</timestamp></order><actions><action type="email" to="customer@example.com" priority="high"/><action type="sms" to="13800138000" priority="medium"/></actions></notification>
[2026-01-25 14:23:45.723] [INFO] [NotificationService] - XML 通知发送完成，响应状态: 200
[2026-01-25 14:23:45.756] [INFO] [OrderService] - 订单创建流程完成，订单号: ORD2026012545678
[2026-01-25 14:23:45.789] [DEBUG] [OrderService] - 最终响应数据: {"success":true,"orderId":"ORD2026012545678","paymentUrl":"https://pay.example.com/checkout?token=abc123xyz","qrCode":"data:image/png;base64,iVBORw0KGgo...","estimatedDelivery":"2026-01-28","trackingEnabled":true,"message":"订单创建成功，请在15分钟内完成支付"}
[2026-01-25 14:23:45.812] [INFO] [OrderService] - 请求处理完成，总耗时: 667ms`);

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
  notify('success', '复制成功!');
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
  notify('success', '复制成功!');
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

// 解析输入文本，提取 JSON 和 XML
function resolveText(text) {
  if (!text || text.trim() === '') {
    return [];
  }

  const segments = [];
  let currentIndex = 0;
  
  // 查找 JSON（使用新的括号匹配算法）
  const jsonMatches = findJsonMatches(text);
  
  // 正则匹配 XML 标签（支持可选的 XML 声明）
  // 匹配：可选的 <?xml...?> 声明 + XML 标签
  const xmlPattern = /(?:<\?xml[^?]*\?>\s*)?(?:<(\w+)[^>]*>.*?<\/\1>|<\w+[^>]*\/>)/gs;
  const xmlMatches = [];
  
  let xmlMatch;
  while ((xmlMatch = xmlPattern.exec(text)) !== null) {
    // 如果匹配到内容不为空
    if (xmlMatch[0].trim()) {
      xmlMatches.push({
        start: xmlMatch.index,
        end: xmlMatch.index + xmlMatch[0].length,
        content: xmlMatch[0],
        type: 'xml'
      });
    }
  }
  
  // 合并所有匹配
  const allMatches = [...jsonMatches, ...xmlMatches];
  
  // 按起始位置排序
  allMatches.sort((a, b) => a.start - b.start);
  
  // 处理重叠，保留最长的匹配
  const filteredMatches = [];
  for (let i = 0; i < allMatches.length; i++) {
    const current = allMatches[i];
    let shouldAdd = true;
    
    // 检查是否与已添加的匹配重叠
    for (let j = 0; j < filteredMatches.length; j++) {
      const existing = filteredMatches[j];
      if (current.start < existing.end && current.end > existing.start) {
        // 有重叠，保留更长的
        if (current.end - current.start > existing.end - existing.start) {
          filteredMatches.splice(j, 1);
        } else {
          shouldAdd = false;
          break;
        }
      }
    }
    
    if (shouldAdd) {
      filteredMatches.push(current);
    }
  }
  
  // 重新排序
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
  try {
    parsedSegments.value = resolveText(sourceText.value);
  } catch (error) {
    notify('error', '解析失败: ' + error.message);
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
  sourceText.value = exampleText.value;
  handleSourceTextChange();
}

function clear() {
  sourceText.value = '';
  parsedSegments.value = [];
}

function copySource() {
  copyToClipboard(sourceText.value);
}

async function copyAll() {
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
  
  // 用换行连接所有部分
  const allText = textParts.join('\n');
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

</script>

<style scoped>
/* 悬浮工具栏样式 */
.format-block:hover .format-toolbar {
  opacity: 1;
}

.format-toolbar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}
</style>
