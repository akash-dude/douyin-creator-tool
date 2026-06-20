// src/ui/components/dashboard.js

const Dashboard = {
  render () {
    const cards = [
      { view: 'analyze',  icon: '🔍', title: '视频分析',   desc: '输入链接，提取标题、标签、文案' },
      { view: 'comment',  icon: '💬', title: '发表评论',   desc: '选择账号，自动发弹幕/评论' },
      { view: 'generate', icon: '✍️', title: '文案生成',   desc: 'AI 辅助撰写口播稿、标题、标签' },
      { view: 'accounts', icon: '👤', title: '账号管理',   desc: '多账号隔离登录，加密存储' },
      { view: 'publish',  icon: '📤', title: '发表作品',   desc: '选择账号，自动上传发布视频' },
      { view: 'history',  icon: '📋', title: '历史记录',   desc: '查看所有分析和管理记录' }
    ]

    return `
      <header class="view-header">
        <h1>📊 工作台</h1>
        <p class="subtitle">快速开始你的抖音创作</p>
      </header>
      <div class="cards">
        ${cards.map(c => `
          <div class="card" data-view="${c.view}">
            <div class="card-icon">${c.icon}</div>
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
          </div>
        `).join('')}
      </div>
    `
  }
}
