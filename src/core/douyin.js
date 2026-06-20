// src/core/douyin.js — 抖音自动化模块 (Puppeteer)
const puppeteer = require('puppeteer-core')
const path = require('path')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PROFILE_DIR = path.join(__dirname, '..', '..', '.douyin-profile')

class DouyinClient {
  constructor () {
    this.browser = null
    this.page = null
  }

  async init () {
    if (this.browser) return

    this.browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      userDataDir: PROFILE_DIR,
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
      return false // 页面不可用时视为未登录
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
      // 找弹幕输入框
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

      // 找发送按钮
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

  async destroy () {
    if (this.browser) {
      try { await this.browser.close() } catch (_) {}
      this.browser = null; this.page = null
    }
  }
}

module.exports = { DouyinClient }
