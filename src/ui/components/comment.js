// src/ui/components/comment.js

const Comment = {
  render () {
    return `
      <header class="view-header">
        <h1>💬 评论发布</h1>
        <p class="subtitle">自动给抖音视频发弹幕</p>
      </header>
      <div class="login-bar" id="login-bar">
        <span id="login-status">🔴 未登录</span>
        <button id="btn-login" class="btn btn-secondary">登录抖音</button>
      </div>
      <div class="input-group">
        <input type="text" id="comment-url" class="input" placeholder="抖音视频链接" />
      </div>
      <div class="input-group">
        <input type="text" id="comment-text" class="input" placeholder="输入评论内容..." />
        <button id="btn-comment" class="btn btn-primary" disabled>发送评论</button>
      </div>
      <div id="comment-result" class="result-box hidden">
        <pre id="comment-content"></pre>
      </div>
    `
  },

  onMount () {
    this._loginState = false
    this._loginStatus = document.getElementById('login-status')
    this._loginBtn = document.getElementById('btn-login')
    this._commentBtn = document.getElementById('btn-comment')

    this._loginBtn?.addEventListener('click', () => this._handleLogin())
    this._commentBtn?.addEventListener('click', () => this._handleComment())
  },

  _updateUI (ok) {
    this._loginState = ok
    if (this._loginStatus) this._loginStatus.textContent = ok ? '🟢 已登录' : '🔴 未登录'
    if (this._loginBtn) this._loginBtn.textContent = ok ? '重新登录' : '登录抖音'
    if (this._commentBtn) this._commentBtn.disabled = !ok
  },

  async _handleLogin () {
    this._loginBtn.disabled = true
    this._loginBtn.textContent = '⏳ 登录中...'
    if (this._loginStatus) this._loginStatus.textContent = '🟡 请在弹出浏览器中扫码登录...'
    showToast('请在打开的 Chrome 中登录抖音')

    try {
      await window.electronAPI.invoke('douyin:login')
      this._updateUI(true)
      showToast('✅ 登录成功，可以发评论了')
      await window.electronAPI.invoke('history:add', { type: '登录', result: 'success' })
      App.refreshHistory()
    } catch (err) {
      this._updateUI(false)
      showToast('❌ 登录失败: ' + err.message, true)
    } finally {
      this._loginBtn.disabled = false
    }
  },

  async _handleComment () {
    const url = document.getElementById('comment-url')?.value.trim()
    const text = document.getElementById('comment-text')?.value.trim()
    if (!url) return showToast('请输入视频链接', true)
    if (!text) return showToast('请输入评论内容', true)

    this._commentBtn.disabled = true
    this._commentBtn.textContent = '💬 发送中...'

    try {
      const result = await window.electronAPI.invoke('douyin:post-comment', { url, text })
      showResult('comment-result', 'comment-content', result)
      await window.electronAPI.invoke('history:add', { type: '评论', url, text, result: JSON.stringify(result) })
      App.refreshHistory()
      showToast(result.success ? '✅ 评论已发送' : '⚠️ ' + (result.error || '发送可能失败'))
    } catch (err) {
      showResult('comment-result', 'comment-content', `❌ 错误：${err.message}`)
      showToast('❌ 发送失败', true)
    } finally {
      this._commentBtn.disabled = false
      this._commentBtn.textContent = '发送评论'
    }
  }
}
