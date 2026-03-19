<script setup>
import { computed, h, ref } from 'vue';
import { NAlert, NButton, NCard, NIcon, NModal, NSelect, NTree } from 'naive-ui';
import { FolderOpen24Regular as FolderIcon } from '@vicons/fluent';
import { CodeDiff } from 'v-code-diff';
import SplitPanel from '../common/SplitPanel.vue';
import { useCommon } from '../../composables/useCommon';

defineOptions({
  name: 'FolderDiffTool'
});

const { notify } = useCommon();

const leftInputRef = ref(null);
const rightInputRef = ref(null);

const leftFolderName = ref('未选择目录');
const rightFolderName = ref('未选择目录');

const leftFilesMap = ref(new Map());
const rightFilesMap = ref(new Map());

const fileDiffMap = ref(new Map());
const dirMetaMap = ref(new Map());

const leftTreeData = ref([]);
const rightTreeData = ref([]);

const expandedDirKeys = ref([]);
const leftSelectedKeys = ref([]);
const rightSelectedKeys = ref([]);

const loading = ref(false);
const loadingText = ref('');

const modalVisible = ref(false);
const modalTitle = ref('');
const previewLoading = ref(false);
const previewType = ref('message');
const previewMessage = ref('');
const leftText = ref('');
const rightText = ref('');
const outputFormat = ref('side-by-side');

const outputFormatOptions = [
  { label: '并排（side-by-side）', value: 'side-by-side' },
  { label: '逐行（line-by-line）', value: 'line-by-line' }
];

const statusFilter = ref('all');
const hasComparedResult = ref(false);

const statusLabelMap = {
  'left-only': '仅左侧',
  'right-only': '仅右侧',
  modified: '变更',
  same: '相同'
};

const statusShortMap = {
  'left-only': 'L',
  'right-only': 'R',
  modified: 'M',
  same: 'S'
};

const stats = computed(() => {
  const base = {
    total: fileDiffMap.value.size,
    'left-only': 0,
    'right-only': 0,
    modified: 0,
    same: 0
  };

  fileDiffMap.value.forEach((entry) => {
    base[entry.status] += 1;
  });

  return base;
});

const hasLeftFolder = computed(() => leftFilesMap.value.size > 0);
const hasRightFolder = computed(() => rightFilesMap.value.size > 0);

const leftExpandedKeys = computed(() => {
  const keys = new Set();
  collectDirKeys(leftTreeData.value, keys);
  return expandedDirKeys.value.filter((key) => keys.has(key));
});

const rightExpandedKeys = computed(() => {
  const keys = new Set();
  collectDirKeys(rightTreeData.value, keys);
  return expandedDirKeys.value.filter((key) => keys.has(key));
});

function collectDirKeys(nodes, keySet) {
  nodes.forEach((node) => {
    if (node.nodeType === 'dir') {
      keySet.add(node.key);
    }
    if (node.children?.length) {
      collectDirKeys(node.children, keySet);
    }
  });
}

function normalizePath(path) {
  return path.replaceAll('\\\\', '/');
}

function trimRootPrefix(path) {
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  if (parts.length <= 1) {
    return normalized;
  }
  return parts.slice(1).join('/');
}

function getParentDirs(filePath) {
  const parts = filePath.split('/');
  const dirs = [];
  let current = '';

  for (let i = 0; i < parts.length - 1; i += 1) {
    current = current ? `${current}/${parts[i]}` : parts[i];
    dirs.push(current);
  }

  return dirs;
}

function splitPath(path) {
  const parts = path.split('/');
  return {
    name: parts[parts.length - 1],
    parent: parts.slice(0, -1).join('/')
  };
}

