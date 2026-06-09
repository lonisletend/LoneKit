import { reactive, computed } from 'vue'

// 模块级单例，跨组件共享，应用生命周期内持久存在
const queues = reactive({})

/**
 * 通用组件间数据传输机制
 *
 * 发送方（Tool 组件）：
 *   const { send } = useDataTransfer()
 *   send('DiffTool', text)
 *
 * 接收方（Wrapper 组件）：通过 useQueueConsumer 消费，无需直接使用本 composable
 */
export function useDataTransfer() {
  /**
   * 将数据推入目标工具的队列
   * @param {string} targetName - 目标工具路由名称，如 'DiffTool'
   * @param {*} data - 任意数据
   */
  function send(targetName, data) {
    if (!queues[targetName]) queues[targetName] = []
    queues[targetName].push(data)
  }

  /**
   * 取出并清空目标工具队列中的全部数据
   * @param {string} targetName
   * @returns {Array}
   */
  function receiveAll(targetName) {
    const queue = queues[targetName]
    if (!queue?.length) return []
    return queue.splice(0, queue.length)
  }

  /**
   * 获取目标工具队列中待处理的数据数量（响应式）
   * @param {string} targetName
   * @returns {import('vue').ComputedRef<number>}
   */
  function pendingCount(targetName) {
    return computed(() => queues[targetName]?.length ?? 0)
  }

  return { send, receiveAll, pendingCount }
}
