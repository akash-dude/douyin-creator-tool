// src/core/account.js — 账号管理系统
// 功能：多账号管理、加密存储、独立 Puppeteer 隔离

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const ACCOUNTS_FILE = path.join(__dirname, '..', '..', '.data', 'accounts.enc')
const PROFILES_DIR = path.join(__dirname, '..', '..', '.profiles')

// ====== 加密工具 (AES-256-GCM) ======
const ALGORITHM = 'aes-256-gcm'
// 设备指纹作为派生密钥的种子（不完美但实用）
const DEVICE_SEED = () => {
  const parts = [
    process.env.COMPUTERNAME || '',
    process.env.USERNAME || '',
    fs.existsSync('C:\\') ? 'win' : 'nix',
    require('os').arch()
  ]
  return crypto.createHash('sha256').update(parts.join('|')).digest()
}

function encrypt (plaintext) {
  const key = DEVICE_SEED()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { iv: iv.toString('hex'), tag: tag.toString('hex'), data: encrypted.toString('hex') }
}

function decrypt (packed) {
  const key = DEVICE_SEED()
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(packed.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(packed.tag, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(packed.data, 'hex')),
    decipher.final()
  ])
  return decrypted.toString('utf-8')
}

function encryptFile (filePath, data) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const packed = encrypt(JSON.stringify(data, null, 2))
  fs.writeFileSync(filePath, JSON.stringify(packed), 'utf-8')
}

function decryptFile (filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const packed = JSON.parse(raw)
    if (!packed.iv || !packed.tag || !packed.data) return null
    return JSON.parse(decrypt(packed))
  } catch {
    return null
  }
}

// ====== 账号管理器 ======
class AccountManager {
  constructor () {
    this._accounts = []
    this._activeId = null
  }

  async init () {
    const data = decryptFile(ACCOUNTS_FILE)
    if (data) {
      this._accounts = data.accounts || []
      this._activeId = data.activeId || null
    }
    if (!fs.existsSync(PROFILES_DIR)) {
      fs.mkdirSync(PROFILES_DIR, { recursive: true })
    }
  }

  _save () {
    encryptFile(ACCOUNTS_FILE, {
      accounts: this._accounts,
      activeId: this._activeId
    })
  }

  // 列出所有账号
  list () {
    return this._accounts.map(a => ({
      id: a.id,
      name: a.name,
      username: a.username || '',
      addedAt: a.addedAt,
      lastLogin: a.lastLogin,
      isActive: a.id === this._activeId
    }))
  }

  // 添加账号
  add ({ name, username }) {
    const id = crypto.randomUUID()
    const account = {
      id,
      name: name || username || `账号 ${this._accounts.length + 1}`,
      username: username || '',
      profileDir: path.join(PROFILES_DIR, `account_${id}`),
      addedAt: new Date().toISOString(),
      lastLogin: null
    }
    // 创建独立的 Puppeteer 配置目录
    if (!fs.existsSync(account.profileDir)) {
      fs.mkdirSync(account.profileDir, { recursive: true })
    }
    this._accounts.push(account)
    if (!this._activeId) this._activeId = id
    this._save()
    return this.list().find(a => a.id === id)
  }

  // 删除账号
  remove (id) {
    const idx = this._accounts.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('账号不存在')
    const account = this._accounts[idx]
    // 清除独立配置目录
    if (account.profileDir && fs.existsSync(account.profileDir)) {
      fs.rmSync(account.profileDir, { recursive: true, force: true })
    }
    this._accounts.splice(idx, 1)
    if (this._activeId === id) {
      this._activeId = this._accounts[0]?.id || null
    }
    this._save()
  }

  // 切换当前账号
  switchTo (id) {
    if (!this._accounts.find(a => a.id === id)) throw new Error('账号不存在')
    this._activeId = id
    this._save()
  }

  // 获取当前账号信息（含 profileDir）
  getActive () {
    return this._accounts.find(a => a.id === this._activeId) || null
  }

  // 记录登录时间
  markLogin (id) {
    const account = this._accounts.find(a => a.id === id)
    if (account) {
      account.lastLogin = new Date().toISOString()
      this._save()
    }
  }

  // 清除所有数据
  clearAll () {
    this._accounts = []
    this._activeId = null
    // 清除所有配置目录
    if (fs.existsSync(PROFILES_DIR)) {
      fs.rmSync(PROFILES_DIR, { recursive: true, force: true })
    }
    // 清除旧的统一配置目录
    const oldProfile = path.join(__dirname, '..', '..', '.douyin-profile')
    if (fs.existsSync(oldProfile)) {
      fs.rmSync(oldProfile, { recursive: true, force: true })
    }
    if (fs.existsSync(ACCOUNTS_FILE)) {
      fs.unlinkSync(ACCOUNTS_FILE)
    }
  }
}

module.exports = { AccountManager }
