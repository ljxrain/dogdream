@echo off
chcp 65001 >nul
title 更新环境配置备份

echo.
echo ====================================
echo 🔄 更新环境配置备份文件
echo ====================================
echo.

echo 正在同步 .env 文件到备份...
powershell -ExecutionPolicy Bypass -File sync-backup.ps1

echo.
echo ✅ 备份更新完成！
echo.
echo 📁 已更新的文件：
echo    - env-backup.txt (真实配置，包含密码)
echo    - env-backup-template.txt (安全模板，密码已隐藏)
echo.
pause 