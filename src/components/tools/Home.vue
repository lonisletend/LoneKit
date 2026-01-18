<template>
  <div class="w-full h-full">
    <n-tabs type="line" animated>
      <n-tab-pane name="version" tab="更新日志">
        <div class="w-full px-4 py-2">
          <n-timeline>
            <n-timeline-item 
              v-for="(log, index) in changeLogs" 
              :key="index"
              :type="log.type || 'success'"
            >
              <template #header>
                <div class="text-lg font-semibold text-gray-800">
                  {{ log.date }} <span class="text-green-600">{{ log.version }}</span>
                </div>
              </template>
              
              <div class="mt-2 space-y-3">
                <!-- 新增 -->
                <div v-if="log.added && log.added.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="success" size="small">新增</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.added" :key="i">{{ item }}</li>
                  </ul>
                </div>

                <!-- 优化 -->
                <div v-if="log.optimized && log.optimized.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="info" size="small">优化</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.optimized" :key="i">{{ item }}</li>
                  </ul>
                </div>

                <!-- 修复 -->
                <div v-if="log.fixed && log.fixed.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="warning" size="small">修复</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.fixed" :key="i">{{ item }}</li>
                  </ul>
                </div>

                <!-- 删除 -->
                <div v-if="log.removed && log.removed.length > 0" class="changelog-section">
                  <div class="changelog-title">
                    <n-tag type="error" size="small">删除</n-tag>
                  </div>
                  <ul class="changelog-list">
                    <li v-for="(item, i) in log.removed" :key="i">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </n-timeline-item>
          </n-timeline>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>

import { NTabs, NTabPane, NTimeline, NTimelineItem, NTag } from "naive-ui";
import { ref } from "vue";

const changeLogs = ref([
  {
    date: '2026.01.18',
    version: 'v0.6.1',
    added: [
      'SQL 格式化，支持高亮、折叠。'
    ],
    optimized: [
      '删除已废弃实现，减少依赖。'
    ],
  },
  {
    date: '2026.01.14',
    version: 'v0.6.0',
    added: [
      '新增二维码识别工具，支持图片拖拽、点击上传、剪贴板读取、历史列表、URL 自动渲染等。'
    ]
  },
  {
    date: '2026.01.14',
    version: 'v0.5.2',
    fixed: [
      '修复多 Tab 页面编辑 Tab 标题后，页面内容丢失的问题。'
    ],
  },
  {
    date: '2026.01.05',
    version: 'v0.5.1',
    added: [
      '所有多 Tab 页面支持双击编辑 Tab 标题功能。'
    ],
  },
  {
    date: '2025.12.19',
    version: 'v0.5.0',
    added: [
      'Json 格式化、XML 格式化 支持全部折叠/全部展开。',
      'SQL 格式化 (Beta) 。'
    ],
    optimized: [
      '所有左右分栏工具宽度调整分隔条支持双击还原左右 1:1 布局。'
    ],
    fixed: [
      'XML 格式化 修复 CDATA 中内容被错误识别为非法实体引用问题。',
    ],
  }, 
  {
    date: '2025.12.10',
    version: 'v0.4.3',
    fixed: [
      'XML 格式化 修复空内容默认自闭合标签问题，保留原格式。',
      'XML 格式化 修复实体引用校验错误问题。'
    ],
  },  
  {
    date: '2025.12.07',
    version: 'v0.4.2',
    added: [
      'Json 格式化 支持格式化结果 key 排序功能。',
      'XML 格式化 支持 XPath 过滤功能。',
    ],
  },  
  {
    date: '2025.12.05',
    version: 'v0.4.1',
    optimized: [
      'Json 格式化 JavaScript 过滤，修改为 $ 指代当前数据，与 JsonPath 保持一致。'
    ],
    fixed: [
      'Json 格式化 JavaScript 过滤，修复保护小数过滤匹配错误问题。'
    ],
  },  
  {
    date: '2025.12.03',
    version: 'v0.4.0',
    optimized: [
      'Json 格式化 优化编辑样式。'
    ],
    added: [
      'XML 格式化 (Beta) 转正，支持编辑功能，增加对齐线，优化展示。'
    ],
  },  
  {
    date: '2025.11.19',
    version: 'v0.3.6',
    optimized: [
      'Json 格式化、XML 格式化 (Beta)  折叠提示效果。',
    ],
    fixed: [
      'Json 格式化字符串类型大数编辑保存后格式错误问题。',
    ],
  },
  {
    date: '2025.11.16',
    version: 'v0.3.5',
    optimized: [
      'DiffTool、SQLTool 支持多 Tab 模式。',
      '所有左右分栏工具支持可拖动调整宽度，分隔条默认隐藏，hover 显示。',
      'JSON 格式化、XML 格式化 渲染结果区域滚动。',
    ],
  },
  {
    date: '2025.11.03',
    version: 'v0.3.0',
    added: [
      'XML 格式化 (Beta)，使用 lone-format 实现，支持节点折叠/展开。',
    ],
    optimized: [
      'Json 格式化 Beta 转正。',
    ],
  },
  {
    date: '2025.08.05',
    version: 'v0.1.4',
    added: [],
    optimized: [
      'Json 格式化 (Beta) 长文本长数字换行逗号展示优化。',
      'Json 格式化支持 JsonPath/JavaScript 过滤。',
    ],
  },
  {
    date: '2025.08.05',
    version: 'v0.1.2',
    added: [
      'Json 格式化 (Beta)，使用 lone-format 组件，支持大数、支持编辑。',
    ],
  },
  {
    date: '2025.04.01',
    version: 'v0.1.0',
    added: [
      'XML 格式化。',
    ],
    removed: [
      '通用格式化（依赖太多，性能太差）。',
    ]
  },
  {
    date: '2025.02.23',
    version: 'v0.0.9',
    added: [
      '通用格式化，支持 XML、Java 格式化。',
    ],
  },
  {
    date: '2024.10.10',
    version: 'v0.0.8',
    optimized: [
      'Json 格式化 (Wrap模式) 支持 Tab，终于不用打开多个浏览器 Tab 啦！',
    ],
  },
  {
    date: '2024.06.09',
    version: 'v0.0.7',
    added: [
      '字符串16进制转换。',
    ],
  },
  {
    date: '2024.02.20',
    version: 'v0.0.6',
    added: [
      'SQL 格式化。',
      '文本对比。',
    ],
  },
  {
    date: '2024.01.04',
    version: 'v0.0.5',
    added: [
      '时间戳转换。',
      'Json 格式化。',
      'Base64 编解码。',
      'MD5 加密。',
      '二维码生成。',
      '条形码生成。',
    ],
  },
  {
    date: '2023.12.10',
    version: 'v0.0.1',
    added: [
      '项目初始化。',
    ],
  }
]);

</script>

<style scoped>
.changelog-section {
  margin-bottom: 12px;
}

.changelog-title {
  margin-bottom: 8px;
}

.changelog-list {
  margin-left: 24px;
  list-style-type: disc;
  color: #666;
}

.changelog-list li {
  margin-bottom: 4px;
  line-height: 1.6;
}
</style>
