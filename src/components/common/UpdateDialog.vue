<template>
  <!-- 右下角悬浮通知卡片 -->
  <transition name="slide-fade">
    <div v-if="showDialog" class="update-notification">
      <n-card 
        :title="dialogTitle" 
        size="small"
        :bordered="true"
        class="update-card"
        hoverable
      >
        <template #header-extra>
          <n-button 
            text 
            @click="closeDialog"
            :disabled="status === 'downloading' || status === 'installing'"
          >
            <template #icon>
              <span class="text-lg">×</span>
            </template>
          </n-button>
        </template>

        <div class="update-content">
          <div v-if="status === 'checking'" class="flex items-center gap-3">
            <n-spin size="small" />
            <span>正在检查更新...</span>
          </div>

          <div v-else-if="status === 'found'" class="space-y-3">
            <div>
              <p class="text-base font-medium">发现新版本: {{ updateInfo.version }}</p>
              <p class="text-sm text-gray-500" v-if="updateInfo.date">
                发布日期: {{ formatDate(updateInfo.date) }}
              </p>
            </div>
            
            <div v-if="updateInfo.body" class="bg-gray-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
              <p class="font-medium mb-1 text-xs">更新说明：</p>
              <div class="whitespace-pre-wrap text-xs">{{ updateInfo.body }}</div>
            </div>

            <div class="flex gap-2 justify-end">
              <n-button size="small" @click="skipUpdate" :disabled="downloading">稍后</n-button>
              <n-button size="small" type="primary" @click="handleUpdate" :loading="downloading">
                {{ updateButtonText }}
              </n-button>
            </div>
          </div>

          <div v-else-if="status === 'downloading'" class="space-y-2">
            <p class="text-sm">正在下载更新...</p>
            <n-progress
              type="line"
              :percentage="downloadProgress"
              :show-indicator="true"
              processing
            />
            <p class="text-xs text-gray-500">
              {{ formatBytes(downloadedBytes) }} / {{ formatBytes(totalBytes) }}
            </p>
          </div>

          <div v-else-if="status === 'installing'" class="flex items-center gap-3">
            <n-spin size="small" />
            <span class="text-sm">正在安装更新...</span>
          </div>

          <div v-else-if="status === 'error'" class="space-y-3">
            <p class="text-red-500 text-sm">{{ errorMessage }}</p>
            <div class="flex justify-end">
              <n-button size="small" @click="closeDialog">关闭</n-button>
            </div>
          </div>
        </div>
      </n-card>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { NCard, NButton, NProgress, NSpin } from 'naive-ui';

const showDialog = ref(false);
const status = ref('idle'); // idle, checking, found, downloading, installing, error
const updateInfo = ref(null);
const downloadProgress = ref(0);
const downloadedBytes = ref(0);
const totalBytes = ref(0);
const errorMessage = ref('');
const downloading = ref(false);
let pendingUpdate = null; // 使用普通变量存储 update 对象

// 检测是否在 Tauri 环境中（使用官方 API）
const checkIsTauri = async () => {
  try {
    const { isTauri } = await import('@tauri-apps/api/core');
    const result = isTauri();
    console.log('[UpdateDialog] 使用 isTauri() 检测结果:', result);
    return result;
  } catch (error) {
    console.log('[UpdateDialog] 无法导入 Tauri API，假定为 Web 环境:', error);
    return false;
  }
};

// 检测是否支持自动更新
const supportsAutoUpdate = async () => {
  const isTauriEnv = await checkIsTauri();
  if (!isTauriEnv) {
    console.log('[UpdateDialog] 不在 Tauri 环境，不支持自动更新');
    return false;
  }
  
  try {
    const { platform } = await import('@tauri-apps/plugin-os');
    const platformName = platform();
    
    console.log('[UpdateDialog] 检测到平台:', platformName);
    
    // Windows 和 macOS 支持自动更新
    if (platformName === 'windows' || platformName === 'macos') {
      console.log('[UpdateDialog] Windows/macOS 平台，支持自动更新');
      return true;
    }
    
    // Linux 平台：只有 AppImage 支持自动更新
    if (platformName === 'linux') {
      console.log('[UpdateDialog] Linux 平台，检查是否为 AppImage...');
      const { Command } = await import('@tauri-apps/plugin-shell');
      const result = await Command.create('printenv', ['APPIMAGE']).execute();
      
      console.log('[UpdateDialog] APPIMAGE 环境变量检测结果:', {
        stdout: result.stdout,
        stderr: result.stderr,
        code: result.code
      });
      
      const isAppImage = result.stdout && result.stdout.trim().length > 0;
      console.log('[UpdateDialog] Linux AppImage:', isAppImage ? '是' : '否（RPM/DEB）');
      return isAppImage;
    }
    
    // 其他平台不支持
    console.log('[UpdateDialog] 未知平台，不支持自动更新');
    return false;
  } catch (error) {
    console.log('[UpdateDialog] 检测自动更新支持失败:', error);
    return false;
  }
};

const dialogTitle = computed(() => {
  switch (status.value) {
    case 'checking': return '检查更新';
    case 'found': return '发现新版本';
    case 'downloading': return '下载更新';
    case 'installing': return '安装更新';
    case 'error': return '更新失败';
    default: return '更新';
  }
});

// 更新按钮文本（需要等待检测结果）
const updateButtonText = ref('立即更新');

