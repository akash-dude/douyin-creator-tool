"""
AI 生成接口路由 — 提示词 / 视频主题 / 参考文案 分离
"""
import os

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.ai_service import ai_service
from services.prompt_manager import prompt_manager

router = APIRouter()


# ── 请求模型 ──────────────────────────────

class GenerateRequest(BaseModel):
    # 提示词（三选一：prompt / prompt_id / 不传则用 type 内置模板）
    prompt: str | None = Field(
        None,
        description="自定义提示词模板（含 {topic} {reference} 占位符），不传则用内置模板",
    )
    prompt_id: str | None = Field(
        None,
        description="使用已保存的自定义提示词（按 ID 引用）",
    )

    # 内置类型选择（仅当没传 prompt/prompt_id 时生效）
    type: str | None = Field(
        None,
        description="内置生成类型: title/script/tags/description/comment。不传 prompt 且不传此值时默认 title",
    )

    # 内容（分离为 主题 + 参考文案）
    topic: str = Field(
        description="视频主题 / 想表达的核心内容",
        min_length=1,
        max_length=2000,
    )
    reference: str | None = Field(
        None,
        description="参考文案（可选）— 可放参考视频的文案、素材、灵感",
        max_length=5000,
    )

    # 高级参数
    system_prompt: str | None = Field(
        None,
        description="自定义系统提示词，不传则用默认",
    )
    temperature: float | None = Field(
        None, ge=0, le=2,
        description="生成温度 (0-2)，默认 0.8",
    )
    max_tokens: int | None = Field(
        None, ge=64, le=4096,
        description="最大生成长度，默认 1024",
    )


class ConfigureRequest(BaseModel):
    provider: str | None = Field(None, description="AI 提供商")
    api_key: str | None = Field(None, description="API 密钥")
    model: str | None = Field(None, description="模型名称")


# ── 提示词 CRUD 请求模型 ──────────────────

class CreatePromptRequest(BaseModel):
    name: str = Field(description="提示词名称", min_length=1, max_length=100)
    type: str = Field(description="关联类型: title/script/tags/description/comment/free")
    content: str = Field(
        description="提示词模板内容（含 {topic} {reference} 占位符）",
        min_length=1,
    )
    system_prompt: str | None = Field(None, description="系统提示词")


class UpdatePromptRequest(BaseModel):
    name: str | None = Field(None, description="提示词名称")
    type: str | None = Field(None, description="关联类型")
    content: str | None = Field(None, description="提示词模板内容")
    system_prompt: str | None = Field(None, description="系统提示词")


# ── AI 状态与配置 ─────────────────────────

@router.get("/status")
async def status():
    """获取 AI 服务状态"""
    return {
        "ok": True,
        "ready": ai_service.is_ready,
        "provider": os.getenv("AI_PROVIDER", "deepseek"),
    }


@router.post("/configure")
async def configure(req: ConfigureRequest):
    """配置 AI 提供商"""
    try:
        ai_service.configure(
            provider=req.provider,
            api_key=req.api_key,
            model=req.model,
        )
        return {"ok": True, "ready": ai_service.is_ready}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── 内置类型列表 ──────────────────────────

@router.get("/builtin-types")
async def builtin_types():
    """列出所有内置生成类型"""
    return {
        "ok": True,
        "types": ai_service.list_builtin_types(),
    }


# ── AI 生成（主接口） ──────────────────────

@router.post("/generate")
async def generate(req: GenerateRequest):
    """AI 内容生成

    三个关键入参:
      1. 提示词（prompt / prompt_id）— 告诉 AI 怎么生成
      2. 视频主题（topic）          — 核心创作内容
      3. 参考文案（reference）      — 可选，提供参考素材
    """
    try:
        # 解析提示词模板：prompt_id > prompt > type 内置模板
        prompt_template = req.prompt
        system_prompt = req.system_prompt
        gen_type = req.type or "title"  # 默认 title

        if req.prompt_id:
            saved = prompt_manager.get(req.prompt_id)
            if not saved:
                raise HTTPException(
                    status_code=404,
                    detail=f"提示词不存在: {req.prompt_id}",
                )
            prompt_template = saved["content"]
            if not system_prompt and saved.get("system_prompt"):
                system_prompt = saved["system_prompt"]
            gen_type = saved["type"]

        result = await ai_service.generate(
            type=gen_type,
            topic=req.topic,
            reference=req.reference or "",
            prompt_template=prompt_template,
            system_prompt=system_prompt,
            temperature=req.temperature,
            max_tokens=req.max_tokens,
        )
        return result

    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── 提示词管理 CRUD ───────────────────────

@router.get("/prompts")
async def list_prompts(
    type: str | None = Query(None, description="按类型筛选"),
):
    """列出所有提示词（含内置 + 自定义）"""
    return {
        "ok": True,
        "prompts": prompt_manager.list(type_filter=type),
    }


@router.get("/prompts/{prompt_id}")
async def get_prompt(prompt_id: str):
    """获取单个提示词详情"""
    p = prompt_manager.get(prompt_id)
    if not p:
        raise HTTPException(status_code=404, detail="提示词不存在")
    return {"ok": True, "prompt": p}


@router.post("/prompts")
async def create_prompt(req: CreatePromptRequest):
    """创建自定义提示词"""
    p = prompt_manager.add(
        name=req.name,
        type=req.type,
        content=req.content,
        system_prompt=req.system_prompt,
    )
    return {"ok": True, "prompt": p}


@router.put("/prompts/{prompt_id}")
async def update_prompt(prompt_id: str, req: UpdatePromptRequest):
    """更新自定义提示词"""
    try:
        kwargs = {k: v for k, v in req.model_dump().items() if v is not None}
        p = prompt_manager.update(prompt_id, **kwargs)
        if not p:
            raise HTTPException(status_code=404, detail="提示词不存在")
        return {"ok": True, "prompt": p}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str):
    """删除自定义提示词"""
    try:
        ok = prompt_manager.delete(prompt_id)
        if not ok:
            raise HTTPException(status_code=404, detail="提示词不存在")
        return {"ok": True}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
