@echo off
chcp 65001 >nul
title 造梦者网站 - 全自动启动

echo.
echo ====================================
echo 🚀 造梦者网站全自动启动系统
echo ====================================
echo 📍 当前目录: %CD%
echo ⏰ 启动时间: %DATE% %TIME%
echo.

echo 🔧 正在启动完整系统...
echo   - PostgreSQL 数据库服务器
echo   - 环境配置检查和修复
echo   - Node.js 开发服务器
echo.

REM 运行全自动启动脚本
powershell -ExecutionPolicy Bypass -File start-full-auto.ps1

echo.
echo ⏹️  所有服务已停止
pause 