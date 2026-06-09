import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  
  build: {
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // 仅保留核心运行时分包，工具页依赖交给动态导入边界处理，避免首屏预加载全量依赖。
        manualChunks: (id) => {
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-core';
          }

          if (id.includes('node_modules/vue-router/')) {
            return 'vue-router';
          }
        },
        
        // 用于从入口点创建的块的打包输出格式
        entryFileNames: 'assets/[name]-[hash].js',
        // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'assets/[name]-[hash].js',
        // 用于输出静态资源的命名
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}));
