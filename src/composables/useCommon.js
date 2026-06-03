import { useNotification } from "naive-ui";
import { useI18n } from "vue-i18n";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

/**
 * 通用工具 Composable
 * 提供通知、复制和剪贴板读取功能的统一封装
 */
export function useCommon() {
  const notification = useNotification();
  const { t, locale } = useI18n();

  /**
   * 显示通知消息
   * @param {string} type - 通知类型: 'success' | 'error' | 'warning' | 'info'
   * @param {string} message - 通知内容
   * @param {number} duration - 显示时长，默认 2500ms
   */
  function notify(type, message, duration = 2500) {
    notification[type]({
      content: message,
      duration,
      keepAliveOnHover: true
    });
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本内容
   * @param {string} successMessage - 成功提示消息，默认使用当前语言
   * @param {string} errorMessage - 失败提示消息，默认使用当前语言
   */
  async function copyToClipboard(text, successMessage = t('common.copied'), errorMessage = t('common.copyFailed')) {
    if (!text) {
      notify('warning', t('common.noCopyableContent'));
      return false;
    }

    try {
      // 优先使用 Web Clipboard API
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        notify('success', successMessage);
        return true;
      }
      
      // Tauri 环境下使用 Tauri API
      if (window.__TAURI_IPC__) {
        await writeText(text.toString());
        notify('success', successMessage);
        return true;
      }

      notify('error', errorMessage);
      return false;
    } catch (error) {
      console.error('复制失败:', error);
      notify('error', errorMessage);
      return false;
    }
  }

  /**
   * 从剪贴板读取文本
   * @returns {Promise<string|null>} 剪贴板中的文本内容，失败时返回 null
   */
  async function readClipboard() {
    try {
      // 优先使用 Web Clipboard API
      if (navigator && navigator.clipboard) {
        return await navigator.clipboard.readText();
      }
      
      // Tauri 环境下使用 Tauri API
      if (window.__TAURI_IPC__) {
        return await readText();
      }

      notify('error', t('common.clipboardUnavailable'));
      return null;
    } catch (error) {
      console.error('读取剪贴板失败:', error);
      notify('error', t('common.readClipboardFailed'));
      return null;
    }
  }

  /**
   * 复制指定容器内的 canvas 元素为图片到剪贴板
   * @param {string} containerId - 包含 canvas 的容器元素 ID
   * @param {string} successMessage - 成功提示消息
   * @param {string} errorMessage - 失败提示消息
   */
  async function copyCanvasImage(containerId, successMessage = t('common.imageCopied'), errorMessage = t('common.copyFailed')) {
    const container = document.getElementById(containerId);
    if (!container) {
      notify('warning', t('common.noCopyableContent'));
      return false;
    }
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      notify('warning', t('common.noCopyableContent'));
      return false;
    }
    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });
      if (!blob) {
        notify('error', t('common.imageBuildFailed'));
        return false;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      notify('success', successMessage);
      return true;
    } catch (e) {
      console.error('复制图片到剪贴板失败:', e);
      notify('error', errorMessage);
      return false;
    }
  }

  /**
   * 将包含 canvas 图片的条目列表导出为 Excel 文件
   * @param {Array<{id: string, content: string}>} items - 条目列表，每项包含 id 和 content
   * @param {string} containerIdPrefix - 容器 ID 前缀，与 entry.id 拼接查找 canvas
   * @param {object} options - 可选配置
   * @param {string} options.sheetName - 工作表名称，默认使用当前语言
   * @param {string} options.textHeader - 文本列表头，默认使用当前语言
   * @param {string} options.imageHeader - 图片列表头，默认使用当前语言
   * @param {string} options.filePrefix - 文件名前缀，默认使用当前语言
   */
  async function exportCanvasToExcel(items, containerIdPrefix, options = {}) {
    const {
      sheetName = t('common.exportData'),
      textHeader = t('common.text'),
      imageHeader = t('common.image'),
      filePrefix = t('common.export')
    } = options;
    if (!items || items.length === 0) {
      notify('warning', t('common.noExportableContent'));
      return;
    }

    try {
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(sheetName);

      sheet.columns = [
        { header: textHeader, key: 'text', width: 40 },
        { header: imageHeader, key: 'image', width: 50 },
      ];
      sheet.getRow(1).font = { bold: true };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const container = document.getElementById(`${containerIdPrefix}${item.id}`);
        const canvas = container?.querySelector('canvas');
        if (!canvas) continue;

        const rowIndex = i + 2;
        const row = sheet.getRow(rowIndex);
        row.getCell(1).value = item.content;

        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        const imageId = workbook.addImage({ base64, extension: 'png' });

        const imgHeight = canvas.height;
        const imgWidth = canvas.width;
        const rowHeight = Math.max(60, Math.round(imgHeight * 0.75));
        row.height = rowHeight;

        sheet.addImage(imageId, {
          tl: { col: 1, row: rowIndex - 1 },
          ext: { width: imgWidth, height: imgHeight },
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toLocaleString(locale.value, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/[\/:\s,]/g, '');
      a.download = `${filePrefix}_${ts}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      notify('success', t('common.exportSuccess'));
    } catch (e) {
      console.error('导出 Excel 失败:', e);
      notify('error', t('common.exportFailed'));
    }
  }

  return {
    notify,
    copyToClipboard,
    copyCanvasImage,
    exportCanvasToExcel,
    readClipboard,
    readFromClipboard: readClipboard  // 别名，避免函数名冲突
  };
}
