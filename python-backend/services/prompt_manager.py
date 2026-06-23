"""
提示词管理器 — 持久化存储用户自定义提示词
"""
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

# 存储文件路径（和 .env 同级）
DATA_DIR = Path(__file__).resolve().parent.parent / ".data"
PROMPTS_FILE = DATA_DIR / "custom_prompts.json"


class PromptManager:
    """用户自定义提示词的增删改查"""

    def __init__(self):
        self._prompts: list[dict] = []
        self._loaded = False

    # ── 持久化 ──────────────────────────────

    def _ensure_data_dir(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)

    def _load(self):
        if self._loaded:
            return
        self._ensure_data_dir()
        if PROMPTS_FILE.exists():
            try:
                raw = PROMPTS_FILE.read_text("utf-8")
                self._prompts = json.loads(raw)
            except (json.JSONDecodeError, OSError):
                self._prompts = []
        else:
            self._seed_defaults()
        self._loaded = True

    def _save(self):
        self._ensure_data_dir()
        PROMPTS_FILE.write_text(
            json.dumps(self._prompts, ensure_ascii=False, indent=2), "utf-8"
        )

    def _seed_defaults(self):
        """首次使用：写入内置示例提示词（使用 {topic} / {reference} 占位符）"""
        self._prompts = [
            {
                "id": "builtin_title",
                "name": "爆款标题",
                "type": "title",
                "content": (
                    "你是一位抖音爆款标题创作专家。\n"
                    "根据以下视频主题，生成**3个**吸引眼球的抖音标题。\n"
                    "要求：引发好奇、有情绪钩子、控制在25字以内。\n"
                    "格式：每行一个标题，不要序号。\n\n"
                    "视频主题：{topic}"
                    "{reference_section}"
                ),
                "system_prompt": "你是一个专业的抖音短视频创作助手。回复简洁实用，直接给出结果，不要多余解释。",
                "builtin": True,
                "created_at": None,
            },
            {
                "id": "builtin_script",
                "name": "口播脚本",
                "type": "script",
                "content": (
                    "你是一位抖音短视频脚本作者。\n"
                    "根据以下视频主题，写一段**30秒口播脚本**。\n"
                    "要求：开头3秒抓人、口语化、有转折、结尾引导互动。\n"
                    "格式：标注时间轴和画面建议。\n\n"
                    "视频主题：{topic}"
                    "{reference_section}"
                ),
                "system_prompt": "你是一个专业的抖音短视频创作助手。回复简洁实用，直接给出结果，不要多余解释。",
                "builtin": True,
                "created_at": None,
            },
            {
                "id": "builtin_tags",
                "name": "热门标签",
                "type": "tags",
                "content": (
                    "你是一位抖音SEO标签专家。\n"
                    "根据以下视频主题，推荐**10个热门抖音标签**（带#号）。\n"
                    "要求：包含3个大热门标签(千万级播放)、\n"
                    "3个中热门标签(百万级)、4个精准长尾标签。\n"
                    "格式：每行一个标签。\n\n"
                    "视频主题：{topic}"
                    "{reference_section}"
                ),
                "system_prompt": "你是一个专业的抖音短视频创作助手。回复简洁实用，直接给出结果，不要多余解释。",
                "builtin": True,
                "created_at": None,
            },
            {
                "id": "builtin_description",
                "name": "视频描述",
                "type": "description",
                "content": (
                    "你是一位抖音文案专家。\n"
                    "根据以下视频主题，写一段吸引人的**视频描述文案**。\n"
                    "要求：100字以内、有悬念/干货/情绪价值、\n"
                    "引导点赞评论关注、附带3-5个相关话题标签。\n\n"
                    "视频主题：{topic}"
                    "{reference_section}"
                ),
                "system_prompt": "你是一个专业的抖音短视频创作助手。回复简洁实用，直接给出结果，不要多余解释。",
                "builtin": True,
                "created_at": None,
            },
            {
                "id": "builtin_comment",
                "name": "互动评论",
                "type": "comment",
                "content": (
                    "你是一位抖音互动评论专家。\n"
                    "根据以下视频主题，生成**3条评论**。\n"
                    "要求：每条15字以内、有梗/有情绪/易引发回复。\n"
                    "格式：每行一条评论，不要序号。\n\n"
                    "视频主题：{topic}"
                    "{reference_section}"
                ),
                "system_prompt": "你是一个专业的抖音短视频创作助手。回复简洁实用，直接给出结果，不要多余解释。",
                "builtin": True,
                "created_at": None,
            },
        ]
        self._save()

    # ── CRUD ────────────────────────────────

    def list(self, type_filter: Optional[str] = None) -> list[dict]:
        """列出所有提示词，可按类型筛选"""
        self._load()
        if type_filter:
            return [p for p in self._prompts if p["type"] == type_filter]
        return list(self._prompts)

    def get(self, prompt_id: str) -> Optional[dict]:
        """获取单个提示词"""
        self._load()
        for p in self._prompts:
            if p["id"] == prompt_id:
                return dict(p)
        return None

    def add(self, name: str, type: str, content: str,
            system_prompt: Optional[str] = None) -> dict:
        """新增自定义提示词"""
        self._load()
        import uuid
        prompt = {
            "id": f"custom_{uuid.uuid4().hex[:12]}",
            "name": name,
            "type": type,
            "content": content,
            "system_prompt": system_prompt or "",
            "builtin": False,
            "created_at": datetime.now().isoformat(),
        }
        self._prompts.append(prompt)
        self._save()
        return dict(prompt)

    def update(self, prompt_id: str, **kwargs) -> Optional[dict]:
        """更新提示词（仅允许修改非 builtin 的字段）"""
        self._load()
        for p in self._prompts:
            if p["id"] == prompt_id:
                if p.get("builtin"):
                    raise PermissionError("内置提示词不可修改")
                for key in ("name", "type", "content", "system_prompt"):
                    if key in kwargs:
                        p[key] = kwargs[key]
                self._save()
                return dict(p)
        return None

    def delete(self, prompt_id: str) -> bool:
        """删除提示词（builtin 不可删）"""
        self._load()
        for i, p in enumerate(self._prompts):
            if p["id"] == prompt_id:
                if p.get("builtin"):
                    raise PermissionError("内置提示词不可删除")
                self._prompts.pop(i)
                self._save()
                return True
        return False


# 全局单例
prompt_manager = PromptManager()
