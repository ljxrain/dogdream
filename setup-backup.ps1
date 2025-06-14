# 造梦者网站 - 备份文件设置脚本
Write-Host "设置环境配置备份文件..." -ForegroundColor Yellow

if (!(Test-Path "env-backup.txt")) {
    Write-Host "创建 env-backup.txt 文件..." -ForegroundColor Yellow
    
    # 创建包含第3个密码选项的备份文件
    @"
# 造梦者网站环境配置备份 - 第3个密码选项
# 数据库: dreamhome (无下划线)
# 用户名: postgres
# 密码: postgres (第3个选项)

JWT_SECRET=dream-home-super-secret-jwt-key-2024
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dreamhome
NODE_ENV=development
PUBLIC_APP_URL=http://localhost:5173

# 配置说明：
# - 数据库用户: postgres
# - 数据库密码: postgres
# - 数据库名称: dreamhome
# - 本地端口: 5173
"@ | Out-File -FilePath "env-backup.txt" -Encoding UTF8

    Write-Host "env-backup.txt 文件已创建" -ForegroundColor Green
    Write-Host "使用第3个密码选项: postgres" -ForegroundColor Cyan
} else {
    Write-Host "env-backup.txt 文件已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "重要提醒:" -ForegroundColor Yellow
Write-Host "  env-backup.txt 包含真实密码，请妥善保管" -ForegroundColor Red
Write-Host "  此文件不会被Git忽略，可以正常提交" -ForegroundColor Green
Write-Host "  如需分享代码，请使用 env-backup-template.txt" -ForegroundColor Cyan 