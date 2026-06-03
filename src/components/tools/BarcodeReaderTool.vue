<script setup>
import { ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { NButton, NCard, NUpload, NIcon, NText, NTag, NEmpty } from "naive-ui";
import { CloudUploadOutline } from "@vicons/ionicons5";
import { readBarcodesFromImageFile } from 'zxing-wasm/reader';
import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';
import { useThemeMode } from '../../composables/useThemeMode';

// 历史记录数组
const historyList = ref([]);
const isLoading = ref(false);
const isProcessing = ref(false);

const { notify, copyToClipboard } = useCommon();
const { t } = useI18n();
const { resolvedTheme } = useThemeMode();

// 处理图片文件并识别条形码（通用逻辑）
async function processImageFile(imageFile) {
  // 防止重复处理
  if (isProcessing.value) return;
  
  // 验证文件类型
  if (!imageFile.type.startsWith('image/')) {
    notify('error', t('tool.reader.selectImageFile'));
    return;
  }
  
  isProcessing.value = true;
  isLoading.value = true;
  
  try {
    // 读取图片
    const reader = new FileReader();
    const imageDataUrl = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
    
    // 识别条形码
    const results = await readBarcodesFromImageFile(imageFile, {
      tryHarder: true,
    });
    
    if (!results || results.length === 0) {
      throw new Error('No barcode found');
    }
    
    const barcode = results[0];
    
    // 添加到历史记录（添加到数组末尾）
    historyList.value.push({
      id: Date.now(),
      imageUrl: imageDataUrl,
      result: barcode.text,
      format: barcode.format,
      timestamp: new Date().toLocaleString()
    });
    
    notify('success', t('tool.reader.recognized'));
    
    // 滚动到底部
    await nextTick();
    const leftScroll = document.querySelector('.barcode-scroll-left');
    const rightScroll = document.querySelector('.barcode-scroll-right');
    if (leftScroll) leftScroll.scrollTop = leftScroll.scrollHeight;
    if (rightScroll) rightScroll.scrollTop = rightScroll.scrollHeight;
    
  } catch (error) {
    console.error('识别失败:', error);
    notify('error', t('tool.reader.barcodeFailed'));
  } finally {
    isLoading.value = false;
    isProcessing.value = false;
  }
}

async function handleFileChange(options) {
  const { file } = options;
  if (!file.file) return;
  await processImageFile(file.file);
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileChange({ file: { file: files[0] } });
  }
}

// 从剪贴板读取图片
async function handleClipboardPaste() {
  try {
    // 检查是否支持剪贴板 API
    if (!navigator.clipboard || !navigator.clipboard.read) {
      notify('warning', t('tool.reader.clipboardUnsupported'));
      return;
    }
    
    const clipboardItems = await navigator.clipboard.read();
    
    // 查找剪贴板中的图片
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type);
          // 将 Blob 转换为 File 对象
          const file = new File([blob], 'clipboard-image.png', { type });
          await processImageFile(file);
          return;
        }
      }
    }
    
    notify('warning', t('tool.reader.clipboardNoImage'));
  } catch (error) {
    console.error('读取剪贴板失败:', error);
    if (error.name === 'NotAllowedError') {
      notify('error', t('tool.reader.clipboardPermissionDenied'));
    } else {
      notify('error', t('tool.reader.readClipboardFailed'));
    }
  }
}

function clearAll() {
  historyList.value = [];
  isProcessing.value = false;
  notify('success', t('tool.reader.cleared'));
}

function deleteItem(id) {
  const index = historyList.value.findIndex(item => item.id === id);
  if (index > -1) {
    historyList.value.splice(index, 1);
  }
}

function copyText(text) {
  copyToClipboard(text);
}

