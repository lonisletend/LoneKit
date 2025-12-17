# SplitPanel 组件重构总结

## 重构目标
将所有工具组件中重复的分栏功能代码抽取为可复用的组件，减少代码重复，提高维护性。

## 实现方案

### 1. 创建 useSplitPanel Composable
位置：`src/composables/useSplitPanel.js`

提供分栏管理的核心逻辑：
- `splitRef`: 分栏组件引用
- `splitSize`: 分栏大小（响应式）
- `resetSplit()`: 重置分栏为 1:1

### 2. 创建 SplitPanel 组件
位置：`src/components/common/SplitPanel.vue`

封装完整的分栏 UI 和交互：
- Props: `direction`, `defaultSize`, `min`, `max`
- Slots: `#left` 和 `#right`（更语义化）
- 自动支持双击重置功能
- 内部使用 `useSplitPanel` composable

### 3. 组件使用示例

```vue
<script setup>
import SplitPanel from '../common/SplitPanel.vue'
</script>

<template>
  <SplitPanel>
    <template #left>
      <!-- 左侧内容 -->
    </template>
    <template #right>
      <!-- 右侧内容 -->
    </template>
  </SplitPanel>
</template>
```

## 迁移的工具组件

✅ JsonFormatTool.vue - JSON 格式化工具（带折叠/展开按钮）
✅ XmlFormatTool.vue - XML 格式化工具（带折叠/展开按钮）
✅ SQLTool.vue - SQL 工具
✅ Base64Tool.vue - Base64 编解码工具
✅ XmlTool.vue - XML 工具
✅ SQLFormatTool.vue - SQL 格式化工具
✅ JsonTool.vue - JSON 工具
✅ Md5Tool.vue - MD5 工具
✅ QRCodeTool.vue - 二维码工具
✅ BarcodeTool.vue - 条形码工具
✅ DiffTool.vue - 文本对比工具
✅ StringHexTool.vue - 字符串十六进制工具

共 **12 个工具组件** 完成迁移。

## 优势

1. **代码复用**：所有分栏逻辑集中在一个组件中
2. **维护性强**：修改分栏功能只需要修改 SplitPanel 组件
3. **更语义化**：使用 `#left` 和 `#right` slot 比 `#1` 和 `#2` 更直观
4. **功能统一**：所有工具都自动支持双击重置功能
5. **代码简洁**：每个工具组件减少约 10-15 行代码

## 技术细节

### 修复的问题
之前双击重置时会出现控制台错误：
```
Attempting to mutate prop 'size'. Props are readonly.
```

解决方案：使用 `v-model:size` 绑定响应式变量 `splitSize`，而不是直接修改 prop。

### Naive UI 组件
使用的是 Naive UI 的 `n-split` 组件，支持：
- 水平/垂直分栏
- 可拖拽调整大小
- 自定义拖拽触发器
- 最小/最大尺寸限制
