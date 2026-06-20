// src/core/index.js — 核心引擎入口
// 不依赖 Electron，可独立运行（node src/core/index.js）

const { DouyinClient } = require('./douyin')
const { AIGenerator } = require('./ai')
const { Storage } = require('./storage')

class CoreEngine {
  constructor () {
    this.douyin = new DouyinClient()
    this.ai = new AIGenerator()
    this.storage = new Storage()
    this._ready = false
  }

  async init () {
    if (this._ready) return
    await this.storage.init()
    this._ready = true
  }

  async destroy () {
    await this.douyin.destroy()
    this._ready = false
  }

  // === 抖音 ===
  async login () {
    return this.douyin.waitForLogin()
  }

  async fetchVideoInfo (url) {
    return this.douyin.getVideoInfo(url)
  }

  async postComment (url, text) {
    return this.douyin.postComment(url, text)
  }

  // === AI ===
  async generate (type, input) {
    return this.ai.generate(type, input)
  }

  // === 存储 ===
  async getHistory () {
    return this.storage.list()
  }

  async addHistory (entry) {
    return this.storage.add(entry)
  }
}

// CLI 独立运行支持
if (require.main === module) {
  const engine = new CoreEngine()
  const cmd = process.argv[2]
  const arg = process.argv[3]

  ;(async () => {
    await engine.init()
    switch (cmd) {
      case 'login':
        console.log('等待登录...')
        await engine.login()
        break
      case 'analyze':
        console.log(await engine.fetchVideoInfo(arg))
        break
      case 'comment':
        console.log(await engine.postComment(arg, process.argv[4]))
        break
      default:
        console.log(`
用法:
  node src/core/index.js login              — 登录抖音
  node src/core/index.js analyze <url>      — 分析视频
  node src/core/index.js comment <url> <txt> — 发送评论
        `.trim())
    }
    await engine.destroy()
  })()
}

module.exports = { CoreEngine }
