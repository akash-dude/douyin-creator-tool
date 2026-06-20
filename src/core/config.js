// src/core/config.js — 统一配置管理

const path = require('path')

const Config = {
  // 应用信息
  app: {
    name: 'douyin-creator-tool',
    version: '0.1.0',
    author: ''
  },

  // 路径
  paths: {
    data: path.join(__dirname, '..', '..', '.data'),
    profiles: path.join(__dirname, '..', '..', '.profiles'),
    oldProfile: path.join(__dirname, '..', '..', '.douyin-profile'),
    accountsFile: path.join(__dirname, '..', '..', '.data', 'accounts.enc'),
    storageFile: path.join(__dirname, '..', '..', '.data', 'storage.json')
  },

  // 浏览器
  chrome: {
    executablePath: process.env.CHROME_PATH || null, // 可通过环境变量覆盖
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    waitTimeout: 30000,
    loginTimeout: 120000
  },

  // AI 配置（通过环境变量或界面配置）
  ai: {
    provider: process.env.AI_PROVIDER || null,
    apiKey: process.env.AI_API_KEY || null,
    model: process.env.AI_MODEL || null
  },

  // 存储限制
  storage: {
    maxHistory: 200
  }
}

module.exports = { Config }
