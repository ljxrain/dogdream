@echo off
chcp 65001 >nul
title 狗狗造梦家 - 开发环境启动

echo.
echo ===============================================
echo           🐕 狗狗造梦家 - 开发环境启动
echo ===============================================
echo.

echo 📋 正在检查WSL环境...
wsl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ WSL未安装或未启用
    echo 请先安装WSL2和Ubuntu
    pause
    exit /b 1
)

echo ✅ WSL环境正常

echo 📦 正在启动Ubuntu环境并配置开发服务器...
echo 💡 如果是首次运行，可能需要几分钟安装依赖...
echo.

REM 启动修复版脚本
wsl bash -c "cd /mnt/d/dream && chmod +x start-ubuntu-fixed.sh && ./start-ubuntu-fixed.sh"

echo.
echo 🛑 服务器已停止
pause 