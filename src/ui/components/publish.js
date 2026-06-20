// src/ui/components/publish.js — 发表作品（视频/图文 + 账号选择）

const Publish = {
  _mode: 'video', // 'video' | 'image'

  render () {
    const subtitle = this._mode === 'video'
      ? '选择账号，自动上传发布视频'
      : '选择账号，自动上传发布图文'

    return `
      <header class="view-header">
        <h1>📤 发表作品</h1>
        <p class="subtitle">${subtitle}</p>
      </header>

      ${AccountSelector.render('publish-account')}

      <!-- 模式切换 -->
      <div class="publish-tabs">
        <button class="publish-tab ${this._mode === 'video' ? 'active' : ''}" data-mode="video">
          🎬 发视频
        </button>
        <button class="publish-tab ${this._mode === 'image' ? 'active' : ''}" data-mode="image">
          🖼️ 发图文
        </button>
      </div>

      <div class="publish-form">
        <!-- 文件选择（视频/图片通用） -->
        <div class="form-group">
          <label class="label" id="file-label">${this._mode === 'video' ? '视频文件' : '图片（可多选）'}</label>
          <div class="file-upload" id="file-upload-area">
            <input type="file" id="publish-file"
                   accept="${this._mode === 'video' ? 'video/*' : 'image/*'}"
                   ${this._mode === 'image' ? 'multiple' : ''}
                   hidden />
            <div class="file-upload-placeholder" id="file-placeholder">
              <span style="font-size: 40px;">${this._mode === 'video' ? '🎬' : '🖼️'}</span>
              <p>${this._mode === 'video' ? '点击选择视频文件' : '点击选择图片（可多选）'}</p>
              <p style="font-size: 12px; color: var(--text-2);">
                ${this._mode === 'video' ? '支持 mp4, mov, avi 等常见格式' : '支持 jpg, png, webp 等常见格式'}
              </p>
            </div>
            <div id="file-info" class="file-info hidden">
              <span id="file-names"></span>
              <span id="file-sizes" style="color: var(--text-2); font-size: 12px;"></span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="label">${this._mode === 'video' ? '视频' : '图文'}标题</label>
          <input type="text" id="publish-title" class="input"
                 placeholder="输入标题（选填）" maxlength="100" />
        </div>

        <div class="form-group">
          <label class="label">描述 / 文案</label>
          <textarea id="publish-desc" class="input textarea" rows="3"
                    placeholder="输入描述或文案（选填）"></textarea>
        </div>

        <div class="form-group">
          <label class="label">标签（空格分隔）</label>
          <input type="text" id="publish-tags" class="input"
                 placeholder="如：vlog 日常 美食" />
        </div>

        <div class="publish-actions">
          <button id="btn-publish" class="btn btn-primary btn-large">
            🚀 发布${this._mode === 'video' ? '视频' : '图文'}
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
    // 模式切换
    document.querySelectorAll('.publish-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode
        if (mode === this._mode) return
        this._mode = mode
        // 重新渲染整个页面
        const main = document.getElementById('main-content')
        main.innerHTML = this.render()
        this.onMount()
      })
    })

    // 文件选择
    const fileInput = document.getElementById('publish-file')
    const uploadArea = document.getElementById('file-upload-area')

    uploadArea?.addEventListener('click', () => fileInput?.click())

    fileInput?.addEventListener('change', () => {
      const files = fileInput.files
      if (!files || files.length === 0) return

      document.getElementById('file-placeholder')?.classList.add('hidden')
      const info = document.getElementById('file-info')
      info.classList.remove('hidden')

      if (files.length === 1) {
        document.getElementById('file-names').textContent = files[0].name
        document.getElementById('file-sizes').textContent =
          `(${(files[0].size / 1024 / 1024).toFixed(1)} MB)`
      } else {
        const totalMB = [...files].reduce((s, f) => s + f.size, 0) / 1024 / 1024
        document.getElementById('file-names').textContent = `${files.length} 个文件`
        document.getElementById('file-sizes').textContent = `(${totalMB.toFixed(1)} MB 总计)`
      }
    })

    // 账号切换
    document.getElementById('publish-account')?.addEventListener('change', async () => {
      const id = AccountSelector.getSelected('publish-account')
      if (id) await window.electronAPI.invoke('accounts:switch', id)
    })

    // 发布按钮
    document.getElementById('btn-publish')?.addEventListener('click', () => this._handlePublish())
  },

  async _handlePublish () {
    const fileInput = document.getElementById('publish-file')
    const files = fileInput?.files
    if (!files || files.length === 0) return showToast('请选择文件', true)

    const accountId = AccountSelector.getSelected('publish-account')
    if (!accountId) return showToast('请先选择账号', true)

    const title = document.getElementById('publish-title').value.trim() || files[0].name.replace(/\.[^.]+$/, '')
    const desc = document.getElementById('publish-desc').value.trim()
    const tags = document.getElementById('publish-tags').value.trim()

    const btn = document.getElementById('btn-publish')
    btn.disabled = true
    btn.textContent = '⏫ 上传发布中...'

    try {
      let result
      if (this._mode === 'video') {
        result = await window.electronAPI.invoke('douyin:publish-video', {
          accountId,
          filePath: files[0].path,
          title, desc,
          tags: tags ? tags.split(/\s+/) : []
        })
      } else {
        // 图文：传图片路径数组
        const paths = [...files].map(f => f.path)
        result = await window.electronAPI.invoke('douyin:publish-images', {
          accountId,
          imagePaths: paths,
          title, desc,
          tags: tags ? tags.split(/\s+/) : []
        })
      }

      showResult('publish-result', 'publish-content', result)
      await window.electronAPI.invoke('history:add', {
        type: this._mode === 'video' ? '发布视频' : '发布图文',
        title, desc, account: accountId, result: JSON.stringify(result)
      })
      App.refreshHistory()
      showToast(result.success ? '✅ 发布成功' : `⚠️ ${result.error || ''}`)
    } catch (err) {
      showResult('publish-result', 'publish-content', `❌ 错误：${err.message}`)
      showToast('❌ 发布失败', true)
    } finally {
      btn.disabled = false
      btn.textContent = `🚀 发布${this._mode === 'video' ? '视频' : '图文'}`
    }
  }
}
