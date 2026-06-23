@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 启动 Python AI 后端...
python main.py
pause
