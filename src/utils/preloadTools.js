const PRELOAD_BATCH_INTERVAL = 900;
const PRELOAD_ITEM_INTERVAL = 160;
const PRELOAD_IDLE_TIMEOUT = 1200;

let started = false;

const preloadBatches = [
  [
    () => import('/src/components/wrapper/CommonFormatWrapper.vue'),
    () => import('/src/components/wrapper/JsonFormatWrapper.vue'),
    () => import('/src/components/wrapper/XmlFormatWrapper.vue'),
  ],
  [
    () => import('/src/components/wrapper/DiffToolWrapper.vue'),
    () => import('/src/components/wrapper/TextProcessToolWrapper.vue'),
    () => import('/src/components/wrapper/SendpayDisplayWrapper.vue'),
    () => import('/src/components/wrapper/TimeToolWrapper.vue'),
    () => import('/src/components/tools/Base64Tool.vue'),
    () => import('/src/components/tools/UUIDTool.vue'),
    () => import('/src/components/tools/Md5Tool.vue'),
    () => import('/src/components/tools/UnicodeTool.vue'),
  ],
  [
    () => import('/src/components/wrapper/TextCountToolWrapper.vue'),
    () => import('/src/components/tools/StringHexTool.vue'),
    () => import('/src/components/tools/QRCodeTool.vue'),
    () => import('/src/components/tools/QRCodeReaderTool.vue'),
    () => import('/src/components/tools/BarcodeTool.vue'),
    () => import('/src/components/tools/BarcodeReaderTool.vue'),
    () => import('/src/components/wrapper/SQLFormatWrapper.vue'),
    () => import('/src/components/wrapper/FolderDiffToolWrapper.vue'),
  ],
];

function runWhenIdle(task, timeout = PRELOAD_IDLE_TIMEOUT) {
  if (typeof window === 'undefined') {
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout });
    return;
  }

  window.setTimeout(task, timeout);
}

function preloadBatch(batch) {
  batch.forEach((preload, index) => {
    window.setTimeout(() => {
      runWhenIdle(() => {
        preload().catch(() => {});
      });
    }, index * PRELOAD_ITEM_INTERVAL);
  });
}

export function preloadToolsAfterHomeReady() {
  if (started || typeof window === 'undefined') {
    return;
  }

  started = true;
  preloadBatches.forEach((batch, index) => {
    window.setTimeout(() => {
      preloadBatch(batch);
    }, index * PRELOAD_BATCH_INTERVAL);
  });
}