function sortTreeNodes(nodes) {
  nodes.sort((a, b) => {
    if (a.nodeType !== b.nodeType) {
      return a.nodeType === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  nodes.forEach((node) => {
    if (node.children?.length) {
      sortTreeNodes(node.children);
    }
  });
}

async function pickLeftFolder() {
  await pickFolder('left');
}

async function pickRightFolder() {
  await pickFolder('right');
}

async function pickFolder(side) {
  if ('showDirectoryPicker' in window) {
    await pickFolderWithFSAccess(side);
    return;
  }

  if (side === 'left') {
    leftInputRef.value?.click();
  } else {
    rightInputRef.value?.click();
  }
}

async function pickFolderWithFSAccess(side) {
  try {
    const handle = await window.showDirectoryPicker();

    const fileMap = new Map();
    await collectFilesFromDirectoryHandle(handle, '', fileMap);

    if (side === 'left') {
      leftFolderName.value = handle.name;
      leftFilesMap.value = fileMap;
    } else {
      rightFolderName.value = handle.name;
      rightFilesMap.value = fileMap;
    }

    handleFolderSelectionChange();
  } catch (error) {
    if (error?.name !== 'AbortError') {
      notify('error', `目录选择失败: ${error?.message || '未知错误'}`);
    }
  }
}

async function collectFilesFromDirectoryHandle(dirHandle, prefix, fileMap) {
  for await (const [name, handle] of dirHandle.entries()) {
    const relativePath = prefix ? `${prefix}/${name}` : name;

    if (handle.kind === 'directory') {
      await collectFilesFromDirectoryHandle(handle, relativePath, fileMap);
      continue;
    }

    const file = await handle.getFile();
    fileMap.set(relativePath, {
      path: relativePath,
      size: file.size,
      file
    });
  }
}

function onLeftInputChange(event) {
  handleFileInputChange(event, 'left');
}

function onRightInputChange(event) {
  handleFileInputChange(event, 'right');
}

function handleFileInputChange(event, side) {
  const files = Array.from(event.target?.files || []);

  if (!files.length) {
    return;
  }

  const map = new Map();
  let folderName = '已选择目录';

  files.forEach((file) => {
    const rawPath = file.webkitRelativePath || file.name;
    const normalized = normalizePath(rawPath);
    const parts = normalized.split('/');

    if (parts.length > 1) {
      folderName = parts[0];
    }

    const relativePath = trimRootPrefix(normalized);
    map.set(relativePath, {
      path: relativePath,
      size: file.size,
      file
    });
  });

  if (side === 'left') {
    leftFolderName.value = folderName;
    leftFilesMap.value = map;
  } else {
    rightFolderName.value = folderName;
    rightFilesMap.value = map;
  }

  event.target.value = '';
  handleFolderSelectionChange();
}

function handleFolderSelectionChange() {
  if (hasLeftFolder.value && hasRightFolder.value) {
    startCompare();
    return;
  }

  clearCompareResults();
  rebuildStandaloneTrees();
}

function clearCompareResults() {
  hasComparedResult.value = false;
  fileDiffMap.value = new Map();
  dirMetaMap.value = new Map();
  expandedDirKeys.value = [];
  leftSelectedKeys.value = [];
  rightSelectedKeys.value = [];
}

function buildStandaloneDirectoryMeta(side, sideMap) {
  const metaMap = new Map();

  sideMap.forEach((_, filePath) => {
    getParentDirs(filePath).forEach((dirPath) => {
      if (!metaMap.has(dirPath)) {
        metaMap.set(dirPath, {
          path: dirPath,
          left: false,
          right: false,
          status: 'same'
        });
      }

      const meta = metaMap.get(dirPath);
      if (side === 'left') {
        meta.left = true;
      } else {
        meta.right = true;
      }
    });
  });

  return metaMap;
}

function rebuildStandaloneTrees() {
  leftTreeData.value = hasLeftFolder.value
    ? buildTreeData(
      'left',
      leftFilesMap.value,
      new Map(),
      buildStandaloneDirectoryMeta('left', leftFilesMap.value),
      statusFilter.value
    )
    : [];
  rightTreeData.value = hasRightFolder.value
    ? buildTreeData(
      'right',
      rightFilesMap.value,
      new Map(),
      buildStandaloneDirectoryMeta('right', rightFilesMap.value),
      statusFilter.value
    )
    : [];
}

function rebuildComparedTrees() {
  leftTreeData.value = buildTreeData('left', leftFilesMap.value, fileDiffMap.value, dirMetaMap.value, statusFilter.value);
  rightTreeData.value = buildTreeData('right', rightFilesMap.value, fileDiffMap.value, dirMetaMap.value, statusFilter.value);
}

function rebuildTreesByMode() {
  if (hasComparedResult.value) {
    rebuildComparedTrees();
    return;
  }

  rebuildStandaloneTrees();
}

function handleLegendFilterClick(targetStatus) {
  statusFilter.value = statusFilter.value === targetStatus ? 'all' : targetStatus;
  expandedDirKeys.value = [];
  leftSelectedKeys.value = [];
  rightSelectedKeys.value = [];
  rebuildTreesByMode();
}

function buildHashHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(file) {
  if (!window.crypto?.subtle) {
    return `fallback-${file.size}-${file.lastModified}`;
  }

  const buffer = await file.arrayBuffer();
  const digest = await window.crypto.subtle.digest('SHA-256', buffer);
  return buildHashHex(digest);
}

async function startCompare() {
  if (!hasLeftFolder.value || !hasRightFolder.value) {
    return;
  }

  loading.value = true;
  loadingText.value = '正在比较目录内容，请稍候...';

  try {
    const compareMap = await buildFileDiffMap(leftFilesMap.value, rightFilesMap.value);
    const dirMap = buildDirectoryMeta(compareMap, leftFilesMap.value, rightFilesMap.value);

    fileDiffMap.value = compareMap;
    dirMetaMap.value = dirMap;
    hasComparedResult.value = true;
    rebuildComparedTrees();

    expandedDirKeys.value = [];
    leftSelectedKeys.value = [];
    rightSelectedKeys.value = [];

    notify('success', `目录比较完成，共 ${compareMap.size} 个文件项目`);
  } catch (error) {
    notify('error', `目录比较失败: ${error?.message || '未知错误'}`);
  } finally {
    loading.value = false;
    loadingText.value = '';
  }
}

async function buildFileDiffMap(leftMap, rightMap) {
  const allPaths = new Set([...leftMap.keys(), ...rightMap.keys()]);
  const compareMap = new Map();
  const needHash = [];

  allPaths.forEach((path) => {
    const leftItem = leftMap.get(path);
    const rightItem = rightMap.get(path);

    if (!leftItem) {
      compareMap.set(path, { path, status: 'right-only', leftItem: null, rightItem });
      return;
    }

    if (!rightItem) {
      compareMap.set(path, { path, status: 'left-only', leftItem, rightItem: null });
      return;
    }

    if (leftItem.size !== rightItem.size) {
      compareMap.set(path, { path, status: 'modified', leftItem, rightItem });
      return;
    }

    needHash.push({ path, leftItem, rightItem });
  });

  const results = await Promise.all(
    needHash.map(async ({ path, leftItem, rightItem }) => {
      const [leftHash, rightHash] = await Promise.all([sha256(leftItem.file), sha256(rightItem.file)]);
      return {
        path,
        status: leftHash === rightHash ? 'same' : 'modified',
        leftItem,
        rightItem
      };
    })
  );

  results.forEach((item) => {
    compareMap.set(item.path, item);
  });

  return compareMap;
}

function buildDirectoryMeta(compareMap, leftMap, rightMap) {
  const metaMap = new Map();
  const dirHasDiff = new Set();

  const ensureDirMeta = (dirPath) => {
    if (!metaMap.has(dirPath)) {
      metaMap.set(dirPath, {
        path: dirPath,
        left: false,
        right: false,
        status: 'same'
      });
    }
    return metaMap.get(dirPath);
  };

  leftMap.forEach((_, filePath) => {
    getParentDirs(filePath).forEach((dirPath) => {
      ensureDirMeta(dirPath).left = true;
    });
  });

  rightMap.forEach((_, filePath) => {
    getParentDirs(filePath).forEach((dirPath) => {
      ensureDirMeta(dirPath).right = true;
    });
  });

  // Mark all parent directories as changed if any descendant file is different.
  compareMap.forEach((item) => {
    if (item.status === 'same') {
      return;
    }
    getParentDirs(item.path).forEach((dirPath) => {
      dirHasDiff.add(dirPath);
    });
  });

  metaMap.forEach((meta, dirPath) => {
    if (!meta.left) {
      meta.status = 'right-only';
      return;
    }

    if (!meta.right) {
      meta.status = 'left-only';
      return;
    }

    meta.status = dirHasDiff.has(dirPath) ? 'modified' : 'same';
  });

  return metaMap;
}

function buildTreeData(side, sideFileMap, compareMap, directoryMap, filterStatus = 'all') {
  const roots = [];
  const dirNodeMap = new Map();

  const ensureDirNode = (dirPath) => {
    if (!dirPath) {
      return null;
    }

    if (dirNodeMap.has(dirPath)) {
      return dirNodeMap.get(dirPath);
    }

    const meta = directoryMap.get(dirPath);
    if (!meta) {
      return null;
    }

    if (side === 'left' && !meta.left) {
      return null;
    }

    if (side === 'right' && !meta.right) {
      return null;
    }

    const { name, parent } = splitPath(dirPath);
    const parentNode = ensureDirNode(parent);

    const node = {
      key: `d:${dirPath}`,
      path: dirPath,
      name,
      label: name,
      nodeType: 'dir',
      status: meta.status,
      children: []
    };

    dirNodeMap.set(dirPath, node);

    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }

    return node;
  };

  sideFileMap.forEach((_, filePath) => {
    const { name, parent } = splitPath(filePath);
    const parentNode = ensureDirNode(parent);
    const compare = compareMap.get(filePath);
    const fileStatus = compare?.status || 'same';

    if (filterStatus !== 'all' && fileStatus !== filterStatus) {
      return;
    }

    const fileNode = {
      key: `f:${filePath}`,
      path: filePath,
      name,
      label: name,
      nodeType: 'file',
      status: fileStatus,
      isLeaf: true
    };

    if (parentNode) {
      parentNode.children.push(fileNode);
    } else {
      roots.push(fileNode);
    }
  });

  const pruneEmptyDirs = (nodes) => nodes
    .map((node) => {
      if (node.nodeType !== 'dir') {
        return node;
      }

      const children = pruneEmptyDirs(node.children || []);
      if (!children.length) {
        return null;
      }

      return {
        ...node,
        children
      };
    })
    .filter(Boolean);

  const filteredRoots = pruneEmptyDirs(roots);

  sortTreeNodes(filteredRoots);
  return filteredRoots;
}

function clearSideFolder(side) {
  if (side === 'left') {
    leftFolderName.value = '未选择目录';
    leftFilesMap.value = new Map();
    leftTreeData.value = [];
    leftSelectedKeys.value = [];
  } else {
    rightFolderName.value = '未选择目录';
    rightFilesMap.value = new Map();
    rightTreeData.value = [];
    rightSelectedKeys.value = [];
  }

  expandedDirKeys.value = [];
  hasComparedResult.value = false;
  modalVisible.value = false;
  previewLoading.value = false;
  previewType.value = 'message';
  previewMessage.value = '';
  leftText.value = '';
  rightText.value = '';

  handleFolderSelectionChange();
}

function renderTreeLabel({ option }) {
  return h('div', { class: ['tree-node-label', `status-${option.status}`, `type-${option.nodeType}`] }, [
    h('span', { class: 'status-dot' }),
    h('span', { class: 'node-name' }, option.label),
    h('span', { class: 'node-status' }, statusShortMap[option.status])
  ]);
}

function handleExpandedUpdate(keys) {
  expandedDirKeys.value = Array.from(new Set(keys.filter((key) => key.startsWith('d:'))));
}

function handleLeftSelected(keys, option) {
  leftSelectedKeys.value = keys;
  handleFileSelection(option);
}

function handleRightSelected(keys, option) {
  rightSelectedKeys.value = keys;
  handleFileSelection(option);
}

function handleFileSelection(option) {
  const selected = Array.isArray(option) ? option[0] : option;
  if (!selected || selected.nodeType !== 'file') {
    return;
  }

  if (selected.status === 'same') {
    return;
  }

  openDiffModal(selected.path);
}

function isLikelyText(buffer) {
  const sample = new Uint8Array(buffer.slice(0, 2048));
  let nonPrintable = 0;

  for (let i = 0; i < sample.length; i += 1) {
    const value = sample[i];

    if (value === 0) {
      return false;
    }

    const isControl = value < 9 || (value > 13 && value < 32);
    if (isControl) {
      nonPrintable += 1;
    }
  }

  return sample.length === 0 || nonPrintable / sample.length < 0.1;
}

async function readTextIfPossible(file) {
  if (!file) {
    return {
      exists: false,
      isText: true,
      text: ''
    };
  }

  const buffer = await file.arrayBuffer();
  if (!isLikelyText(buffer)) {
    return {
      exists: true,
      isText: false,
      text: ''
    };
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  return {
    exists: true,
    isText: true,
    text: decoder.decode(buffer)
  };
}

async function openDiffModal(path) {
  const compare = fileDiffMap.value.get(path);
  if (!compare) {
    return;
  }

  modalVisible.value = true;
  modalTitle.value = `${path} [${statusLabelMap[compare.status]}]`;
  previewLoading.value = true;
  previewType.value = 'message';
  previewMessage.value = '';
  leftText.value = '';
  rightText.value = '';

  try {
    const [leftRead, rightRead] = await Promise.all([
      readTextIfPossible(compare.leftItem?.file),
      readTextIfPossible(compare.rightItem?.file)
    ]);

    if ((leftRead.exists && !leftRead.isText) || (rightRead.exists && !rightRead.isText)) {
      previewType.value = 'binary';
      previewMessage.value = '该文件是二进制或不可安全解码的文本，暂不展示内容级 diff。';
      return;
    }

    leftText.value = leftRead.text;
    rightText.value = rightRead.text;
    previewType.value = 'diff';
  } catch (error) {
    previewType.value = 'message';
    previewMessage.value = `读取文件失败: ${error?.message || '未知错误'}`;
  } finally {
    previewLoading.value = false;
  }
}
</script>

<template>
  <div class="w-full h-full p-2">
    <input
      ref="leftInputRef"
      type="file"
      webkitdirectory
      directory
      multiple
      class="hidden"
      @change="onLeftInputChange"
    >
    <input
      ref="rightInputRef"
      type="file"
      webkitdirectory
      directory
      multiple
      class="hidden"
      @change="onRightInputChange"
    >

    <div class="h-full flex flex-col space-y-2">
      <div class="w-full h-7 flex items-center space-x-2 text-xs">
        <span
          class="legend-item status-total"
          :class="{ active: statusFilter === 'all' }"
          @click="handleLegendFilterClick('all')"
        ><i class="legend-dot"></i>总数 {{ stats.total }}</span>
        <span
          class="legend-item status-left-only"
          :class="{ active: statusFilter === 'left-only' }"
          @click="handleLegendFilterClick('left-only')"
        ><i class="legend-dot"></i>仅左侧 {{ stats['left-only'] }}</span>
        <span
          class="legend-item status-right-only"
          :class="{ active: statusFilter === 'right-only' }"
          @click="handleLegendFilterClick('right-only')"
        ><i class="legend-dot"></i>仅右侧 {{ stats['right-only'] }}</span>
        <span
          class="legend-item status-modified"
          :class="{ active: statusFilter === 'modified' }"
          @click="handleLegendFilterClick('modified')"
        ><i class="legend-dot"></i>变更 {{ stats.modified }}</span>
        <span
          class="legend-item status-same"
          :class="{ active: statusFilter === 'same' }"
          @click="handleLegendFilterClick('same')"
        ><i class="legend-dot"></i>相同 {{ stats.same }}</span>
      </div>

      <n-alert v-if="loading" type="info" :show-icon="false">
        {{ loadingText }}
      </n-alert>

      <div class="flex-1 min-h-0">
        <SplitPanel>
          <template #left>
            <div class="h-full p-2 flex flex-col border border-gray-200 rounded bg-white">
              <div class="tree-header pb-2">
                <n-button v-if="!hasLeftFolder" type="warning" dashed size="small" circle title="选择左侧目录" @click="pickLeftFolder">
                  <template #icon>
                    <n-icon>
                      <FolderIcon />
                    </n-icon>
                  </template>
                </n-button>
                <template v-else>
                  <span class="tree-title" :title="leftFolderName">{{ leftFolderName }}</span>
                  <n-button quaternary size="small" @click="clearSideFolder('left')">X</n-button>
                </template>
              </div>
              <div class="tree-body">
                <n-tree
                  v-if="leftTreeData.length"
                  block-line
                  block-node
                  selectable
                  :data="leftTreeData"
                  :expanded-keys="leftExpandedKeys"
                  :selected-keys="leftSelectedKeys"
                  :render-label="renderTreeLabel"
                  @update:expanded-keys="handleExpandedUpdate"
                  @update:selected-keys="handleLeftSelected"
                />
                <div v-else class="empty-tip">请选择目录</div>
              </div>
            </div>
          </template>

          <template #right>
            <div class="h-full p-2 flex flex-col border border-gray-200 rounded bg-white">
              <div class="tree-header pb-2">
                <n-button v-if="!hasRightFolder" type="primary" dashed size="small" circle title="选择右侧目录" @click="pickRightFolder">
                  <template #icon>
                    <n-icon>
                      <FolderIcon />
                    </n-icon>
                  </template>
                </n-button>
                <template v-else>
                  <span class="tree-title" :title="rightFolderName">{{ rightFolderName }}</span>
                  <n-button quaternary size="small" @click="clearSideFolder('right')">X</n-button>
                </template>
              </div>
              <div class="tree-body">
                <n-tree
                  v-if="rightTreeData.length"
                  block-line
                  block-node
                  selectable
                  :data="rightTreeData"
                  :expanded-keys="rightExpandedKeys"
                  :selected-keys="rightSelectedKeys"
                  :render-label="renderTreeLabel"
                  @update:expanded-keys="handleExpandedUpdate"
                  @update:selected-keys="handleRightSelected"
                />
                <div v-else class="empty-tip">请选择目录</div>
              </div>
            </div>
          </template>
        </SplitPanel>
      </div>
    </div>

    <n-modal v-model:show="modalVisible" :mask-closable="true">
      <n-card
        class="diff-modal"
        :title="modalTitle"
        size="small"
        closable
        @close="modalVisible = false"
      >
        <div class="w-full h-full flex flex-col space-y-2">
          <div class="w-full h-8 flex items-center justify-end">
            <n-select
              v-model:value="outputFormat"
              :options="outputFormatOptions"
              :style="{ width: '220px' }"
              :disabled="previewType !== 'diff'"
            />
          </div>

          <div class="flex-1 min-h-0 overflow-auto diff-preview-area">
            <div v-if="previewLoading" class="text-sm text-gray-500">正在读取文件内容...</div>
            <n-alert v-else-if="previewType !== 'diff'" type="info" :show-icon="false">
              {{ previewMessage || '当前文件无法展示内容对比。' }}
            </n-alert>
            <CodeDiff
              v-else
              :old-string="leftText"
              :new-string="rightText"
              :output-format="outputFormat"
            />
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>

.tree-header {
  flex: 0 0 auto;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
}

.tree-title {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-top: 8px;
}

.empty-tip {
  color: #6b7280;
  font-size: 13px;
  margin-top: 8px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}

.legend-item:hover {
  border-color: #9ca3af;
}

.legend-item.active {
  border-color: #111827;
  box-shadow: inset 0 0 0 1px #111827;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.legend-item.status-total .legend-dot {
  background: #6b7280;
}

:deep(.tree-node-label) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

:deep(.tree-node-label .status-dot) {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex: 0 0 auto;
}

:deep(.tree-node-label .node-name) {
  white-space: nowrap;
}

:deep(.tree-node-label .node-status) {
  margin-left: auto;
  font-size: 10px;
  padding: 0 4px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  color: #374151;
}

:deep(.type-dir .node-name) {
  font-weight: 600;
}

:deep(.status-left-only .status-dot),
.legend-item.status-left-only .legend-dot {
  background: #f59e0b;
}

:deep(.status-right-only .status-dot),
.legend-item.status-right-only .legend-dot {
  background: #3b82f6;
}

:deep(.status-modified .status-dot),
.legend-item.status-modified .legend-dot {
  background: #ef4444;
}

:deep(.status-same .status-dot),
.legend-item.status-same .legend-dot {
  background: #10b981;
}

:deep(.status-left-only .node-name) {
  color: #b45309;
}

:deep(.status-right-only .node-name) {
  color: #1d4ed8;
}

:deep(.status-modified .node-name) {
  color: #b91c1c;
}

:deep(.status-same .node-name) {
  color: #065f46;
}

.diff-modal {
  width: min(1200px, 95vw);
  height: min(760px, 90vh);
}

.diff-preview-area :deep(.blob-code-inner),
.diff-preview-area :deep(.file-header) {
  font-family: Monaco, Consolas, 'Courier New', monospace !important;
  font-size: 13px !important;
  line-height: 1.45 !important;
}

.diff-preview-area :deep(.code-diff-view) {
  width: 100% !important;
}
</style>
