import { ref, computed, defineComponent, h } from 'vue';

/**
 * 多标签管理的通用 composable
 * @param {Object} options 配置选项
 * @param {string} options.componentName - 组件名称前缀（如 'JsonFormatTool'）
 * @param {Component} options.component - 要渲染的组件
 * @param {string} options.tabNamePrefix - 标签名称前缀（如 'Json'）
 * @param {number} [options.maxTabs=10] - 最大标签数量
 * @returns {Object} 返回标签管理相关的响应式数据和方法
 */
export function useTabManager(options) {
  const {
    componentName,
    component,
    tabNamePrefix,
    maxTabs = 10
  } = options;

  // 初始化标签列表
  const tabs = ref([
    { id: 1, name: `${tabNamePrefix} 1` }
  ]);

  const activeTabName = ref(`${tabNamePrefix} 1`);

  // 跟踪需要被 keep-alive 缓存的组件名称
  const cachedComponents = ref([`${componentName}-1`]);

  // 记录当前正在编辑的tab ID
  const editingTabId = ref(null);

  // 为每个 tab 创建动态组件的缓存（不需要响应式）
  const componentCache = {};

  // 是否可以添加标签
  const addable = computed(() => {
    return {
      disabled: tabs.value.length >= maxTabs
    };
  });

  // 是否可以关闭标签
  const closable = computed(() => {
    return tabs.value.length > 1;
  });

  // 获取当前活动 tab 的 ID
  const activeTabId = computed(() => {
    const currentTab = tabs.value.find((tab) => tab.name === activeTabName.value);
    return currentTab ? currentTab.id : null;
  });

  // 获取当前活动 tab 的组件
  const currentComponent = computed(() => {
    const currentTab = tabs.value.find((tab) => tab.name === activeTabName.value);
    if (!currentTab) return null;

    const fullComponentName = `${componentName}-${currentTab.id}`;

    // 如果组件还没有创建，创建它
    if (!componentCache[fullComponentName]) {
      componentCache[fullComponentName] = defineComponent({
        name: fullComponentName,
        setup() {
          return () => h(component, { id: currentTab.id });
        }
      });
    }

    return componentCache[fullComponentName];
  });

  /**
   * 添加新标签
   */
  function handleAdd() {
    // 获取当前所有 tab 的最大 ID，然后 +1
    const ids = tabs.value.map((tab) => tab.id);
    const newId = Math.max(...ids) + 1;

    const newTab = {
      id: newId,
      name: `${tabNamePrefix} ${newId}`
    };
    tabs.value.push(newTab);

    // 将新组件添加到缓存列表
    const fullComponentName = `${componentName}-${newId}`;
    cachedComponents.value.push(fullComponentName);

    activeTabName.value = newTab.name;
  }

  /**
   * 关闭标签
   * @param {string} name - 要关闭的标签名称
   */
  function handleClose(name) {
    const nameIndex = tabs.value.findIndex((tab) => tab.name === name);
    if (!~nameIndex) return;

    const closedTab = tabs.value[nameIndex];
    const fullComponentName = `${componentName}-${closedTab.id}`;

    // 从缓存列表中移除，这将导致组件被销毁
    const cacheIndex = cachedComponents.value.indexOf(fullComponentName);
    if (cacheIndex > -1) {
      cachedComponents.value.splice(cacheIndex, 1);
    }

    // 从组件缓存中删除
    delete componentCache[fullComponentName];

    tabs.value.splice(nameIndex, 1);
    if (name === activeTabName.value) {
      activeTabName.value = tabs.value[Math.min(nameIndex, tabs.value.length - 1)].name;
    }
  }

  /**
   * 更新标签名称
   * @param {number} tabId - 标签 ID
   * @param {string} newName - 新的标签名称
   */
  function handleUpdateTab(tabId, newName) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (!tab) return;

    const oldName = tab.name;
    const trimmedName = newName.trim();
    
    // 如果名称为空或者未修改，则不更新
    if (!trimmedName || trimmedName === oldName) return;

    tab.name = trimmedName;
    
    // 如果当前激活的是被修改的标签，更新激活标签名称
    if (activeTabName.value === oldName) {
      activeTabName.value = trimmedName;
    }
  }

  /**
   * 处理编辑状态变化
   * @param {number} tabId - 标签 ID
   * @param {boolean} isEditing - 是否正在编辑
   */
  function handleEditingChange(tabId, isEditing) {
    editingTabId.value = isEditing ? tabId : null;
  }

  return {
    // 响应式数据
    tabs,
    activeTabName,
    activeTabId,
    cachedComponents,
    currentComponent,
    addable,
    closable,
    editingTabId,
    
    // 方法
    handleAdd,
    handleClose,
    handleUpdateTab,
    handleEditingChange
  };
}
