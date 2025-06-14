# Dream Home - Auto Backup Sync Script
# 自动同步.env文件到备份文件
Write-Host "Syncing .env to backup files..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Write-Host "No .env file found to backup" -ForegroundColor Red
    exit 1
}

# 读取当前.env文件
$envContent = Get-Content ".env"

# 创建备份文件头部注释
$backupHeader = @(
    "# 造梦者网站环境配置备份 - 第3个密码选项",
    "# 数据库: dreamhome (无下划线)",
    "# 用户名: postgres", 
    "# 密码: postgres (第3个选项)",
    ""
)

# 创建模板文件头部注释
$templateHeader = @(
    "# 造梦者网站环境配置模板 - 安全分享版本",
    "# 注意: 密码已隐藏，仅用于团队协作参考",
    "# 实际部署时请使用 env-backup.txt 中的真实配置",
    ""
)

# 更新真实备份文件 (包含真实密码)
Write-Host "Updating env-backup.txt..." -ForegroundColor Cyan
$backupContent = $backupHeader + $envContent + @(
    "",
    "# 配置说明：",
    "# - 数据库用户: postgres",
    "# - 数据库密码: postgres", 
    "# - 数据库名称: dreamhome",
    "# - 本地端口: 5173"
)
$backupContent | Out-File -FilePath "env-backup.txt" -Encoding UTF8

# 更新模板文件 (隐藏敏感信息)
Write-Host "Updating env-backup-template.txt..." -ForegroundColor Cyan
$templateContent = $templateHeader
foreach ($line in $envContent) {
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $value = $matches[2]
        
        # 隐藏敏感信息
        if ($key -eq "JWT_SECRET") {
            $templateContent += "$key=your-jwt-secret-here"
        } elseif ($key -eq "DATABASE_URL") {
            $templateContent += "$key=postgresql://username:password@localhost:5432/database_name"
        } else {
            $templateContent += $line
        }
    } else {
        $templateContent += $line
    }
}

$templateContent += @(
    "",
    "# 使用说明：",
    "# 1. 复制此文件为 .env",
    "# 2. 替换占位符为实际值",
    "# 3. 或直接使用 env-backup.txt 中的配置"
)

$templateContent | Out-File -FilePath "env-backup-template.txt" -Encoding UTF8

Write-Host "✅ Backup files updated successfully!" -ForegroundColor Green
Write-Host "📁 env-backup.txt - Real configuration (with passwords)" -ForegroundColor Cyan
Write-Host "📄 env-backup-template.txt - Safe template (passwords hidden)" -ForegroundColor Cyan 