@echo off
chcp 65001 >nul
title 造梦者网站 - 一键启动

echo.
echo ====================================
echo 🚀 造梦者网站一键启动脚本
echo ====================================
echo 📍 当前目录: %CD%
echo ⏰ 启动时间: %DATE% %TIME%
echo.

echo 🔧 正在启动造梦者网站...
echo.

REM 智能检查并修复环境配置
powershell -ExecutionPolicy Bypass -File check-env.ps1

echo.
echo 🗄️  数据库: dreamhome (postgres/postgres)
echo 🌐 访问地址: http://localhost:5173
echo.

REM 设置环境变量并启动服务器
powershell -Command "$env:JWT_SECRET = 'dream-home-super-secret-jwt-key-2024'; $env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dreamhome'; $env:NODE_ENV = 'development'; $env:PUBLIC_APP_URL = 'http://localhost:5173'; npm run dev"

echo.
echo ⏹️  服务已停止
pause 