import { ref } from 'vue';

/**
 * 分栏面板的通用 composable
 * 提供分栏大小控制和双击重置功能
 * 
 * @param {Object} options 配置选项
 * @param {number} [options.defaultSize=0.5] - 默认分栏大小（0-1之间的比例）
 * @returns {Object} 返回分栏管理相关的响应式数据和方法
 * @returns {Ref} splitRef - n-split 组件的引用
 * @returns {Ref<number>} splitSize - 分栏大小的响应式变量
 * @returns {Function} resetSplit - 重置分栏大小为默认值的函数
 * 
 * @example
 * // 在组件中使用
 * import { useSplitPanel } from '../../composables/useSplitPanel'
 * 
 * // 使用默认配置（50/50分栏）
 * const { splitRef, splitSize, resetSplit } = useSplitPanel();
 * 
 * // 或使用自定义默认大小
 * const { splitRef, splitSize, resetSplit } = useSplitPanel({ defaultSize: 0.3 });
 * 
 * // 在模板中使用
 * <n-split ref="splitRef" v-model:size="splitSize" :default-size="0.5">
 *   <template #resize-trigger>
 *     <div class="resize-trigger" @dblclick="resetSplit"></div>
 *   </template>
 *   <!-- 分栏内容 -->
 * </n-split>
 */
export function useSplitPanel(options = {}) {
  const {
    defaultSize = 0.5
  } = options;

  // 分栏引用
  const splitRef = ref(null);
  
  // 分栏大小（0-1之间的比例值）
  const splitSize = ref(defaultSize);

  /**
   * 重置分栏大小为默认值
   */
  const resetSplit = () => {
    splitSize.value = defaultSize;
  };

  return {
    splitRef,
    splitSize,
    resetSplit
  };
}