// 检查更新
const checkUpdate = async () => {
  console.log('[UpdateDialog] ========== 开始检查更新 ==========');
  
  // 检查是否在 Tauri 环境
  const isTauriEnv = await checkIsTauri();
  if (!isTauriEnv) {
    console.log('[UpdateDialog] Web 环境，跳过更新检查');
    return;
  }
  
  console.log('[UpdateDialog] Tauri 环境已确认');

  try {
    // 动态导入 Tauri 插件（避免 Web 环境报错）
    console.log('[UpdateDialog] 开始导入 updater 插件...');
    const { check } = await import('@tauri-apps/plugin-updater');
    console.log('[UpdateDialog] updater 插件导入成功');
    
    status.value = 'checking';
    showDialog.value = true;
    console.log('[UpdateDialog] 显示检查更新对话框');

    console.log('[UpdateDialog] 调用 check() 检查更新...');
    const update = await check();
    console.log('[UpdateDialog] check() 返回结果:', update ? {
      version: update.version,
      date: update.date,
      currentVersion: update.currentVersion,
      available: update.available
    } : 'null (没有更新)');
    
    if (update) {
      // 检测是否支持自动更新
      console.log('[UpdateDialog] 发现更新，检测是否支持自动更新...');
      const canAutoUpdate = await supportsAutoUpdate();
      console.log('[UpdateDialog] 自动更新支持:', canAutoUpdate ? '是' : '否');
      
      // 设置按钮文本
      updateButtonText.value = canAutoUpdate ? '立即更新' : '前往下载';
      console.log('[UpdateDialog] 按钮文本设置为:', updateButtonText.value);
      
      // 支持自动更新的平台存储 update 对象
      if (canAutoUpdate) {
        pendingUpdate = update;
        console.log('[UpdateDialog] 支持自动更新，已保存 update 对象');
      }
      
      status.value = 'found';
      updateInfo.value = {
        version: update.version,
        date: update.date,
        body: update.body
      };
      console.log('[UpdateDialog] 更新信息已设置，状态改为 found');
    } else {
      // 没有更新，关闭对话框
      console.log('[UpdateDialog] 当前已是最新版本，关闭对话框');
      showDialog.value = false;
      status.value = 'idle';
    }
    
    console.log('[UpdateDialog] ========== 检查更新完成 ==========');
  } catch (error) {
    console.error('[UpdateDialog] ========== 检查更新失败 ==========');
    console.error('[UpdateDialog] 错误详情:', error);
    status.value = 'error';
    errorMessage.value = error.message || '检查更新失败';
  }
};

// 处理更新点击
const handleUpdate = async () => {
  // 检测是否支持自动更新
  const canAutoUpdate = await supportsAutoUpdate();
  
  // 不支持自动更新：打开浏览器跳转到下载页面
  if (!canAutoUpdate) {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open('https://github.com/lonisletend/LoneKit/releases');
      skipUpdate(); // 关闭对话框
    } catch (error) {
      console.error('[UpdateDialog] 打开浏览器失败:', error);
      errorMessage.value = '无法打开浏览器';
      status.value = 'error';
    }
    return;
  }

  // 支持自动更新：执行自动更新流程
  if (!pendingUpdate) {
    errorMessage.value = '未找到待更新的版本';
    status.value = 'error';
    return;
  }

  try {
    // 动态导入 relaunch
    const { relaunch } = await import('@tauri-apps/plugin-process');
    
    downloading.value = true;
    status.value = 'downloading';
    downloadProgress.value = 0;
    downloadedBytes.value = 0;
    totalBytes.value = 0;
    
    await pendingUpdate.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          totalBytes.value = event.data.contentLength || 0;
          break;
        case 'Progress':
          downloadedBytes.value += event.data.chunkLength;
          if (totalBytes.value > 0) {
            downloadProgress.value = Math.round((downloadedBytes.value / totalBytes.value) * 100);
          }
          break;
        case 'Finished':
          downloadProgress.value = 100;
          status.value = 'installing';
          break;
      }
    });

    // 安装完成，重启应用
    console.log('[UpdateDialog] 更新安装完成，准备重启应用');
    await relaunch();
  } catch (error) {
    status.value = 'error';
    errorMessage.value = error.message || '更新失败';
    downloading.value = false;
    console.error('[UpdateDialog] 更新失败:', error);
  }
};

// 跳过更新
const skipUpdate = () => {
  showDialog.value = false;
  status.value = 'idle';
  updateInfo.value = null;
  pendingUpdate = null;
};

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false;
  status.value = 'idle';
  errorMessage.value = '';
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 格式化字节
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// 生命周期 - 启动时检查更新
onMounted(async () => {
  console.log('[UpdateDialog] 组件已挂载');
  
  const isTauriEnv = await checkIsTauri();
  console.log('[UpdateDialog] Tauri 环境检测结果:', isTauriEnv);
  
  // 仅在 Tauri 环境下检查更新
  if (isTauriEnv) {
    console.log('[UpdateDialog] 检测到 Tauri 环境，将在 2 秒后检查更新...');
    // 延迟2秒检查更新，避免影响启动速度
    setTimeout(() => {
      checkUpdate();
    }, 2000);
  } else {
    console.log('[UpdateDialog] 未检测到 Tauri 环境，跳过更新检查');
  }
});

// 暴露方法供外部调用
defineExpose({
  checkUpdate
});
</script>

<style scoped>
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 380px;
  min-width: 320px;
}

.update-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.update-content {
  max-height: 400px;
  overflow-y: auto;
}

/* 进入和离开动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(100px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
