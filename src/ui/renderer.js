// src/ui/renderer.js — UI 主渲染器

// ============ 全局工具函数 ============
window.showToast = function (msg, isError = false) {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.style.color = isError ? '#f5576c' : '#e8e8f0'
  toast.classList.remove('hidden')
  clearTimeout(toast._hide)
  toast._hide = setTimeout(() => toast.classList.add('hidden'), 3500)
}

window.showResult = function (boxId, contentId, data) {
  const box = document.getElementById(boxId)
  const pre = document.getElementById(contentId)
  if (!box || !pre) return
  box.classList.remove('hidden')
  pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
}

// ============ App 控制器 ============
const App = {
  views: {
    dashboard: Dashboard,
    analyze: Analyze,
    comment: Comment,
    generate: Generate,
    publish: Publish,
    accounts: Accounts,
    history: History
  },

  _currentView: 'dashboard',

  async init () {
    this._renderLayout()
    this._bindNav()
    await this._switchView('dashboard')

    // 加载版本
    try {
      const info = await window.electronAPI.invoke('app:info')
      document.getElementById('app-version').textContent = `v${info.version}`
    } catch (_) {}
  },

  _renderLayout () {
    document.getElementById('sidebar').innerHTML = Sidebar.render('dashboard')
    document.getElementById('main-content').innerHTML = this.views.dashboard.render()
  },

  _bindNav () {
    document.getElementById('sidebar').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item')
      if (btn) this._switchView(btn.dataset.view)
    })

    document.getElementById('main-content').addEventListener('click', (e) => {
      const card = e.target.closest('.card')
      if (card) this._switchView(card.dataset.view)
    })
  },

  async _switchView (view) {
    if (!view || !this.views[view]) return
    this._currentView = view

    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
    document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active')

    // 渲染视图
    const component = this.views[view]
    document.getElementById('main-content').innerHTML = component.render()

    // 挂载事件
    if (component.onMount) component.onMount()
  },

  async refreshHistory () {
    const list = document.getElementById('history-list')
    if (!list) return
    try {
      const items = await window.electronAPI.invoke('history:list')
      list.innerHTML = items.length === 0
        ? '<p class="empty-state">暂无记录</p>'
        : items.map(item => `
          <div class="history-item">
            <div class="history-meta">
              <span class="history-badge">${item.type}</span>
              <span class="history-time">${new Date(item.timestamp).toLocaleString('zh-CN')}</span>
            </div>
            <div class="history-summary">${item.url || item.text || item.input || ''}</div>
          </div>
        `).join('')
    } catch (_) {}
  },

  // 供其他组件调用：刷新评论区登录状态
  async _refreshLoginUI () {
    const el = document.querySelector('#login-status')
    if (!el) return
    // 简单处理：切换账号后提示重新登录
    el.textContent = '🟡 账号已切换，请重新登录'
    document.getElementById('btn-login').textContent = '登录抖音'
    document.getElementById('btn-comment').disabled = true
  }
}

// ============ 启动 ============
document.addEventListener('DOMContentLoaded', () => App.init())