// 判断文本是否为URL
function isURL(text) {
  if (!text) return false;
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// 同步滚动
function syncScroll(e, target) {
  const source = e.target;
  const targetEl = document.querySelector(target);
  if (targetEl) {
    targetEl.scrollTop = source.scrollTop;
  }
}

</script>

<template>
  <div class="barcode-reader-root h-full flex flex-col overflow-hidden" :class="{ 'is-dark': resolvedTheme === 'dark' }">
    <SplitPanel>
      <template #left>
        <div class="flex flex-col h-full p-2 space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">{{ t('tool.reader.uploadImage') }}</n-tag>
            <n-button @click="handleClipboardPaste">{{ t('tool.reader.readClipboard') }}</n-button>
            <n-button @click="clearAll" :disabled="historyList.length === 0">{{ t('tool.reader.deleteAll') }}</n-button>
          </div>
          
          <div class="flex-1 overflow-auto barcode-scroll-left" @scroll="syncScroll($event, '.barcode-scroll-right')">
            <!-- 历史记录 -->
            <div v-if="historyList.length > 0" class="space-y-4 mb-4">
              <div 
                v-for="item in historyList" 
                :key="item.id"
                class="history-item relative"
              >
                <n-button 
                  size="small" 
                  @click="deleteItem(item.id)"
                  style="position: absolute; bottom: 8px; right: 8px; z-index: 10;"
                >
                  {{ t('tool.reader.delete') }}
                </n-button>
                <n-card size="small">
                  <img 
                    :src="item.imageUrl" 
                    :alt="t('tool.reader.barcodeImageAlt')" 
                    class="w-full h-auto"
                    style="max-height: 200px; object-fit: contain;"
                  />
                </n-card>
              </div>
            </div>
            
            <!-- 上传区域 -->
            <n-upload
              :show-file-list="false"
              accept="image/*"
              @change="handleFileChange"
            >
              <div 
                class="upload-placeholder"
                @drop.prevent="handleDrop"
                @dragover.prevent
              >
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <CloudUploadOutline />
                  </n-icon>
                </div>
                <n-text style="font-size: 14px">
                  {{ isLoading ? t('tool.reader.recognizing') : t('tool.reader.uploadHint') }}
                </n-text>
                <n-text depth="3" style="margin-top: 8px; font-size: 12px">
                  {{ t('tool.reader.imageFormatHint') }}
                </n-text>
              </div>
            </n-upload>
          </div>
        </div>
      </template>
      
      <template #right>
        <div class="flex flex-col h-full p-2 space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">{{ t('tool.reader.result') }}</n-tag>
          </div>
          
          <div class="flex-1 overflow-auto barcode-scroll-right" @scroll="syncScroll($event, '.barcode-scroll-left')">
            <!-- 历史记录结果 -->
            <div v-if="historyList.length > 0" class="space-y-4 mb-4">
              <div 
                v-for="item in historyList" 
                :key="item.id"
                class="history-item relative"
              >
                <n-button 
                  size="small" 
                  @click="copyText(item.result)"
                  style="position: absolute; bottom: 8px; right: 8px; z-index: 10;"
                >
                  {{ t('tool.reader.copy') }}
                </n-button>
                <n-tag v-if="item.format" size="small" type="info"
                  style="position: absolute; top: 8px; right: 8px; z-index: 10;">
                  {{ item.format }}
                </n-tag>
                <n-card size="small">
                  <div class="result-text whitespace-pre-wrap break-all">
                    <div>
                      <a 
                        v-if="isURL(item.result)" 
                        :href="item.result" 
                        target="_blank" 
                        class="result-link"
                      >
                        {{ item.result }}
                      </a>
                      <span v-else>{{ item.result }}</span>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
            
            <!-- 提示区域 -->
            <div class="result-placeholder">
              <n-empty :description="t('tool.reader.resultPlaceholder')" />
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>
.barcode-reader-root {
  --reader-result-text: #334155;
  --reader-result-bg: transparent;
  --reader-placeholder-border: var(--lk-surface-border);
  --reader-placeholder-bg: var(--lk-surface-bg);
  --reader-placeholder-hover-border: var(--lk-surface-border-hover);
  --reader-placeholder-text: rgba(0, 0, 0, 0.45);
  --reader-link: #18a058;
  --reader-link-hover: #36ad6a;
}

.barcode-reader-root.is-dark {
  --reader-result-text: #d4d4d8;
  --reader-result-bg: transparent;
  --reader-placeholder-border: var(--lk-surface-border);
  --reader-placeholder-bg: var(--lk-surface-bg);
  --reader-placeholder-hover-border: var(--lk-surface-border-hover);
  --reader-placeholder-text: #a1a1aa;
  --reader-link: #4ade80;
  --reader-link-hover: #86efac;
}

.history-item {
  scroll-margin-top: 1rem;
}

.history-item :deep(.n-card) {
  border: 1px solid var(--lk-surface-border);
  border-radius: var(--lk-surface-radius);
  background: var(--lk-surface-bg);
}

.history-item :deep(.n-card__content) {
  padding: var(--lk-surface-padding);
}

.result-text {
  font-family: Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 24px 0 40px 0;
  min-height: 200px;
  max-height: 200px;
  overflow-y: auto;
  color: var(--reader-result-text, #334155);
  background: var(--reader-result-bg, transparent);
}

/* 统一左右两侧提示区域样式 */
.upload-placeholder,
.result-placeholder {
  width: 100%;
  min-height: 150px;
  height: 150px;
  border: 1px dashed var(--reader-placeholder-border, #d9d9d9) !important;
  border-radius: var(--lk-surface-radius);
  background-color: var(--reader-placeholder-bg, #fafafa);
  padding: var(--lk-surface-padding);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  box-sizing: border-box;
}

.upload-placeholder:hover {
  border-color: var(--reader-placeholder-hover-border, #40a9ff) !important;
}

.result-placeholder {
  cursor: default;
}

/* 统一空状态文字颜色 */
.upload-placeholder :deep(.n-text),
.result-placeholder :deep(.n-empty__description) {
  color: var(--reader-placeholder-text, rgba(0, 0, 0, 0.45));
}

/* 让 n-upload 组件占满整个容器宽度 */
:deep(.n-upload) {
  width: 100%;
}

:deep(.n-upload-trigger) {
  width: 100%;
}

/* URL 链接样式 */
.result-link {
  color: var(--reader-link, #18a058);
  text-decoration: underline;
  cursor: pointer;
}

.result-link:hover {
  color: var(--reader-link-hover, #36ad6a);
  text-decoration: underline;
}
</style>
