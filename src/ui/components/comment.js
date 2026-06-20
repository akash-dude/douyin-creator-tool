// src/ui/components/comment.js — 发表评论（支持账号选择）

const Comment = {
  render () {
    return `
      <header class="view-header">
        <h1>💬 发表评论</h1>
        <p class="subtitle">选择账号，给抖音视频发弹幕</p>
      </header>

      ${AccountSelector.render('comment-account')}

      <div class="input-group" style="margin-top: 16px;">
        <input type="text" id="comment-url" class="input" placeholder="抖音视频链接" />
      </div>
      <div class="input-group">
        <input type="text" id="comment-text" class="input" placeholder="输入评论内容..." />
        <button id="btn-comment" class="btn btn-primary">发送评论</button>
      </div>
      <div id="comment-result" class="result-box hidden">
        <pre id="comment-content"></pre>
      </div>
    `
  },

  async onMount () {
    await AccountSelector.load('comment-account')
    this._bindEvents()
  },

  _bindEvents () {
    document.getElementById('btn-comment')?.addEventListener('click', () => this._handleSend())

    // 账号切换时自动切换
    document.getElementById('comment-account')?.addEventListener('change', async () => {
      const id = AccountSelector.getSelected('comment-account')
      if (id) {
        await window.electronAPI.invoke('accounts:switch', id)
        showToast('✅ 已切换账号')
      }
    })
  },

  async _handleSend () {
    const url = document.getElementById('comment-url')?.value.trim()
    const text = document.getElementById('comment-text')?.value.trim()
    if (!url) return showToast('请输入视频链接', true)
    if (!text) return showToast('请输入评论内容', true)

    const accountId = AccountSelector.getSelected('comment-account')
    if (!accountId) return showToast('请先添加账号', true)

    const btn = document.getElementById('btn-comment')
    btn.disabled = true; btn.textContent = '💬 发送中...'

    try {
      const result = await window.electronAPI.invoke('douyin:post-comment', { url, text })
      showResult('comment-result', 'comment-content', result)
      await window.electronAPI.invoke('history:add', {
        type: '评论', url, text, account: accountId, result: JSON.stringify(result)
      })
      App.refreshHistory()
      showToast(result.success ? '✅ 评论已发送' : `⚠️ ${result.error || ''}`)
    } catch (err) {
      showResult('comment-result', 'comment-content', `❌ 错误：${err.message}`)
      showToast('❌ 发送失败', true)
    } finally {
      btn.disabled = false; btn.textContent = '发送评论'
    }
  }
}
