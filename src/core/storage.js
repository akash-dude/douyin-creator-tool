// src/core/storage.js — 本地存储模块
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', '..', '.data', 'storage.json')

class Storage {
  constructor () {
    this._data = { history: [] }
  }

  async init () {
    try {
      const dir = path.dirname(DB_PATH)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      if (fs.existsSync(DB_PATH)) {
        this._data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      }
    } catch {
      this._data = { history: [] }
    }
  }

  _save () {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this._data, null, 2))
    } catch (_) {}
  }

  list () {
    return [...(this._data.history || [])]
  }

  add (entry) {
    const item = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    }
    this._data.history.unshift(item)
    if (this._data.history.length > 200) this._data.history.length = 200
    this._save()
    return item
  }

  clear () {
    this._data.history = []
    this._save()
  }
}

module.exports = { Storage }
