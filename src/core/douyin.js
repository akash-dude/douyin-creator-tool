// src/core/douyin.js — 抖音自动化模块 (Puppeteer)
// 支持多账号：通过 setAccount() 切换独立配置目录

const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')
const { Config } = require('./config')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const DEFAULT_PROFILE = Config.paths.oldProfile

// 自动检测 Chrome 路径
function detectChromePath () {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return candidates[0] // fallback
}
const CHROME_PATH = detectChromePath()

class DouyinClient {
  constructor () {
    this.browser = null
    this.page = null
    this._profileDir = DEFAULT_PROFILE
  }

  setAccount (dir) {
    this._profileDir = dir || DEFAULT_PROFILE
  }

  // ====== 浏览器启动 ======
  async init () {
    if (this.browser) return
    this.browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: false,
      defaultViewport: Config.chrome.viewport,
      userDataDir: this._profileDir,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    })
    this.page = await this.browser.newPage()
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    )
  }

  // ====== 通用工具 ======
  async _goto (url) {
    return this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  }

  async _checkLoggedIn () {
    try {
      const text = await this.page.evaluate(() => document.body.innerText)
      return !(text.includes('登录') && text.includes('手机号'))
    } catch { return false }
  }

  async _requireLogin () {
    const ok = await this._checkLoggedIn()
    if (!ok) throw new Error('未登录，请在账号管理中登录')
  }

  async _typeText (selector, text, delay = 30) {
    const el = await this.page.$(selector)
    if (!el) return false
    await el.click(); await sleep(300)
    await el.type(text, { delay })
    return true
  }

  async _fillTags (tags) {
    if (!tags || tags.length === 0) return
    for (const tag of tags.slice(0, 5)) {
      const el = await this.page.$('input[placeholder*="标签"], input[placeholder*="话题"]')
      if (!el) return
      await el.click(); await sleep(200)
      await el.type(tag, { delay: 30 })
      await sleep(500); await this.page.keyboard.press('Enter'); await sleep(300)
    }
  }

  async _clickPublish () {
    const btn = await this.page.$('button:has-text("发布"), div:has-text("发布"):not(:has(*))')
    if (btn) { await btn.click(); return true }
    return false
  }

  // ====== 登录 ======
  async waitForLogin (timeoutMs = 120000) {
    await this.init()
    await this._goto('https://www.douyin.com/?recommend=1')
    await sleep(4000)
    if (await this._checkLoggedIn()) return { alreadyLoggedIn: true }

    console.log('⏳ 请在浏览器中登录抖音...')
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      await sleep(2000)
      if (await this._checkLoggedIn()) return { alreadyLoggedIn: false }
    }
    throw new Error('登录超时')
  }

  // ====== 视频信息提取 ======
  async getVideoInfo (url) {
    await this.init()
    await this._goto(url); await sleep(4000)
    return this.page.evaluate(() => {
      const md = document.querySelector('meta[name="description"]')
      const og = document.querySelector('meta[property="og:description"]')
      const h1 = document.querySelector('h1')
      return {
        title: h1?.textContent?.trim() || md?.getAttribute('content') || og?.getAttribute('content') || '',
        bodyText: document.body.innerText.substring(0, 2000),
        url: location.href
      }
    })
  }

  // ====== 发表评论 ======
  async postComment (videoUrl, text) {
    await this.init()
    await this._goto(videoUrl); await sleep(5000)
    try {
      const inputs = await this.page.$$('input')
      let inputEl = null
      for (const inp of inputs) {
        const ph = (await inp.evaluate(el => el.placeholder || '')).toLowerCase()
        const rect = await inp.evaluate(el => {
          const r = el.getBoundingClientRect()
          return { w: r.width, h: r.height, top: r.top }
        })
        if (ph.includes('弹幕') || ph.includes('友好')) { inputEl = inp; break }
        if (rect.w > 100 && rect.h > 25 && rect.top > 500) inputEl = inp
      }
      if (!inputEl) return { success: false, error: '找不到弹幕输入框', hint: '请确认已登录' }

      await inputEl.click(); await sleep(300)
      await inputEl.type(text, { delay: 50 }); await sleep(500)

      const allEls = await this.page.$$('button, div, span')
      let sendBtn = null
      for (const el of allEls) {
        const txt = (await el.evaluate(el => el.textContent.trim())) || ''
        if (txt === '发送' && (await el.evaluate(el => el.getBoundingClientRect().width > 0))) {
          sendBtn = el; break
        }
      }
      if (sendBtn) { await sendBtn.click(); return { success: true, text } }
      await this.page.keyboard.press('Enter'); await sleep(1000)
      return { success: true, text, method: 'enter' }
    } catch (err) { return { success: false, error: err.message } }
  }

  // ====== 等待上传完成（通用） ======
  async _waitUpload (maxSeconds = 120) {
    for (let i = 0; i < maxSeconds; i += 2) {
      await sleep(2000)
      const t = await this.page.evaluate(() => {
        const el = document.querySelector('[class*="progress"]')
        return el ? el.textContent : ''
      }).catch(() => '')
      if (t.includes('100') || t.includes('完成') || i > maxSeconds / 2) return true
    }
    await sleep(10000) // extra buffer
    return true
  }

  // ====== 发布视频 ======
  async publishVideo ({ filePath, title, desc, tags }) {
    await this.init(); const page = this.page
    try {
      await this._goto('https://www.douyin.com/upload'); await sleep(5000)
      await this._requireLogin()

      const fi = await page.$('input[type="file"]')
      if (!fi) return { success: false, error: '找不到上传入口' }
      await fi.uploadFile(filePath); await sleep(3000)
      await this._waitUpload()

      title && await this._typeText('input[placeholder*="标题"], input[class*="title"]', title)
      desc && await this._typeText('textarea[placeholder*="描述"]', desc)
      await this._fillTags(tags)

      const clicked = await this._clickPublish()
      return { success: true, title, desc, tags, needManualConfirm: !clicked }
    } catch (err) { return { success: false, error: err.message } }
  }

  // ====== 发布图文 ======
  async publishImages ({ imagePaths, title, desc, tags }) {
    await this.init(); const page = this.page
    try {
      await this._goto('https://www.douyin.com/upload?type=image'); await sleep(5000)
      await this._requireLogin()

      const fi = await page.$('input[type="file"]')
      if (!fi) return { success: false, error: '找不到上传入口' }
      await fi.uploadFile(...imagePaths); await sleep(4000)
      await this._waitUpload()

      if (title) await this._typeText('input[placeholder*="标题"], [contenteditable="true"]', title)
      if (desc) await this._typeText('textarea[placeholder*="描述"]', desc)
      await this._fillTags(tags)

      const clicked = await this._clickPublish()
      return { success: true, title, desc, tags, type: 'image', needManualConfirm: !clicked }
    } catch (err) { return { success: false, error: err.message } }
  }

  async destroy () {
    if (this.browser) {
      try { await this.browser.close() } catch (_) {}
      this.browser = null; this.page = null
    }
  }
}

module.exports = { DouyinClient }
