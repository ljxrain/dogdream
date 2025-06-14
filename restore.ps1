Write-Host "正在恢复环境配置..." -ForegroundColor Yellow

Get-Content "env-backup.txt" | Where-Object { $_ -notmatch "^#" -and $_ -ne "" -and $_.Contains("=") } | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "环境配置已恢复" -ForegroundColor Green
Write-Host "数据库: dreamhome (postgres/postgres)" -ForegroundColor Cyan
Write-Host "访问地址: http://localhost:5173" -ForegroundColor Cyan 