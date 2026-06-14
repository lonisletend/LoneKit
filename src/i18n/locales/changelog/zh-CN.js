export default [
  {
    date: '2026.06.14',
    version: 'v1.0.0',
    added: [
      '新增关于弹窗，集中展示应用 Logo、版本信息、项目说明与 GitHub Issue 反馈入口。',
      '新增支持项目页面，说明项目维护方式与赞助原则，并提供 Token、微信支付、支付宝支付三种支持方式。',
      '新增致谢页面，记录项目从 v0.0.1 走向 v1.0.0 过程中的特别感谢与赞助感谢。',
    ],
    optimized: [
      '赞助二维码改为本地资源打包，避免依赖外部图片链接，提升桌面端离线与弱网展示稳定性。',
      '侧边栏底部按钮支持换行排列，避免新增关于入口后在窄侧栏下溢出。',
    ],
  },
  {
    date: '2026.06.09',
    version: 'v0.9.14',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.14',
    optimized: [
      '优化浏览器 favicon 与 Tauri 桌面应用图标样式，提升多平台图标显示效果。',
    ],
  },
  {
    date: '2026.06.09',
    version: 'v0.9.13',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.13',
    optimized: [
      '更新浏览器 favicon 与 Tauri 桌面应用图标，并补齐 favicon、Apple Touch Icon 与 Web App Manifest 引用。',
      '移除默认 Vite/Tauri 示例图标资源，统一应用品牌图标展示。',
    ],
  },
  {
    date: '2026.06.09',
    version: 'v0.9.12',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.12',
    optimized: [
      'GitHub Actions 发布流程改为自动读取当前版本的中英文更新日志，并写入 GitHub Release 与 latest.json notes，保证自动更新弹窗展示真实版本说明。',
    ],
    fixed: [
      '修复 Tauri 桌面端未注册 OS 插件导致 macOS 自动更新能力检测失败、更新按钮退化为手动下载的问题。',
    ],
  },
  {
    date: '2026.06.09',
    version: 'v0.9.11',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.11',
    added: [
      'SQL 格式化与文本处理工具新增「发送到文本对比」，方便将格式化或处理后的文本直接送入文本对比工具。',
      '文本处理工具新增替换类操作，支持普通替换与正则替换，可加入文本处理流水线组合使用。',
    ],
    optimized: [
      '升级 lone-format 到 0.16.1，跟进格式化组件最新行为。',
      '更新自动更新地址为 GitHub Release latest.json，并补齐更新安装完成后的应用重启支持。',
      'macOS 发布包改回 universal 构建，规避原生 aarch64 包签名异常导致的安装后无法打开问题，提升 Apple Silicon 设备安装可靠性。',
      'Tauri 桌面端读写文本剪贴板时优先使用原生 clipboard manager API，避免 macOS WebKit 额外弹出 Paste 确认浮层。',
    ],
    fixed: [
      '修复 package-lock 中旧版 npm tarball 地址导致 GitHub Actions npm install 失败的问题。',
    ],
  },
  {
    date: '2026.06.05',
    version: 'v0.9.10',
    optimized: [
      '优化前端构建分包策略，减少首屏预加载的大型依赖，提升首页打开速度。',
      '语言包改为按需加载，启动时只加载当前语言，切换语言时再加载目标语言。',
      'JSON/XML/通用格式化等高频工具在首页加载完成后按空闲时间预加载，降低首次打开工具的等待感。',
      '整理工具页依赖加载边界，条形码组件改为局部加载，Excel 导出依赖继续保持操作时按需加载。',
    ],
  },
  {
    date: '2026.06.04',
    version: 'v0.9.9',
    added: [
      '新增文本处理工具，支持左右布局输入/输出，通过本地脚本链式执行文本原子操作。',
      '文本处理脚本支持整体处理、行级处理、连接与拆分三类原子操作，包括前后缀、行编号、去空行、行排序、行去重、行连接、拆行、空格压缩等。',
      '文本处理脚本配置支持本地保存、多操作编排、两级级联选择原子操作，以及脚本折叠/展开与折叠全部/展开全部。',
    ],
  },
  {
    date: '2026.06.03',
    version: 'v0.9.8',
    added: [
      '新增双语 i18n 支持，界面文案与更新日志支持中文/英文切换。',
      '工具示例数据改为本地化配置，中文/英文环境展示对应示例。',
    ],
    optimized: [
      '补充表面主题变量与 Naive UI 覆盖样式，统一浅色/深色模式下的组件视觉。',
      '优化国际化布局响应式表现，改善窄屏和多语言文案下的工具页面展示。',
    ],
  },
  {
    date: '2026.06.02',
    version: 'v0.9.7',
    added: [
      '新增深色模式支持，light/dark/auto 切换。',
      'SQL 格式化新增 dialect 选择器，支持 BigQuery、ClickHouse、MySQL、PostgreSQL、SQLite、Snowflake 等多种方言，并记住上次选择。',
      '通用格式化工具新增「发送到文本对比」，可将格式化后的完整内容一键发送到文本对比工具。',
      '时间处理工具新增时间间隔计算、时间推移计算功能。',
    ],
    optimized: [
      '时间戳转换支持更多常见输入格式，包括斜杠/点分日期、紧凑数字日期时间、ISO 日期时间、秒/毫秒时间戳等，并支持多示例循环展示。',
      'UUID 工具进入页面后按默认配置自动生成 UUID，减少首次使用操作。',
      '二维码识别、条形码识别、文件夹对比等工具优化浅色/深色模式下的展示细节。',
      '统一浅色/深色模式下输入框、选择器、结果展示区域、占位区域的边框、圆角、背景与聚焦样式。',
      '文本对比工具优化结果区高度适配，并将并排/逐行模式切换改为图标按钮。',
      '时间处理工具优化间隔/推移输入框对齐，并为时间戳转换增加剪贴板读取。',
      '升级 lone-format 到 0.16.0，跟进格式化组件能力。',
    ],
    fixed: [
      '修复二维码、条形码识别结果展示区域顶部预留空白过大的问题。',
      '修复时间戳转换中清空秒/毫秒时间戳输入时的边界问题。',
    ],
  },
  {
    date: '2026.06.01',
    version: 'v0.9.6',
    added: [
      '新增侧边栏菜单收藏功能，收藏项置顶，本地存储，终于可以根据个人常用项排序喽。🎉',
      '新增工具间数据传递功能，JSON/XML 格式化结果支持一键发送到文本对比。',
    ],
  },
  {
    date: '2026.05.21',
    version: 'v0.9.5',
    fixed: [
      '升级 lone-format 到 0.13.0，优化了SQL格式化展示，修复了关键字识别，折叠展开等问题。',
    ],
  },
  {
    date: '2026.05.17',
    version: 'v0.9.4',
    added: [
      '新增 Unicode 工具，支持 Unicode 编码/解码、批量输入、剪贴板读取与逐项操作。',
      'MD5、Base64、Unicode、字符串16进制工具新增快捷键：在非批量模式下按 Ctrl/Cmd + Enter 可快速跳转到下一输入框。',
    ],
    optimized: [
      '统一规范工具路由 URL，采用更简短命名，并保留旧路由别名兼容访问。',
    ],
  },
  {
    date: '2026.05.07',
    version: 'v0.9.3',
    fixed: [
      '通用格式化工具，修复同名标签嵌套时 XML 片段识别错误的问题，解析引擎从正则匹配升级为深度追踪算法。',
      'Sendpay 工具，修复了 sendpayMap 展示不能编辑的问题。',
      '升级 lone-format 到 0.12.1，修复了 XML 格式化同级多个重名标签自闭合标签识别有问题的情况。',
    ],
  },
  {
    date: '2026.04.28',
    version: 'v0.9.2',
    added: [
      'Sendpay 工具新增 sendpayMap 解析支持，支持与 sendpay 同时输入并联合匹配解释。',
      'Sendpay 匹配解释区新增「所有解释」模式，未匹配项支持红色高亮与展开查看。',
      'Sendpay 匹配解释支持「展开全部/折叠全部」，并支持解释文本中的 \\n 自动换行展示。',
      'Sendpay 解释配置支持配置文件固定标题，方便复用。',
    ],
  },
  {
    date: '2026.04.21',
    version: 'v0.9.1',
    optimized: [
      'Sendpay 工具，优化编辑体验，增加同标位匹配对比展示。',
      '优化打包配置，大幅减小js包体积，提升启动性能。',
    ],
  },
  {
    date: '2026.04.21',
    version: 'v0.9.0',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.9.0',
    added: [
      '新增条形码识别工具，支持上传、粘贴、拖拽图片识别多种条形码格式，并显示识别到的格式标签。',
      '条形码生成工具新增格式选择器，支持 CODE128、CODE39、EAN13、EAN8、UPC、ITF14、MSI、Pharmacode、Codabar 共 9 种格式。',
      '新增 Sendpay 展示工具，支持展示、修改、解释配置匹配等。一定是你用过最好用的 Sendpay 展示工具！',
    ],
    optimized: [
      '侧边栏二维码识别、条形码识别、文本计数图标更换为 Fluent 图标库，统一视觉风格。',
      '二维码识别、条形码识别工具操作按钮从右上角移至右下角，提升交互一致性。',
    ],
  },
  {
    date: '2026.04.15',
    version: 'v0.8.2',
    added: [
      '条形码生成工具、二维码生成工具，结果列表支持单项复制图片到剪贴板。',
      '条形码生成工具、二维码生成工具，新增「导出 Excel」功能，导出包含文本与对应图片的 Excel 文件。',
    ],
  },
  {
    date: '2026.04.02',
    version: 'v0.8.1',
    added: [
      '时间戳转换工具升级为多 Tab 模式，支持同屏并行处理多组时间任务。',
      '时间工具新增「时间间隔计算」与「时间推移计算」两大功能块，支持开始/结束时间差值、方向推移计算与一键复制。',
    ],
  },
  {
    date: '2026.03.25',
    version: 'v0.8.0',
    added: [
      '二维码生成与条形码生成工具重构为多输入卡片模式，支持末尾自动补空、逐项删除、左右滚动同步与尺寸自适配。',
      'MD5、Base64、字符串16进制工具重构为统一双栏卡片布局，支持逐项操作按钮与批量复制。',
    ],
    optimized: [
      '统一多个工具页的交互风格与样式细节，降低重复代码并提升维护性。',
    ],
    fixed: [
      '修复侧边菜单路由激活逻辑，页面切换时菜单高亮与当前路由保持一致。直接访问工具页面时，侧边菜单正确高亮对应项。',
    ],
  },
  {
    date: '2026.03.24',
    version: 'v0.7.3',
    added: [
      '新增文本计数工具，支持字符数、单词数、行数、段落数、UTF-8 字节数、阅读时长统计。',
    ],
  },
  {
    date: '2026.03.23',
    version: 'v0.7.2',
    added: [
      '新增文件夹对比工具，支持左右目录双树对照、差异状态标记与文件内容对比预览。',
    ],
  },
  {
    date: '2026.03.10',
    version: 'v0.7.1',
    added: [
      '新增 UUID 工具，支持 v4 生成与解析。',
    ],
  },
  {
    date: '2026.01.25',
    version: 'v0.7.0',
    releaseLink: 'https://github.com/lonisletend/LoneKit/releases/tag/app-v0.7.0',
    added: [
      '通用格式化工具，渲染区域新增「折叠全部」、「展开全部」功能。JSON/XML 块支持排序。',
      'XML 格式化工具，新增「排序」功能。',
      'Tauri 升级到 v2，打包增加对 Apple Silicon 支持，增加 RPM 格式支持。增加版本检查和自动升级功能。',
    ],
    optimized: [
      '优化若干样式细节。升级依赖版本。',
    ],
  },
  {
    date: '2026.01.21',
    version: 'v0.6.3',
    optimized: [
      '通用格式化工具，优化展示区域字体和样式。',
      '文本对比工具，优化对比展示字体和样式。支持选择并排/逐行对比模式。'
    ],
  },
  {
    date: '2026.01.20',
    version: 'v0.6.2',
    added: [
      '新增通用格式化工具，支持包含 PlainText/JSON/XML 的文本分段格式化。日志分析利器！🎉'
    ],
    optimized: [
      '优化多个工具的展示样式细节。更新依赖版本。'
    ],
  },
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
];
