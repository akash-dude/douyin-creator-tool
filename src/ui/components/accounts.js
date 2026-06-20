// src/ui/components/accounts.js — 账号管理界面

const Accounts = {
  render () {
    return `
      <header class="view-header">
        <h1>👤 账号管理</h1>
        <p class="subtitle">添加账号后自动弹出浏览器登录，保存登录态，隔离管理</p>
      </header>

      <div class="accounts-toolbar">
        <button id="btn-add-account" class="btn btn-primary">＋ 添加新账号</button>
        <button id="btn-clear-accounts" class="btn btn-danger">🗑️ 清除所有</button>
      </div>

      <div id="account-list" class="account-list">
        <div class="loading">加载中...</div>
      </div>

      <!-- 新建账号弹窗 -->
      <div id="account-modal" class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <h3>添加抖音账号</h3>
          <p style="color: var(--text-2); font-size: 14px; margin-bottom: 20px;">
            确认后会打开浏览器，请在抖音页面扫码或手机号登录。
          </p>
          <div class="form-group">
            <label class="label">给这个账号起个名字</label>
            <input type="text" id="new-account-name" class="input"
                   placeholder="如：主账号、小号1、运营号" />
          </div>
          <div class="modal-actions">
            <button id="btn-modal-cancel" class="btn btn-secondary">取消</button>
            <button id="btn-modal-confirm" class="btn btn-primary">
              打开浏览器登录 →
            </button>
          </div>
        </div>
      </div>

      <!-- 登录中提示 -->
      <div id="login-progress" class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content" style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
          <h3>等待登录...</h3>
          <p style="color: var(--text-2); margin-top: 8px;">
            请在打开的 Chrome 浏览器中登录抖音<br>
            登录完成后会自动检测并保存
          </p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <button id="btn-login-cancel" class="btn btn-secondary" style="margin-top: 20px;">
            取消
          </button>
        </div>
      </div>
    `
  },

  onMount () {
    this._bindEvents()
    this._refresh()
  },

  _bindEvents () {
    document.getElementById('btn-add-account')?.addEventListener('click', () => {
      document.getElementById('account-modal').classList.remove('hidden')
    })

    document.getElementById('btn-clear-accounts')?.addEventListener('click', async () => {
      if (!confirm('确定清除所有账号？已保存的登录态也会被删除！')) return
      await window.electronAPI.invoke('accounts:clear')
      showToast('✅ 已清除所有账号')
      this._refresh()
    })

    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => {
      document.getElementById('account-modal').classList.add('hidden')
    })

    // 核心：添加账号 → 登录抖音
    document.getElementById('btn-modal-confirm')?.addEventListener('click', async () => {
      const name = document.getElementById('new-account-name').value.trim() || `账号${Date.now()}`
      document.getElementById('account-modal').classList.add('hidden')

      // 显示登录等待界面
      document.getElementById('login-progress').classList.remove('hidden')

      try {
        showToast('🔄 正在打开浏览器，请登录抖音...')
        const account = await window.electronAPI.invoke('accounts:add-and-login', { name })

        document.getElementById('login-progress').classList.add('hidden')
        document.getElementById('new-account-name').value = ''

        showToast(`✅ 账号「${account.name}」已添加并登录成功`)
        this._refresh()
        App.refreshHistory()
      } catch (err) {
        document.getElementById('login-progress').classList.add('hidden')
        showToast('❌ ' + err.message, true)
      }
    })

    document.getElementById('btn-login-cancel')?.addEventListener('click', () => {
      document.getElementById('login-progress').classList.add('hidden')
      showToast('已取消登录')
    })

    document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      document.getElementById('account-modal').classList.add('hidden')
    })
  },

  async _refresh () {
    const list = document.getElementById('account-list')
    try {
      const accounts = await window.electronAPI.invoke('accounts:list')
      if (accounts.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <p style="font-size: 40px; margin-bottom: 12px;">📭</p>
            <p>还没有账号</p>
            <p style="font-size: 13px; color: var(--text-2); margin-top: 4px;">
              点击「添加新账号」→ 浏览器登录 → 自动保存
            </p>
          </div>
        `
        return
      }

      list.innerHTML = accounts.map(a => `
        <div class="account-card ${a.isActive ? 'active' : ''}">
          <div class="account-avatar">${a.name.charAt(0)}</div>
          <div class="account-info">
            <div class="account-name">${a.name}</div>
            <div class="account-meta">
              ${a.lastLogin
                ? `<span class="status-dot" style="color:#22c55e">●</span> 已登录 · 最近: ${new Date(a.lastLogin).toLocaleString('zh-CN')}`
                : `<span class="status-dot" style="color:#888">●</span> 未登录`
              }
              <span>📅 ${new Date(a.addedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div class="account-actions">
            ${a.isActive
              ? '<span class="badge-active">当前</span>'
              : `<button class="btn btn-sm btn-secondary" data-switch="${a.id}">切换</button>`
            }
            <button class="btn btn-sm btn-outline" data-relogin="${a.id}">重新登录</button>
            <button class="btn btn-sm btn-danger" data-remove="${a.id}">删除</button>
          </div>
        </div>
      `).join('')

      list.querySelectorAll('[data-switch]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.switch
          await window.electronAPI.invoke('accounts:switch', id)
          showToast('✅ 已切换账号')
          this._refresh()
          if (window.App && window.App._refreshLoginUI) {
            window.App._refreshLoginUI()
          }
        })
      })

      list.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('确定删除此账号及其所有登录数据？')) return
          await window.electronAPI.invoke('accounts:remove', btn.dataset.remove)
          showToast('已删除')
          this._refresh()
        })
      })

      list.querySelectorAll('[data-relogin]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.relogin
          await window.electronAPI.invoke('accounts:switch', id)
          showToast('🔄 正在重新登录...')
          try {
            await window.electronAPI.invoke('douyin:login')
            showToast('✅ 重新登录成功')
            this._refresh()
          } catch (err) {
            showToast('❌ 登录失败: ' + err.message, true)
          }
        })
      })

    } catch (err) {
      list.innerHTML = `<div class="error-state">❌ 加载失败: ${err.message}</div>`
    }
  }
}
