// src/core/index.js — 核心引擎入口
// 不依赖 Electron，可独立运行（node src/core/index.js）

const { DouyinClient } = require('./douyin')
const { AIGenerator } = require('./ai')
const { Storage } = require('./storage')
const { AccountManager } = require('./account')

class CoreEngine {
  constructor () {
    this.douyin = new DouyinClient()
    this.ai = new AIGenerator()
    this.storage = new Storage()
    this.accounts = new AccountManager()
    this._ready = false
  }

  async init () {
    if (this._ready) return
    await this.storage.init()
    await this.accounts.init()
    // 如果有激活账号，设置其配置目录
    const active = this.accounts.getActive()
    if (active && active.profileDir) {
      this.douyin.setAccount(active.profileDir)
    }
    this._ready = true
  }

  async destroy () {
    await this.douyin.destroy()
    this._ready = false
  }

  // === 账号管理 ===
  getAccounts () {
    return this.accounts.list()
  }

  addAccount ({ name, username }) {
    const account = this.accounts.add({ name, username })
    // 新账号设为当前账号
    if (account.profileDir) {
      this.douyin.setAccount(account.profileDir)
    }
    return account
  }

  removeAccount (id) {
    this.accounts.remove(id)
    // 如果删除的是当前账号，切换到下一个
    const active = this.accounts.getActive()
    if (active) this.douyin.setAccount(active.profileDir)
  }

  switchAccount (id) {
    this.accounts.switchTo(id)
    const account = this.accounts.getActive()
    if (account) this.douyin.setAccount(account.profileDir)
    return account
  }

  clearAccounts () {
    this.accounts.clearAll()
    this.douyin.setAccount(null)
  }

  // === 抖音 ===
  async login () {
    const result = await this.douyin.waitForLogin()
    // 标记登录时间
    const active = this.accounts.getActive()
    if (active) this.accounts.markLogin(active.id)
    return result
  }

  async fetchVideoInfo (url) {
    return this.douyin.getVideoInfo(url)
  }

  async postComment (url, text) {
    return this.douyin.postComment(url, text)
  }

  async publishVideo ({ accountId, filePath, title, desc, tags }) {
    // 切换到指定账号
    if (accountId) {
      this.accounts.switchTo(accountId)
      const account = this.accounts.getActive()
      if (account) this.douyin.setAccount(account.profileDir)
    }
    return this.douyin.publishVideo({ filePath, title, desc, tags })
  }

  async publishImages ({ accountId, imagePaths, title, desc, tags }) {
    if (accountId) {
      this.accounts.switchTo(accountId)
      const account = this.accounts.getActive()
      if (account) this.douyin.setAccount(account.profileDir)
    }
    return this.douyin.publishImages({ imagePaths, title, desc, tags })
  }

  // === AI ===
  async generate (params) {
    // params: { type, topic, reference, prompt, prompt_id, system_prompt, temperature, max_tokens }
    return this.ai.generate(params)
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
      case 'accounts':
        console.log(JSON.stringify(engine.getAccounts(), null, 2))
        break
      case 'add-account':
        console.log(engine.addAccount({ name: arg }))
        break
      default:
        console.log(`
用法:
  node src/core/index.js login              — 登录
  node src/core/index.js accounts           — 列出账号
  node src/core/index.js add-account <name> — 添加账号
  node src/core/index.js analyze <url>      — 分析
  node src/core/index.js comment <url> <txt> — 评论
        `.trim())
    }
    await engine.destroy()
  })()
}

module.exports = { CoreEngine }
