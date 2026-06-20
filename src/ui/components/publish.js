// src/ui/components/publish.js — 发表作品（支持账号选择）

const Publish = {
  render () {
    return `
      <header class="view-header">
        <h1>📤 发表作品</h1>
        <p class="subtitle">选择账号，自动发布视频到抖音</p>
      </header>

      ${AccountSelector.render('publish-account')}

      <div class="publish-form">
        <div class="form-group">
          <label class="label">视频文件</label>
          <div class="file-upload" id="file-upload-area">
            <input type="file" id="publish-file" accept="video/*" hidden />
            <div class="file-upload-placeholder">
              <span style="font-size: 40px;">🎬</span>
              <p>点击选择视频文件</p>
              <p style="font-size: 12px; color: var(--text-2);">支持 mp4, mov, avi 等常见格式</p>
            </div>
            <div id="file-info" class="file-info hidden">
              <span id="file-name"></span>
              <span id="file-size" style="color: var(--text-2); font-size: 12px;"></span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="label">视频标题</label>
          <input type="text" id="publish-title" class="input"
                 placeholder="输入视频标题（选填，不填则使用文件名）" maxlength="100" />
        </div>

        <div class="form-group">
          <label class="label">视频描述</label>
          <textarea id="publish-desc" class="input textarea" rows="3"
                    placeholder="输入视频描述/文案（选填）"></textarea>
        </div>

        <div class="form-group">
          <label class="label">标签（空格分隔）</label>
          <input type="text" id="publish-tags" class="input"
                 placeholder="如：vlog 日常 美食" />
        </div>

        <div class="form-group">
          <label class="label">发布时间</label>
          <select id="publish-schedule" class="input">
            <option value="now">立即发布</option>
            <option value="schedule">定时发布（暂不支持）</option>
          </select>
        </div>

        <div class="publish-actions">
          <button id="btn-publish" class="btn btn-primary btn-large">
            🚀 发布到抖音
          </button>
        </div>
      </div>

      <div id="publish-result" class="result-box hidden">
        <pre id="publish-content"></pre>
      </div>
    `
  },

  async onMount () {
    await AccountSelector.load('publish-account')
    this._bindEvents()
  },

  _bindEvents () {
    // 文件选择
    const fileInput = document.getElementById('publish-file')
    const uploadArea = document.getElementById('file-upload-area')

    uploadArea?.addEventListener('click', () => fileInput?.click())

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files[0]
      if (!file) return

      document.querySelector('.file-upload-placeholder')?.classList.add('hidden')
      const info = document.getElementById('file-info')
      info.classList.remove('hidden')
      document.getElementById('file-name').textContent = file.name
      document.getElementById('file-size').textContent = `(${(file.size / 1024 / 1024).toFixed(1)} MB)`
    })

    // 账号切换
    document.getElementById('publish-account')?.addEventListener('change', async () => {
      const id = AccountSelector.getSelected('publish-account')
      if (id) {
        await window.electronAPI.invoke('accounts:switch', id)
      }
    })

    // 发布按钮
    document.getElementById('btn-publish')?.addEventListener('click', () => this._handlePublish())
  },

  async _handlePublish () {
    const fileInput = document.getElementById('publish-file')
    const file = fileInput?.files[0]
    if (!file) return showToast('请选择视频文件', true)

    const accountId = AccountSelector.getSelected('publish-account')
    if (!accountId) return showToast('请先选择账号', true)

    const title = document.getElementById('publish-title').value.trim() || file.name.replace(/\.[^.]+$/, '')
    const desc = document.getElementById('publish-desc').value.trim()
    const tags = document.getElementById('publish-tags').value.trim()

    const btn = document.getElementById('btn-publish')
    btn.disabled = true; btn.textContent = '⏫ 上传发布中...'

    try {
      const result = await window.electronAPI.invoke('douyin:publish-video', {
        accountId,
        filePath: file.path,
        title,
        desc,
        tags: tags ? tags.split(/\s+/) : []
      })
      showResult('publish-result', 'publish-content', result)
      await window.electronAPI.invoke('history:add', {
        type: '发布', title, desc, account: accountId, result: JSON.stringify(result)
      })
      App.refreshHistory()
      showToast(result.success ? '✅ 发布成功' : `⚠️ ${result.error || '发布可能失败'}`)
    } catch (err) {
      showResult('publish-result', 'publish-content', `❌ 错误：${err.message}`)
      showToast('❌ 发布失败', true)
    } finally {
      btn.disabled = false; btn.textContent = '🚀 发布到抖音'
    }
  }
}
