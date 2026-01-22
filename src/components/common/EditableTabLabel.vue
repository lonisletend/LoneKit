<template>
  <!-- 编辑模式 -->
  <n-input
    v-if="isEditing"
    ref="inputRef"
    v-model:value="editingName"
    size="small"
    style="width: 120px;"
    :status="validationStatus"
    @blur="finishEdit"
    @keyup.enter="finishEdit"
    @keyup.esc="cancelEdit"
    @input="handleInput"
    @click.stop
  />
  <!-- 显示模式 -->
  <span v-else @dblclick="startEdit" class="editable-tab-label">
    {{ tabName }}
  </span>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { NInput } from 'naive-ui';

const props = defineProps({
  tabName: {
    type: String,
    required: true
  },
  tabId: {
    type: [Number, String],
    required: true
  },
  allTabs: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update', 'editing-change']);

const isEditing = ref(false);
const editingName = ref('');
const inputRef = ref(null);
const hasError = ref(false);
const isCanceling = ref(false); // 标记是否正在取消

// 验证状态
const validationStatus = computed(() => {
  return hasError.value ? 'error' : undefined;
});

// 检查名称是否重复
function checkDuplicateName(name) {
  const trimmedName = name.trim();
  if (!trimmedName) return false;
  
  // 检查是否与其他tab重名（排除当前tab自己）
  return props.allTabs.some(tab => 
    tab.id !== props.tabId && tab.name === trimmedName
  );
}

// 处理输入变化
function handleInput() {
  hasError.value = checkDuplicateName(editingName.value);
}

// 开始编辑
async function startEdit() {
  isEditing.value = true;
  editingName.value = props.tabName;
  hasError.value = false;
  isCanceling.value = false; // 重置取消标志
  emit('editing-change', props.tabId, true);
  
  // 等待 DOM 更新后聚焦输入框并选中文本
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    inputRef.value.select();
  }
}

// 完成编辑
function finishEdit() {
  if (isEditing.value) {
    // 如果正在取消，则忽略保存操作
    if (isCanceling.value) {
      return;
    }
    
    const trimmedName = editingName.value.trim();
    
    // 检查是否有错误（重名）
    if (checkDuplicateName(trimmedName)) {
      hasError.value = true;
      return; // 阻止保存重名的标题
    }
    
    if (trimmedName && trimmedName !== props.tabName) {
      emit('update', props.tabId, trimmedName);
    }
    isEditing.value = false;
    hasError.value = false;
    emit('editing-change', props.tabId, false);
  }
}

// 取消编辑
function cancelEdit() {
  isCanceling.value = true; // 标记正在取消
  isEditing.value = false;
  editingName.value = props.tabName; // 还原为原始值
  hasError.value = false;
  emit('editing-change', props.tabId, false);
}

// 监听外部tabName变化，更新编辑值
watch(() => props.tabName, (newName) => {
  if (!isEditing.value) {
    editingName.value = newName;
  }
});
</script>

<style scoped>
.editable-tab-label {
  cursor: pointer;
  user-select: none;
  display: inline-block;
  padding: 2px 4px;
  transition: background-color 0.2s;
}

.editable-tab-label:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}
</style>
