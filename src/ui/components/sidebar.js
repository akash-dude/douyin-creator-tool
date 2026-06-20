// src/ui/components/sidebar.js
// 侧边栏组件

const Sidebar = {
  render (activeView = 'dashboard') {
    const items = [
      { view: 'dashboard', icon: '📊', label: '工作台' },
      { view: 'analyze',   icon: '🔍', label: '视频分析' },
      { view: 'comment',   icon: '💬', label: '发表评论' },
      { view: 'generate',  icon: '✍️', label: '文案生成' },
      { view: 'publish',   icon: '📤', label: '发表作品' },
      { view: 'accounts',  icon: '👤', label: '账号管理' },
      { view: 'history',   icon: '📋', label: '历史记录' }
    ]

    return `
      <div class="logo">
        <span class="logo-icon">🎬</span>
        <span class="logo-text">抖音助手</span>
      </div>
      <nav class="nav">
        ${items.map(item => `
          <button class="nav-item ${activeView === item.view ? 'active' : ''}"
                  data-view="${item.view}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="version" id="app-version">v0.1.0</div>
      </div>
    `
  }
}
