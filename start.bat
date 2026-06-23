@echo off
chcp 65001 >nul

cd /d "%~dp0"

echo ====================================
echo  抖音创作辅助工具 - 一键启动
echo ====================================
echo.

:: 1. 检查 Python 依赖
echo [1/3] 检查 Python 依赖...
cd python-backend
pip install -r requirements.txt -q 2>nul
cd ..

:: 2. 检查 .env 配置
if not exist python-backend\.env (
    echo [WARN] 未找到 python-backend\.env
    echo       请复制 .env.example 并填写 AI_API_KEY
    echo.
    copy /Y python-backend\.env.example python-backend\.env >nul 2>&1
)

:: 3. 启动 Electron 应用（自动拉起 Python 后端）
echo [2/3] 启动 AI 后端 + Electron...
echo.
npx electron .
