// src/bridge/ipc.js — 桥接层：Core ↔ Electron IPC

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

  // ======== 账号管理 ========
  ipcMain.handle('accounts:list', async () => {
    const e = getEngine()
    await e.init()
    return e.getAccounts()
  })

  ipcMain.handle('accounts:add', async (_event, { name, username }) => {
    const e = getEngine()
    await e.init()
    return e.addAccount({ name, username })
  })

  // 添加账号 + 自动登录
  ipcMain.handle('accounts:add-and-login', async (_event, { name }) => {
    const e = getEngine()
    await e.init()
    const account = e.addAccount({ name })
    await e.switchAccount(account.id)
    await e.login()
    return e.getAccounts().find(a => a.id === account.id)
  })

  ipcMain.handle('accounts:remove', async (_event, id) => {
    const e = getEngine()
    await e.init()
    e.removeAccount(id)
    return { ok: true }
  })

  ipcMain.handle('accounts:switch', async (_event, id) => {
    const e = getEngine()
    await e.init()
    const account = e.switchAccount(id)
    return account || { ok: false }
  })

  ipcMain.handle('accounts:clear', async () => {
    const e = getEngine()
    await e.init()
    e.clearAccounts()
    return { ok: true }
  })

  // ======== 抖音自动化 ========
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

  ipcMain.handle('douyin:publish-video', async (_event, params) => {
    if (!params || !params.filePath) throw new Error('请选择视频文件')
    const e = getEngine()
    await e.init()
    return e.publishVideo(params)
  })

  // ======== AI ========
  ipcMain.handle('ai:generate', async (_event, { type, input }) => {
    const e = getEngine()
    await e.init()
    return e.generate(type, input)
  })

  // ======== 历史记录 ========
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

  // ======== 清理 ========
  app.on('before-quit', async () => {
    if (engine) {
      await engine.destroy()
      engine = null
    }
  })
}

module.exports = { setupIPC, getEngine }
