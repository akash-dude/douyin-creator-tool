// src/core/storage.js — 本地存储模块
const fs = require('fs')
const path = require('path')
const { Config } = require('./config')

const DB_PATH = Config.paths.storageFile

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
    if (this._data.history.length > Config.storage.maxHistory) {
      this._data.history.length = Config.storage.maxHistory
    }
    this._save()
    return item
  }

  clear () {
    this._data.history = []
    this._save()
  }
}

module.exports = { Storage }
