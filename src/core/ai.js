// src/core/ai.js — AI 生成模块

class AIGenerator {
  constructor () {
    // 后续可接入 OpenAI / DeepSeek / 本地模型
    this.provider = null
  }

  /**
   * 生成内容
   * @param {'title'|'script'|'tags'|'description'} type
   * @param {string} input
   */
  async generate (type, input) {
    // TODO: 对接真实 AI API
    const promptTemplates = {
      title: `基于以下内容，生成3个吸引眼球的抖音标题：\n${input}`,
      script: `基于以下主题，写一段30秒口播脚本：\n${input}`,
      tags: `基于以下内容，推荐10个热门抖音标签：\n${input}`,
      description: `基于以下内容，写一段吸引人的视频描述：\n${input}`
    }

    return {
      type,
      prompt: promptTemplates[type] || promptTemplates.title,
      result: `[占位] 请配置 AI API 密钥后生效\n\n参考提示：\n${promptTemplates[type] || promptTemplates.title}`
    }
  }

  /**
   * 配置 AI 提供商
   */
  configure (provider, apiKey, model) {
    this.provider = { provider, apiKey, model }
  }
}

module.exports = { AIGenerator }
