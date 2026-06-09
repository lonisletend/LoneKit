# LoneKit

基于 Tauri 2 + Vue 3 的桌面/WEB开发者工具箱。

[English](README.en.md) | [示例网站](https://kit.lonestack.com)

## 项目简介

LoneKit 聚合了格式化、编码解码、二维码/条形码、文本对比、时间处理等常用能力，目标是把高频小工具集中到一个轻量、顺手的桌面应用里。使用一套好工具，每天节省 5 分钟。

- 当前版本：`0.9.14`
- 技术栈：`Tauri 2`、`Vue 3`、`Vite`、`Naive UI`、`Tailwind CSS`
- 运行形态：跨平台桌面应用（前端 + Tauri Rust 容器）

## 功能清单

当前路由中可用工具包括：

- 通用格式化（PlainText / JSON / XML 分段识别与格式化）
- JSON 格式化
- XML 格式化
- SQL 格式化
- 时间处理
- 文本对比
- 文件夹对比
- 文本计数
- 文本处理（本地脚本链式执行文本原子操作）
- UUID 生成/解析
- MD5
- Base64
- 字符串 Hex 转换
- 二维码生成
- 二维码识别
- 条形码生成
- 条形码识别
- Sendpay 展示与解释

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 9+
- Rust（仅在需要运行/构建 Tauri 桌面端时必需）

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

仅前端开发：

```bash
npm run dev
```

运行 Tauri 桌面应用开发模式：

```bash
npm run tauri dev
```

### 4. 构建

构建前端产物：

```bash
npm run build
```

预览前端构建结果：

```bash
npm run preview
```

构建桌面应用安装包（需要 Rust toolchain）：

```bash
npm run tauri build
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建前端 |
| `npm run preview` | 预览构建后的前端 |
| `npm run tauri <args>` | 透传 Tauri CLI 命令（例如 `npm run tauri dev`） |

## 项目结构

```text
.
├─ src/                     # Vue 前端
│  ├─ components/
│  │  ├─ tools/             # 工具组件（业务逻辑）
│  │  └─ wrapper/           # 多 Tab 包装层
│  ├─ composables/          # 通用逻辑（useCommon/useTabManager/useSplitPanel）
│  ├─ router/               # 路由配置（懒加载）
│  └─ utils/                # 纯工具函数
├─ src-tauri/               # Tauri/Rust 后端与打包配置
└─ lonekit-0.9.3/           # 示例构建产物（静态文件）
```

## 开发说明

- 新增工具建议遵循 `Tool + Wrapper` 的双层结构。
- 需要系统能力（剪贴板、Shell、升级等）时，优先复用现有 composable 逻辑。
- 新增重依赖时，建议同步检查 `vite.config.js` 的分包策略，避免主包膨胀。
