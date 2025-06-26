# WSL诊断脚本
Write-Host "🔍 WSL问题诊断开始..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# 1. 检查WSL版本和状态
Write-Host "`n1️⃣ 检查WSL状态:" -ForegroundColor Yellow
wsl --version
wsl --list --verbose

# 2. 检查内存使用
Write-Host "`n2️⃣ 检查内存使用:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*wsl*" -or $_.ProcessName -like "*node*"} | Select-Object ProcessName, WorkingSet, CPU | Format-Table

# 3. 检查端口占用
Write-Host "`n3️⃣ 检查端口占用:" -ForegroundColor Yellow
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 4. 检查磁盘I/O
Write-Host "`n4️⃣ 检查WSL磁盘使用:" -ForegroundColor Yellow
wsl df -h

# 5. 检查网络连接
Write-Host "`n5️⃣ 检查网络状态:" -ForegroundColor Yellow
wsl ip addr show eth0

# 6. 检查系统资源
Write-Host "`n6️⃣ 检查系统资源:" -ForegroundColor Yellow
Get-Counter "\Memory\Available MBytes"
Get-Counter "\Processor(_Total)\% Processor Time"

Write-Host "`n✅ 诊断完成!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# 建议的修复步骤
Write-Host "`n💡 建议的修复步骤:" -ForegroundColor Cyan
Write-Host "1. 重启WSL: wsl --shutdown" -ForegroundColor White
Write-Host "2. 限制WSL内存: 创建 %USERPROFILE%\.wslconfig 文件" -ForegroundColor White
Write-Host "3. 禁用实时保护扫描WSL目录" -ForegroundColor White
Write-Host "4. 将项目移到WSL文件系统内部" -ForegroundColor White 