<script setup>
import { ref, nextTick } from "vue";
import { NButton, NCard, NUpload, NUploadDragger, NIcon, NText, NTag, NEmpty } from "naive-ui";
import { CloudUploadOutline } from "@vicons/ionicons5";
import QrScanner from 'qr-scanner';
import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';

// 历史记录数组
const historyList = ref([]);
const isLoading = ref(false);
const isProcessing = ref(false);

const { notify, copyToClipboard } = useCommon();

// 处理图片文件并识别二维码（通用逻辑）
async function processImageFile(imageFile) {
  // 防止重复处理
  if (isProcessing.value) return;
  
  // 验证文件类型
  if (!imageFile.type.startsWith('image/')) {
    notify('error', '请选择图片文件');
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
    
    // 识别二维码
    const qrResult = await QrScanner.scanImage(imageFile);
    const resultText = typeof qrResult === 'string' ? qrResult : qrResult.data;
    
    // 添加到历史记录（添加到数组末尾）
    historyList.value.push({
      id: Date.now(),
      imageUrl: imageDataUrl,
      result: resultText,
      timestamp: new Date().toLocaleString()
    });
    
    notify('success', '识别成功');
    
    // 滚动到底部
    await nextTick();
    const leftScroll = document.querySelector('.history-scroll-left');
    const rightScroll = document.querySelector('.history-scroll-right');
    if (leftScroll) leftScroll.scrollTop = leftScroll.scrollHeight;
    if (rightScroll) rightScroll.scrollTop = rightScroll.scrollHeight;
    
  } catch (error) {
    console.error('识别失败:', error);
    notify('error', '未能识别二维码，请确保图片包含清晰的二维码');
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
      notify('warning', '当前浏览器不支持读取剪贴板');
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
    
    notify('warning', '剪贴板中没有图片');
  } catch (error) {
    console.error('读取剪贴板失败:', error);
    if (error.name === 'NotAllowedError') {
      notify('error', '没有读取剪贴板的权限，请允许浏览器访问剪贴板');
    } else {
      notify('error', '读取剪贴板失败');
    }
  }
}

function clearAll() {
  historyList.value = [];
  isProcessing.value = false;
  notify('success', '已清空所有记录');
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
  <div class="h-full flex flex-col overflow-hidden">
    <SplitPanel>
      <template #left>
        <div class="flex flex-col h-full p-2 space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="warning">上传图片</n-tag>
            <n-button @click="handleClipboardPaste">剪贴板读取</n-button>
            <n-button @click="clearAll" :disabled="historyList.length === 0">删除全部</n-button>
          </div>
          
          <div class="flex-1 overflow-auto history-scroll-left" @scroll="syncScroll($event, '.history-scroll-right')">
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
                  style="position: absolute; top: 8px; right: 8px; z-index: 10;"
                >
                  删除
                </n-button>
                <n-card size="small">
                  <img 
                    :src="item.imageUrl" 
                    alt="二维码图片" 
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
                  {{ isLoading ? '识别中...' : '点击或拖拽图片到此区域上传' }}
                </n-text>
                <n-text depth="3" style="margin-top: 8px; font-size: 12px">
                  支持 jpg、png、gif、webp 等格式
                </n-text>
              </div>
            </n-upload>
          </div>
        </div>
      </template>
      
      <template #right>
        <div class="flex flex-col h-full p-2 space-y-2">
          <div class="w-full h-8 flex items-center space-x-4">
            <n-tag size="large" type="success">识别结果</n-tag>
          </div>
          
          <div class="flex-1 overflow-auto history-scroll-right" @scroll="syncScroll($event, '.history-scroll-left')">
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
                  style="position: absolute; top: 8px; right: 8px; z-index: 10;"
                >
                  复制
                </n-button>
                <n-card size="small">
                  <div class="result-text whitespace-pre-wrap break-all">
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
                </n-card>
              </div>
            </div>
            
            <!-- 提示区域 -->
            <div class="result-placeholder">
              <n-empty description="识别结果将显示在这里" />
            </div>
          </div>
        </div>
      </template>
    </SplitPanel>
  </div>
</template>

<style scoped>
.history-item {
  scroll-margin-top: 1rem;
}

.result-text {
  font-family: Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 40px 8px 8px 8px;
  border-radius: 4px;
  min-height: 200px;
  max-height: 200px;
  overflow-y: auto;
}

/* 统一左右两侧提示区域样式 */
.upload-placeholder,
.result-placeholder {
  width: 100%;
  min-height: 150px;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.upload-placeholder:hover {
  border-color: #40a9ff;
}

.result-placeholder {
  cursor: default;
}

/* 统一空状态文字颜色 */
.upload-placeholder :deep(.n-text),
.result-placeholder :deep(.n-empty__description) {
  color: rgba(0, 0, 0, 0.45);
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
  color: #18a058;
  text-decoration: underline;
  cursor: pointer;
}

.result-link:hover {
  color: #36ad6a;
  text-decoration: underline;
}
</style>
