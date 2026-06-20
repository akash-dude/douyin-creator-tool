// src/bridge/ipc.js — 桥接层：Core ↔ Electron IPC
// 将 CoreEngine 的方法注册为 Electron IPC handlers

const { ipcMain, app } = require('electron')
const { CoreEngine } = require('../core')

let engine = null

function getEngine () {
  if (!engine) {
    engine = new CoreEngine()
  }
  return engine
}

function setupIPC () {
  // === App ===
  ipcMain.handle('app:info', () => ({
    name: 'douyin-creator-tool',
    version: '0.1.0'
  }))

  // === 抖音核心能力 ===
  ipcMain.handle('douyin:login', async () => {
    const e = getEngine()
    await e.init()
    return e.login()
  })

  ipcMain.handle('douyin:fetch-video-info', async (_event, url) => {
    if (!url || (!url.includes('douyin.com') && !url.includes('iesdouyin.com'))) {
      throw new Error('请输入有效的抖音链接')
    }
    const e = getEngine()
    await e.init()
    return e.fetchVideoInfo(url)
  })

  ipcMain.handle('douyin:post-comment', async (_event, { url, text }) => {
    if (!url || !text) throw new Error('缺少必要参数')
    const e = getEngine()
    await e.init()
    return e.postComment(url, text)
  })

  // === AI ===
  ipcMain.handle('ai:generate', async (_event, { type, input }) => {
    const e = getEngine()
    await e.init()
    return e.generate(type, input)
  })

  // === 存储 ===
  ipcMain.handle('history:list', async () => {
    const e = getEngine()
    await e.init()
    return e.getHistory()
  })

  ipcMain.handle('history:add', async (_event, entry) => {
    const e = getEngine()
    await e.init()
    return e.addHistory(entry)
  })

  // === 清理 ===
  app.on('before-quit', async () => {
    if (engine) {
      await engine.destroy()
      engine = null
    }
  })
}

module.exports = { setupIPC, getEngine }
