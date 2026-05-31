import { onMounted, onActivated } from 'vue'
import { useDataTransfer } from './useDataTransfer.js'

/**
 * 供 Wrapper 组件使用的队列消费抽象
 *
 * 自动在 onMounted（首次打开）和 onActivated（KeepAlive 激活）时消费队列，
 * 按 batchSize 分组，每组调用一次 onCreate，用于批量创建 Tab 并填充数据。
 *
 * 接入新工具只需：
 *   useQueueConsumer({
 *     targetName: 'MyTool',
 *     batchSize: 1,
 *     onCreate: (batch) => handleAdd(batch[0])
 *   })
 *
 * @param {object} options
 * @param {string}   options.targetName  - 与 send() 的第一个参数保持一致
 * @param {number}   [options.batchSize=1] - 每个 Tab 消费几条数据
 * @param {Function} options.onCreate    - 每批次回调，参数为 data[]，长度 <= batchSize
 */
export function useQueueConsumer({ targetName, batchSize = 1, onCreate }) {
  const { receiveAll } = useDataTransfer()

  function consume() {
    const items = receiveAll(targetName)
    if (!items.length) return

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      onCreate(batch)
    }
  }

  onMounted(consume)    // 首次打开
  onActivated(consume)  // KeepAlive 从缓存激活
}
