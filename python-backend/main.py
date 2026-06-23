"""
抖音创作辅助工具 — Python 后端入口
启动方式: python main.py
"""
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# 确保项目根目录在 sys.path 中
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

# 加载 .env 文件（支持 .env 或自定义路径）
env_file = os.getenv("BACKEND_ENV", str(BACKEND_DIR / ".env"))
if Path(env_file).exists():
    load_dotenv(env_file)
    print(f"[backend] 已加载配置: {env_file}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.ai import router as ai_router
from services.ai_service import ai_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动/关闭时执行"""
    print("[backend] 服务启动中...")
    try:
        ai_service.configure()
        if ai_service.is_ready:
            print(
                f"[backend] AI 服务已就绪: "
                f"provider={os.getenv('AI_PROVIDER', 'deepseek')}, "
                f"model={ai_service._model}"
            )
        else:
            print("[backend] AI 服务未配置。请设置 AI_API_KEY 环境变量")
            print("[backend] 或通过 POST /api/ai/configure 接口配置")
    except Exception as e:
        print(f"[backend] AI 初始化失败: {e}")
    yield
    print("[backend] 服务关闭")


app = FastAPI(
    title="抖音创作辅助工具 - 后端",
    description="AI 内容生成、数据分析等服务",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS: 允许 Electron 前端调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(ai_router, prefix="/api/ai")


@app.get("/api/health")
async def health():
    """健康检查"""
    return {
        "ok": True,
        "service": "douyin-creator-backend",
        "version": "0.1.0",
        "ai_ready": ai_service.is_ready,
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("BACKEND_PORT", "8765"))
    print(f"[backend] 启动服务 http://127.0.0.1:{port}")
    print(f"[backend] API 文档 http://127.0.0.1:{port}/docs")
    uvicorn.run(app, host="127.0.0.1", port=port)
