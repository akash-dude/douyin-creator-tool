// src/ui/components/history.js

const History = {
  render () {
    return `
      <header class="view-header">
        <h1>📋 历史记录</h1>
        <p class="subtitle">最近的分析和生成记录</p>
      </header>
      <div id="history-list" class="history-list">
        <p class="empty-state">暂无记录</p>
      </div>
    `
  },

  onMount () {
    App.refreshHistory()
  }
}
