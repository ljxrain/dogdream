@echo off
chcp 65001 >nul
title 造梦者网站 - 服务管理

:menu
cls
echo.
echo ====================================
echo 🔧 造梦者网站服务管理中心
echo ====================================
echo.
echo 请选择操作：
echo.
echo 1. 🚀 全自动启动 (推荐)
echo 2. 🗄️  仅启动数据库服务
echo 3. 🌐 仅启动开发服务器
echo 4. 📊 检查服务状态
echo 5. ⏹️  停止所有服务
echo 6. 🔄 重启所有服务
echo 7. 📝 查看使用说明
echo 8. ❌ 退出
echo.
set /p choice=请输入选项 (1-8): 

if "%choice%"=="1" goto full_start
if "%choice%"=="2" goto db_only
if "%choice%"=="3" goto dev_only
if "%choice%"=="4" goto status
if "%choice%"=="5" goto stop_all
if "%choice%"=="6" goto restart_all
if "%choice%"=="7" goto help
if "%choice%"=="8" goto exit
goto menu

:full_start
echo.
echo 🚀 启动完整系统...
powershell -ExecutionPolicy Bypass -File start-full-auto.ps1
pause
goto menu

:db_only
echo.
echo 🗄️  启动数据库服务...
powershell -ExecutionPolicy Bypass -Command "Start-Service postgresql-x64-17; Write-Host 'PostgreSQL service started' -ForegroundColor Green"
pause
goto menu

:dev_only
echo.
echo 🌐 启动开发服务器...
powershell -ExecutionPolicy Bypass -File start-smart.ps1
pause
goto menu

:status
echo.
echo 📊 检查服务状态...
echo.
echo PostgreSQL 服务状态:
powershell -ExecutionPolicy Bypass -Command "Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue | Select-Object Name, Status | Format-Table"
echo.
echo Node.js 进程状态:
powershell -ExecutionPolicy Bypass -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, CPU | Format-Table"
echo.
echo 端口 5173 占用情况:
netstat -ano | findstr :5173
pause
goto menu

:stop_all
echo.
echo ⏹️  停止所有服务...
echo 停止 Node.js 进程...
taskkill /F /IM node.exe 2>nul
echo 停止 PostgreSQL 服务...
powershell -ExecutionPolicy Bypass -Command "Stop-Service postgresql-x64-17 -ErrorAction SilentlyContinue; Write-Host 'All services stopped' -ForegroundColor Yellow"
pause
goto menu

:restart_all
echo.
echo 🔄 重启所有服务...
echo 停止现有服务...
taskkill /F /IM node.exe 2>nul
powershell -ExecutionPolicy Bypass -Command "Stop-Service postgresql-x64-17 -ErrorAction SilentlyContinue"
timeout /t 3 /nobreak >nul
echo 启动完整系统...
powershell -ExecutionPolicy Bypass -File start-full-auto.ps1
pause
goto menu

:help
echo.
echo 📝 使用说明
echo ====================================
echo.
echo 🚀 全自动启动: 一键启动数据库和开发服务器
echo 🗄️  仅启动数据库: 只启动 PostgreSQL 服务
echo 🌐 仅启动开发服务器: 只启动 Node.js 开发服务器
echo 📊 检查服务状态: 查看所有服务的运行状态
echo ⏹️  停止所有服务: 停止数据库和开发服务器
echo 🔄 重启所有服务: 重启整个系统
echo.
echo 💡 提示:
echo - 首次使用建议选择 "全自动启动"
echo - 如果遇到问题，可以先 "停止所有服务" 再重新启动
echo - 开发服务器默认运行在 http://localhost:5173
echo.
pause
goto menu

:exit
echo.
echo 👋 感谢使用造梦者网站服务管理中心！
timeout /t 2 /nobreak >nul
exit 