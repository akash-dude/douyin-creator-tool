# 🎬 抖音创作辅助工具

> Electron + Puppeteer 多账号自动化工具

## 功能

| 模块 | 功能 |
|------|------|
| 🔍 视频分析 | 粘贴链接，自动提取标题/文案 |
| 💬 发表评论 | 选择账号，自动发弹幕 |
| ✍️ 文案生成 | AI 辅助（待接入 API） |
| 👤 账号管理 | 多账号隔离，加密存储 |
| 📤 发表作品 | 视频/图文上传发布 |

## 架构

```
src/
├── core/      核心引擎（纯 Node.js，可独立运行）
│   ├── index.js    入口 + CLI
│   ├── config.js   统一配置
│   ├── douyin.js   抖音自动化 (Puppeteer)
│   ├── account.js  多账号管理 (AES-256-GCM 加密)
│   ├── storage.js  本地持久化存储
│   └── ai.js       AI 生成（占位）
├── ui/        前端界面（Electron 渲染进程）
│   ├── components/  7 个组件
│   └── renderer.js  App 控制器
└── bridge/    Core ↔ Electron IPC
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
npm start
```

## 独立 CLI

```bash
node src/core/index.js login              # 登录抖音
node src/core/index.js accounts            # 列出账号
node src/core/index.js analyze <url>       # 分析视频
node src/core/index.js comment <url> <txt> # 发评论
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `CHROME_PATH` | 自定义 Chrome 路径 |
| `AI_PROVIDER` | AI 提供商 |
| `AI_API_KEY`  | AI API 密钥 |
| `AI_MODEL`    | AI 模型 |

## 安全性

- 账号 Cookie 隔离在 `.profiles/account_{id}/`
- 元数据 AES-256-GCM 加密存储在 `.data/accounts.enc`
- 加密密钥基于设备指纹派生
- `.data/` 和 `.profiles/` 在 `.gitignore` 中排除

## 技术栈

- **Electron** ^42.3.3 — 桌面壳
- **Puppeteer Core** ^25.1.0 — 浏览器自动化
- **Node.js** 内置 `crypto` — AES-256-GCM 加密
