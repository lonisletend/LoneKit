<template>
  <div class="w-full h-full bg-white">
    <router-view />
    <UpdateDialog ref="updateDialogRef" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import UpdateDialog from './components/common/UpdateDialog.vue';

const updateDialogRef = ref(null);
</script>

<style>

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 滚动条轨道 - 与 shadcn-vue ScrollArea 保持一致 */
::-webkit-scrollbar-track {
  background: transparent;
}

/* 滚动条滑块 - 使用灰色系，与 shadcn-vue 设计保持一致 */
::-webkit-scrollbar-thumb {
  background-color: #e2e8f0; /* slate-200 */
  border-radius: 9999px;
  border: 1px solid transparent;
  background-clip: padding-box;
}

/* 滚动条滑块悬停效果 */
::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1; /* slate-300 */
}

/* 滚动条角落 */
::-webkit-scrollbar-corner {
  background: transparent;
}
</style>