// src/ui/components/account-selector.js — 共享账号选择器
// 被 comment.js 和 publish.js 复用

const AccountSelector = {
  // 渲染下拉框
  render (selectId = 'account-select') {
    return `
      <div class="account-selector">
        <label class="label">使用账号</label>
        <select id="${selectId}" class="input account-select-input">
          <option value="">— 加载中 —</option>
        </select>
        <span id="${selectId}-status" class="account-status"></span>
      </div>
    `
  },

  // 加载账号列表到下拉框
  async load (selectId = 'account-select') {
    const sel = document.getElementById(selectId)
    if (!sel) return null

    try {
      const accounts = await window.electronAPI.invoke('accounts:list')
      if (accounts.length === 0) {
        sel.innerHTML = '<option value="">— 暂无账号，请先添加 —</option>'
        return null
      }
      sel.innerHTML = accounts.map(a => `
        <option value="${a.id}" ${a.isActive ? 'selected' : ''}>
          ${a.name} ${a.lastLogin ? '🟢' : '⚪'}
        </option>
      `).join('')
      return accounts
    } catch {
      sel.innerHTML = '<option value="">— 加载失败 —</option>'
      return null
    }
  },

  // 获取当前选中账号
  getSelected (selectId = 'account-select') {
    const sel = document.getElementById(selectId)
    return sel ? sel.value : null
  }
}
