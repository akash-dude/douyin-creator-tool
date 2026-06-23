"""
AI 生成服务 — 支持 DeepSeek / OpenAI / 自定义 API
"""
import os
from openai import OpenAI


class AIService:
    """统一的 AI 生成服务，支持多提供商切换"""

    PROVIDERS = {
        "deepseek": {
            "base_url": "https://api.deepseek.com",
            "default_model": "deepseek-chat",
        },
        "openai": {
            "base_url": "https://api.openai.com/v1",
            "default_model": "gpt-4o-mini",
        },
        "moonshot": {
            "base_url": "https://api.moonshot.cn/v1",
            "default_model": "moonshot-v1-8k",
        },
        "siliconflow": {
            "base_url": "https://api.siliconflow.cn/v1",
            "default_model": "deepseek-ai/DeepSeek-V3",
        },
    }

    DEFAULT_SYSTEM_PROMPT = (
        "你是一个专业的抖音短视频创作助手。"
        "回复简洁实用，直接给出结果，不要多余解释。"
    )

    def __init__(self):
        self._client = None
        self._provider = None
        self._model = None
        self._ready = False

    @property
    def is_ready(self) -> bool:
        return self._ready

    def configure(
        self,
        provider: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
    ):
        provider = provider or os.getenv("AI_PROVIDER", "deepseek").lower()
        api_key = api_key or os.getenv("AI_API_KEY", "")
        model = model or os.getenv("AI_MODEL", "")

        if not api_key:
            self._ready = False
            return

        if provider not in self.PROVIDERS:
            raise ValueError(
                f"不支持的提供商: {provider}，可选: {', '.join(self.PROVIDERS)}"
            )

        info = self.PROVIDERS[provider]
        self._client = OpenAI(api_key=api_key, base_url=info["base_url"])
        self._provider = provider
        self._model = model or info["default_model"]
        self._ready = bool(api_key)

    def _ensure_ready(self):
        if not self._ready:
            raise RuntimeError(
                "AI 服务未配置，请先设置 AI_API_KEY 环境变量或通过配置页面填写"
            )

    # ── 内置提示词模板（使用 {topic} {reference} 占位符） ───

    PROMPT_TEMPLATES = {
        "title": (
            "你是一位抖音爆款标题创作专家。\n"
            "根据以下视频主题，生成**3个**吸引眼球的抖音标题。\n"
            "要求：引发好奇、有情绪钩子、控制在25字以内。\n"
            "格式：每行一个标题，不要序号。\n\n"
            "视频主题：{topic}"
            "{reference_section}"
        ),
        "script": (
            "你是一位抖音短视频脚本作者。\n"
            "根据以下视频主题，写一段**30秒口播脚本**。\n"
            "要求：开头3秒抓人、口语化、有转折、结尾引导互动。\n"
            "格式：标注时间轴和画面建议。\n\n"
            "视频主题：{topic}"
            "{reference_section}"
        ),
        "tags": (
            "你是一位抖音SEO标签专家。\n"
            "根据以下视频主题，推荐**10个热门抖音标签**（带#号）。\n"
            "要求：包含3个大热门标签(千万级播放)、\n"
            "3个中热门标签(百万级)、4个精准长尾标签。\n"
            "格式：每行一个标签。\n\n"
            "视频主题：{topic}"
            "{reference_section}"
        ),
        "description": (
            "你是一位抖音文案专家。\n"
            "根据以下视频主题，写一段吸引人的**视频描述文案**。\n"
            "要求：100字以内、有悬念/干货/情绪价值、\n"
            "引导点赞评论关注、附带3-5个相关话题标签。\n\n"
            "视频主题：{topic}"
            "{reference_section}"
        ),
        "comment": (
            "你是一位抖音互动评论专家。\n"
            "根据以下视频主题，生成**3条评论**。\n"
            "要求：每条15字以内、有梗/有情绪/易引发回复。\n"
            "格式：每行一条评论，不要序号。\n\n"
            "视频主题：{topic}"
            "{reference_section}"
        ),
    }

    # ── 模板格式化工具 ─────────────────────────

    @staticmethod
    def _format_prompt(template: str, topic: str, reference: str = "") -> str:
        """
        格式化提示词模板，支持以下占位符：
          {topic}            → 视频主题
          {reference}        → 参考文案
          {reference_section} → "参考文案：\n{reference}" (有参考时才输出)
          {input}            → 兼容旧的 {input}（等价于 topic + reference 拼接）
        """
        # 构建参考文案段落
        ref_section = ""
        if reference:
            ref_section = f"\n参考文案：\n{reference}"

        return template.format(
            topic=topic,
            reference=reference,
            reference_section=ref_section,
            input=f"{topic}\n{reference}" if reference else topic,
        )

    # ── 核心生成方法 ─────────────────────────

    async def generate(
        self,
        type: str,
        topic: str,
        reference: str = "",
        prompt_template: str | None = None,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> dict:
        """
        AI 内容生成

        Args:
            type: 生成类型（title/script/tags/description/comment）
            topic: 视频主题
            reference: 参考文案（可选）
            prompt_template: 自定义提示词模板，含 {topic} {reference} 占位符
                             不传则用内置模板
            system_prompt: 自定义系统提示词
            temperature: 生成温度 (0-2)，默认 0.8
            max_tokens: 最大生成长度，默认 1024
        """
        self._ensure_ready()

        # 1. 确定提示词模板并格式化
        if prompt_template:
            prompt = self._format_prompt(prompt_template, topic, reference)
        else:
            template = self.PROMPT_TEMPLATES.get(type)
            if not template:
                raise ValueError(
                    f"不支持的生成类型: {type}，可选: {', '.join(self.PROMPT_TEMPLATES)}"
                )
            prompt = self._format_prompt(template, topic, reference)

        # 2. 确定系统提示词
        sys_prompt = system_prompt if system_prompt else self.DEFAULT_SYSTEM_PROMPT

        # 3. 调用 AI
        try:
            resp = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature if temperature is not None else 0.8,
                max_tokens=max_tokens if max_tokens is not None else 1024,
            )

            result = resp.choices[0].message.content.strip()

            return {
                "ok": True,
                "type": type,
                "topic": topic,
                "reference": reference,
                "result": result,
                "provider": self._provider,
                "model": self._model,
            }

        except Exception as e:
            return {
                "ok": False,
                "type": type,
                "topic": topic,
                "reference": reference,
                "error": str(e),
            }

    # ── 内置模板列表 ──────────────────────────

    def list_builtin_types(self) -> list[dict]:
        """列出所有内置类型"""
        return [
            {"type": k, "preview": v[:60] + "..."}
            for k, v in self.PROMPT_TEMPLATES.items()
        ]


# 全局单例
ai_service = AIService()
