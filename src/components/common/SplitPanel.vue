<template>
  <div class="w-full h-full">
    <n-split 
      ref="splitRef" 
      :direction="direction" 
      v-model:size="splitSize" 
      :default-size="defaultSize" 
      :min="min" 
      :max="max"
    >
      <template #resize-trigger>
        <div class="resize-trigger" @dblclick="handleResetSplit"></div>
      </template>
      <template #1>
        <slot name="left"></slot>
      </template>
      <template #2>
        <slot name="right"></slot>
      </template>
    </n-split>
  </div>
</template>

<script setup>
import { NSplit } from 'naive-ui';
import { useSplitPanel } from '../../composables/useSplitPanel';

const props = defineProps({
  /**
   * 分栏方向
   */
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  /**
   * 默认分栏大小（0-1之间的比例）
   */
  defaultSize: {
    type: Number,
    default: 0.5
  },
  /**
   * 最小分栏大小
   */
  min: {
    type: Number,
    default: 0.2
  },
  /**
   * 最大分栏大小
   */
  max: {
    type: Number,
    default: 0.8
  }
});

// 使用分栏管理 composable
const { splitRef, splitSize, resetSplit } = useSplitPanel({ 
  defaultSize: props.defaultSize 
});

// 处理重置事件
const handleResetSplit = () => {
  resetSplit();
};

// 暴露给父组件使用的方法
defineExpose({
  resetSplit,
  splitRef,
  splitSize
});
</script>

<style scoped>
/* 组件样式可以根据需要添加 */
</style>
