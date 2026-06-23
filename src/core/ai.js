// src/core/ai.js — AI 生成模块（调用 Python 后端）
// 提示词 / 视频主题 / 参考文案 分离

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8765'

class AIGenerator {
  constructor () {
    this._backendReady = false
    this._retryCount = 0
    this._maxRetries = 30
  }

  async _waitForBackend () {
    if (this._backendReady) return

    while (this._retryCount < this._maxRetries) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/health`)
        if (res.ok) {
          this._backendReady = true
          console.log('[AI] Python 后端已就绪')
          return
        }
      } catch { /* 后端还没启动 */ }
      this._retryCount++
      await new Promise(r => setTimeout(r, 1000))
    }

    throw new Error('Python 后端连接超时，请确保后端已启动 (python main.py)')
  }

  async _post (path, body) {
    await this._waitForBackend()
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `请求失败 (${res.status})`)
    }
    return res.json()
  }

  async _get (path) {
    await this._waitForBackend()
    const res = await fetch(`${BACKEND_URL}${path}`)
    if (!res.ok) {
      throw new Error(`请求失败 (${res.status})`)
    }
    return res.json()
  }

  async _fetch (url, opts) {
    await this._waitForBackend()
    const res = await fetch(url, opts)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `请求失败 (${res.status})`)
    }
    return res.json()
  }

  // ── AI 生成 ─────────────────────────────

  /**
   * AI 内容生成
   *
   * @param {object} params
   * @param {string}  [params.type]          内置类型 title/script/tags/description/comment
   * @param {string}  [params.prompt]        自定义提示词模板
   * @param {string}  [params.prompt_id]     使用已保存的提示词 ID
   * @param {string}   params.topic          视频主题（必填）
   * @param {string}  [params.reference]     参考文案（可选）
   * @param {string}  [params.system_prompt] 系统提示词
   * @param {number}  [params.temperature]   温度 (0-2)
   * @param {number}  [params.max_tokens]    最大 token 数
   */
  async generate (params) {
    const body = {
      type: params.type || null,
      prompt: params.prompt || null,
      prompt_id: params.prompt_id || null,
      topic: params.topic,
      reference: params.reference || null,
      system_prompt: params.system_prompt || null,
      temperature: params.temperature ?? null,
      max_tokens: params.max_tokens ?? null
    }
    return this._post('/api/ai/generate', body)
  }

  // ── 配置 ───────────────────────────────

  async configure (provider, apiKey, model) {
    return this._post('/api/ai/configure', {
      provider: provider || null,
      api_key: apiKey || null,
      model: model || null
    })
  }

  async getStatus () {
    try {
      return await this._get('/api/ai/status')
    } catch {
      return { ok: false, ready: false, error: '后端未连接' }
    }
  }

  /**
   * 获取内置生成类型列表
   */
  async getBuiltinTypes () {
    return this._get('/api/ai/builtin-types')
  }

  // ── 提示词管理 ──────────────────────────

  /**
   * 列出所有提示词
   * @param {string} [typeFilter] 按类型筛选
   */
  async listPrompts (typeFilter) {
    const path = typeFilter
      ? `/api/ai/prompts?type=${encodeURIComponent(typeFilter)}`
      : '/api/ai/prompts'
    return this._get(path)
  }

  async getPrompt (promptId) {
    return this._get(`/api/ai/prompts/${encodeURIComponent(promptId)}`)
  }

  /**
   * 创建自定义提示词
   * @param {object} options
   * @param {string} options.name          提示词名称
   * @param {string} options.type          关联类型
   * @param {string} options.content       模板内容（含 {topic} {reference}）
   * @param {string} [options.systemPrompt] 系统提示词
   */
  async createPrompt ({ name, type, content, systemPrompt }) {
    return this._post('/api/ai/prompts', {
      name, type, content,
      system_prompt: systemPrompt || null
    })
  }

  /**
   * 更新自定义提示词
   */
  async updatePrompt (promptId, { name, type, content, systemPrompt }) {
    const body = {}
    if (name !== undefined) body.name = name
    if (type !== undefined) body.type = type
    if (content !== undefined) body.content = content
    if (systemPrompt !== undefined) body.system_prompt = systemPrompt
    return this._fetch(`${BACKEND_URL}/api/ai/prompts/${encodeURIComponent(promptId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  /**
   * 删除自定义提示词
   */
  async deletePrompt (promptId) {
    return this._fetch(`${BACKEND_URL}/api/ai/prompts/${encodeURIComponent(promptId)}`, {
      method: 'DELETE'
    })
  }

  // ── 快捷方法：只传 topic，用内置模板 ────

  /** 生成标题 */
  async genTitle (topic, reference) {
    return this.generate({ type: 'title', topic, reference })
  }

  /** 生成脚本 */
  async genScript (topic, reference) {
    return this.generate({ type: 'script', topic, reference })
  }

  /** 生成标签 */
  async genTags (topic, reference) {
    return this.generate({ type: 'tags', topic, reference })
  }

  /** 生成描述 */
  async genDescription (topic, reference) {
    return this.generate({ type: 'description', topic, reference })
  }

  /** 生成评论 */
  async genComment (topic, reference) {
    return this.generate({ type: 'comment', topic, reference })
  }
}

module.exports = { AIGenerator }
