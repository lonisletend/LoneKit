import { useNotification } from "naive-ui";
import { writeText, readText } from "@tauri-apps/plugin-clipboard-manager";

/**
 * 通用工具 Composable
 * 提供通知、复制和剪贴板读取功能的统一封装
 */
export function useCommon() {
  const notification = useNotification();

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
   * @param {string} successMessage - 成功提示消息，默认为 '复制成功'
   * @param {string} errorMessage - 失败提示消息，默认为 '复制失败'
   */
  async function copyToClipboard(text, successMessage = '复制成功', errorMessage = '复制失败') {
    if (!text) {
      notify('warning', '没有可复制的内容');
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

      notify('error', '无法访问剪贴板');
      return null;
    } catch (error) {
      console.error('读取剪贴板失败:', error);
      notify('error', '读取剪贴板失败');
      return null;
    }
  }

  return {
    notify,
    copyToClipboard,
    readClipboard,
    readFromClipboard: readClipboard  // 别名，避免函数名冲突
  };
}
