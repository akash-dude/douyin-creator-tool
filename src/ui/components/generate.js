// src/ui/components/generate.js — 文案生成
// 支持：提示词（自定义/已存） + 视频主题 + 参考文案 + 高级参数

const Generate = {
  _prompts: [],

  async render () {
    let promptOptions = '<option value="">-- 使用内置模板 --</option>'
    try {
      const res = await window.electronAPI.invoke('ai:list-prompts')
      if (res && res.prompts) {
        this._prompts = res.prompts
        const builtins = res.prompts.filter(p => p.builtin)
        const customs = res.prompts.filter(p => !p.builtin)
        promptOptions += '<optgroup label="内置模板">'
        builtins.forEach(p => {
          promptOptions += `<option value="${p.id}">${p.name}</option>`
        })
        promptOptions += '</optgroup>'
        if (customs.length) {
          promptOptions += '<optgroup label="自定义">'
          customs.forEach(p => {
            promptOptions += `<option value="${p.id}">${p.name}</option>`
          })
          promptOptions += '</optgroup>'
        }
      }
    } catch (_) {}

    return `
      <header class="view-header">
        <h1>✍️ 文案生成</h1>
        <p class="subtitle">AI 辅助创作 · 提示词 + 视频主题 + 参考文案</p>
      </header>

      <!-- 提示词区域 -->
      <div class="card">
        <div class="card-title">📝 提示词</div>
        <div class="form-group">
          <label class="label">使用已存提示词</label>
          <select id="gen-prompt-select" class="input">
            ${promptOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="label">或自定义提示词模板</label>
          <textarea id="gen-prompt-custom" class="input textarea" rows="3"
            placeholder="提示词模板，支持 {topic} {reference} 占位符\n不填则用内置模板"
          ></textarea>
          <span class="hint">可用占位符: <code>{topic}</code> 视频主题 · <code>{reference}</code> 参考文案 · <code>{reference_section}</code> 参考段落</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="card">
        <div class="card-title">🎬 内容</div>
        <div class="form-group">
          <label class="label">视频主题 <span class="required">*</span></label>
          <input id="gen-topic" class="input" type="text"
            placeholder="例：周末自驾游攻略、新手做菜翻车现场..."
          >
        </div>
        <div class="form-group">
          <label class="label">参考文案 <span class="optional">(可选)</span></label>
          <textarea id="gen-reference" class="input textarea" rows="3"
            placeholder="参考视频的文案、素材灵感、背景故事...\n留空则只根据主题生成"
          ></textarea>
        </div>
      </div>

      <!-- 高级参数 -->
      <details class="advanced-section">
        <summary>⚙️ 高级参数</summary>
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="label">生成类型</label>
            <select id="gen-type" class="input">
              <option value="title">标题优化</option>
              <option value="script" selected>口播脚本</option>
              <option value="tags">标签推荐</option>
              <option value="description">视频描述</option>
              <option value="comment">互动评论</option>
            </select>
            <span class="hint">仅未选提示词时生效</span>
          </div>
          <div class="form-group flex-1">
            <label class="label">温度 <span id="gen-temp-val">0.8</span></label>
            <input id="gen-temperature" class="input range" type="range" min="0" max="2" step="0.1" value="0.8">
          </div>
          <div class="form-group flex-1">
            <label class="label">最大长度</label>
            <input id="gen-max-tokens" class="input" type="number" value="1024" min="64" max="4096" step="64">
          </div>
        </div>
      </details>

      <!-- 系统提示词 -->
      <div class="form-group">
        <label class="label">系统提示词 <span class="optional">(可选，覆盖默认)</span></label>
        <textarea id="gen-system-prompt" class="input textarea" rows="2"
          placeholder="例：你是一个毒舌幽默的吐槽博主...\n留空使用默认系统提示词"
        ></textarea>
      </div>

      <button id="btn-generate" class="btn btn-primary btn-lg">🚀 生成</button>

      <!-- 结果 -->
      <div id="generate-result" class="result-box hidden">
        <div class="result-header">
          <span>📄 生成结果</span>
          <button id="btn-copy-result" class="btn btn-sm">📋 复制</button>
        </div>
        <pre id="generate-content"></pre>
      </div>

      <div id="gen-loading" class="loading hidden">
        <div class="spinner"></div>
        <span>AI 生成中，请稍候...</span>
      </div>
    `
  },

  onMount () {
    // 温度滑块实时显示
    const tempSlider = document.getElementById('gen-temperature')
    if (tempSlider) {
      tempSlider.addEventListener('input', () => {
        document.getElementById('gen-temp-val').textContent = tempSlider.value
      })
    }

    // 选中已存提示词 -> 自动填充
    const promptSelect = document.getElementById('gen-prompt-select')
    if (promptSelect) {
      promptSelect.addEventListener('change', () => this._onPromptSelect())
    }

    // 生成按钮
    const btn = document.getElementById('btn-generate')
    if (btn) {
      btn.addEventListener('click', () => this._handleGenerate())
    }

    // 复制按钮
    const copyBtn = document.getElementById('btn-copy-result')
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this._copyResult())
    }
  },

  _onPromptSelect () {
    const select = document.getElementById('gen-prompt-select')
    const customArea = document.getElementById('gen-prompt-custom')
    const sysPromptArea = document.getElementById('gen-system-prompt')
    const pid = select.value

    if (!pid) {
      customArea.disabled = false
      customArea.value = ''
      customArea.placeholder = '提示词模板，支持 {topic} {reference} 占位符\n不填则用内置模板'
      return
    }

    const prompt = this._prompts.find(p => p.id === pid)
    if (prompt) {
      customArea.value = prompt.content
      customArea.disabled = true
      customArea.placeholder = ''
      if (prompt.system_prompt && sysPromptArea) {
        sysPromptArea.value = prompt.system_prompt
      }
    }
  },

  async _handleGenerate () {
    const btn = document.getElementById('btn-generate')
    const loading = document.getElementById('gen-loading')
    const resultBox = document.getElementById('generate-result')
    const resultContent = document.getElementById('generate-content')

    const promptId = document.getElementById('gen-prompt-select').value || null
    const promptText = document.getElementById('gen-prompt-custom').value.trim() || null
    const topic = document.getElementById('gen-topic').value.trim()
    const reference = document.getElementById('gen-reference').value.trim() || null
    const type = document.getElementById('gen-type').value
    const temperature = parseFloat(document.getElementById('gen-temperature').value)
    const maxTokens = parseInt(document.getElementById('gen-max-tokens').value) || 1024
    const systemPrompt = document.getElementById('gen-system-prompt').value.trim() || null

    if (!topic) return window.showToast('请输入视频主题', true)

    btn.disabled = true
    btn.textContent = '⏳ 生成中...'
    resultBox.classList.add('hidden')
    loading.classList.remove('hidden')

    try {
      const result = await window.electronAPI.invoke('ai:generate', {
        type,
        topic,
        reference,
        prompt: promptText,
        prompt_id: promptId,
        system_prompt: systemPrompt,
        temperature,
        max_tokens: maxTokens
      })

      resultBox.classList.remove('hidden')
      if (result.ok) {
        resultContent.textContent = result.result
        window.showToast('✅ 生成完成')
      } else {
        resultContent.textContent = `❌ 错误：${result.error || '生成失败'}`
        window.showToast('❌ 生成失败', true)
      }

      try {
        await window.electronAPI.invoke('history:add', {
          type: `AI-${type}`,
          input: topic,
          result: result.result || JSON.stringify(result)
        })
        App.refreshHistory()
      } catch (_) {}

    } catch (err) {
      resultBox.classList.remove('hidden')
      resultContent.textContent = `❌ 请求失败：${err.message}`
      window.showToast('❌ 生成失败', true)
    } finally {
      btn.disabled = false
      btn.textContent = '🚀 生成'
      loading.classList.add('hidden')
    }
  },

  _copyResult () {
    const text = document.getElementById('generate-content').textContent
    navigator.clipboard.writeText(text).then(() => {
      window.showToast('✅ 已复制到剪贴板')
    }).catch(() => {
      window.showToast('❌ 复制失败', true)
    })
  }
}
