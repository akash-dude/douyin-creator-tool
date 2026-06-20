// src/core/douyin.js — 抖音自动化模块 (Puppeteer)
// 支持多账号：通过 setAccount() 切换独立配置目录

const puppeteer = require('puppeteer-core')
const path = require('path')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const DEFAULT_PROFILE = path.join(__dirname, '..', '..', '.douyin-profile')

class DouyinClient {
  constructor () {
    this.browser = null
    this.page = null
    this._profileDir = DEFAULT_PROFILE
  }

  /**
   * 设置当前账号的 Puppeteer 独立配置目录
   */
  setAccount (dir) {
    this._profileDir = dir || DEFAULT_PROFILE
  }

  async init () {
    if (this.browser) return

    this.browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      userDataDir: this._profileDir,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      ]
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

  async _checkLoggedIn () {
    try {
      const text = await this.page.evaluate(() => document.body.innerText)
      return !(text.includes('登录') && text.includes('手机号'))
    } catch {
      return false
    }
  }

  async waitForLogin (timeoutMs = 120000) {
    await this.init()
    await this.page.goto('https://www.douyin.com/?recommend=1', {
      waitUntil: 'networkidle2', timeout: 30000
    })
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

  async getVideoInfo (url) {
    await this.init()
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(4000)

    return this.page.evaluate(() => {
      const metaDesc = document.querySelector('meta[name="description"]')
      const metaOg = document.querySelector('meta[property="og:description"]')
      const h1 = document.querySelector('h1')
      return {
        title: h1?.textContent?.trim()
          || metaDesc?.getAttribute('content')
          || metaOg?.getAttribute('content')
          || '',
        bodyText: document.body.innerText.substring(0, 2000),
        url: location.href
      }
    })
  }

  async postComment (videoUrl, text) {
    await this.init()
    await this.page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(5000)

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

      await inputEl.click()
      await sleep(300)
      await inputEl.type(text, { delay: 50 })
      await sleep(500)

      const allEls = await this.page.$$('button, div, span')
      let sendBtn = null
      for (const el of allEls) {
        const txt = (await el.evaluate(el => el.textContent.trim())) || ''
        if (txt === '发送') {
          const vis = await el.evaluate(el => el.getBoundingClientRect().width > 0)
          if (vis) { sendBtn = el; break }
        }
      }

      if (sendBtn) { await sendBtn.click(); return { success: true, text } }
      await this.page.keyboard.press('Enter')
      await sleep(1000)
      return { success: true, text, method: 'enter' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // 发布视频到抖音
  async publishVideo ({ filePath, title, desc, tags }) {
    await this.init()
    const page = this.page

    try {
      // 前往创作者上传页面
      await page.goto('https://www.douyin.com/upload', {
        waitUntil: 'networkidle2', timeout: 30000
      })
      await sleep(5000)

      // 检查是否已登录
      const text = await page.evaluate(() => document.body.innerText)
      if (text.includes('登录') && text.includes('手机号')) {
        return { success: false, error: '未登录，请先在账号管理登录', needLogin: true }
      }

      // 找到文件上传 input 并选择文件
      const fileInput = await page.$('input[type="file"]')
      if (!fileInput) return { success: false, error: '找不到上传入口' }

      await fileInput.uploadFile(filePath)
      await sleep(3000)

      // 等待上传完成
      let uploadDone = false
      for (let i = 0; i < 60; i++) {
        await sleep(2000)
        const progress = await page.evaluate(() => {
          const el = document.querySelector('[class*="progress"], [class*="upload"]')
          return el ? el.textContent : ''
        }).catch(() => '')
        if (progress.includes('100') || progress.includes('完成') || i > 30) {
          uploadDone = true
          break
        }
      }

      if (!uploadDone) {
        // 继续等待
        await sleep(10000)
      }

      // 填写标题
      if (title) {
        const titleInput = await page.$('input[placeholder*="标题"], input[class*="title"], [contenteditable="true"][placeholder*="标题"]')
        if (titleInput) {
          await titleInput.click()
          await sleep(300)
          await titleInput.type(title, { delay: 30 })
        }
      }

      // 填写描述
      if (desc) {
        const descInput = await page.$('textarea[placeholder*="描述"], [contenteditable="true"][placeholder*="描述"]')
        if (descInput) {
          await descInput.click()
          await sleep(300)
          await descInput.type(desc, { delay: 20 })
        }
      }

      // 添加标签
      if (tags && tags.length > 0) {
        for (const tag of tags.slice(0, 5)) {
          const tagInput = await page.$('input[placeholder*="标签"], input[placeholder*="话题"]')
          if (tagInput) {
            await tagInput.click()
            await sleep(200)
            await tagInput.type(tag, { delay: 30 })
            await sleep(500)
            await page.keyboard.press('Enter')
            await sleep(300)
          }
        }
      }

      // 点击发布
      const publishBtn = await page.$('button:has-text("发布"), div:has-text("发布"):not(:has(*))')
      if (publishBtn) {
        await publishBtn.click()
        return { success: true, title, desc, tags }
      }

      return { success: true, title, desc, tags, note: '文件已上传，请手动确认发布' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async destroy () {
    if (this.browser) {
      try { await this.browser.close() } catch (_) {}
      this.browser = null; this.page = null
    }
  }
}

module.exports = { DouyinClient }
