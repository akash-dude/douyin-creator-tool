// src/ui/components/generate.js

const Generate = {
  render () {
    const types = [
      { value: 'title',       label: '标题优化' },
      { value: 'script',      label: '口播脚本' },
      { value: 'tags',        label: '标签推荐' },
      { value: 'description', label: '视频描述' }
    ]

    return `
      <header class="view-header">
        <h1>✍️ 文案生成</h1>
        <p class="subtitle">AI 辅助创作，选择类型并输入提示</p>
      </header>
      <div class="form-group">
        <label class="label">生成类型</label>
        <select id="gen-type" class="input">
          ${types.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="label">输入参考内容</label>
        <textarea id="gen-input" class="input textarea" rows="4"
                  placeholder="输入视频主题、关键词或参考文案..."></textarea>
      </div>
      <button id="btn-generate" class="btn btn-primary">生成</button>
      <div id="generate-result" class="result-box hidden">
        <pre id="generate-content"></pre>
      </div>
    `
  },

  onMount () {
    document.getElementById('btn-generate')?.addEventListener('click', async () => {
      const type = document.getElementById('gen-type').value
      const input = document.getElementById('gen-input').value.trim()
      if (!input) return showToast('请输入参考内容', true)

      const btn = document.getElementById('btn-generate')
      btn.disabled = true; btn.textContent = '✍️ 生成中...'

      try {
        const result = await window.electronAPI.invoke('ai:generate', { type, input })
        showResult('generate-result', 'generate-content', result.result || result)
        await window.electronAPI.invoke('history:add', { type: `AI-${type}`, input, result: JSON.stringify(result) })
        App.refreshHistory()
        showToast('✅ 生成完成')
      } catch (err) {
        showResult('generate-result', 'generate-content', `❌ 错误：${err.message}`)
        showToast('❌ 生成失败', true)
      } finally {
        btn.disabled = false; btn.textContent = '生成'
      }
    })
  }
}
