// src/ui/components/analyze.js

const Analyze = {
  render () {
    return `
      <header class="view-header">
        <h1>🔍 视频分析</h1>
        <p class="subtitle">粘贴抖音视频链接，一键提取信息</p>
      </header>
      <div class="input-group">
        <input type="text" id="video-url" class="input"
               placeholder="粘贴抖音视频链接，如 https://www.douyin.com/video/..." />
        <button id="btn-analyze" class="btn btn-primary">开始分析</button>
      </div>
      <div id="analyze-result" class="result-box hidden">
        <pre id="analyze-content"></pre>
      </div>
    `
  },

  async onMount () {
    document.getElementById('btn-analyze')?.addEventListener('click', async () => {
      const url = document.getElementById('video-url').value.trim()
      if (!url) return showToast('请输入视频链接', true)

      const btn = document.getElementById('btn-analyze')
      btn.disabled = true; btn.textContent = '🔍 分析中...'

      try {
        const result = await window.electronAPI.invoke('douyin:fetch-video-info', url)
        showResult('analyze-result', 'analyze-content', result)
        await window.electronAPI.invoke('history:add', { type: '分析', url, result: JSON.stringify(result) })
        App.refreshHistory()
        showToast('✅ 分析完成')
      } catch (err) {
        showResult('analyze-result', 'analyze-content', `❌ 错误：${err.message}`)
        showToast('❌ 分析失败', true)
      } finally {
        btn.disabled = false; btn.textContent = '开始分析'
      }
    })
  }
}
