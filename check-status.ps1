# Dream Home - 系统状态检查
Write-Host "=== 造梦者系统状态检查 ===" -ForegroundColor Cyan
Write-Host ""

# 检查端口5173
Write-Host "1. 检查开发服务器端口..." -ForegroundColor Yellow
$port5173 = netstat -ano | findstr :5173
if ($port5173) {
    Write-Host "✅ 端口5173正在使用中 - 开发服务器运行中" -ForegroundColor Green
    Write-Host "   $port5173" -ForegroundColor Gray
} else {
    Write-Host "❌ 端口5173未被占用 - 开发服务器未运行" -ForegroundColor Red
}

# 检查Node.js进程
Write-Host "2. 检查Node.js进程..." -ForegroundColor Yellow
$nodeProcesses = tasklist | findstr node
if ($nodeProcesses) {
    Write-Host "✅ Node.js进程运行中:" -ForegroundColor Green
    Write-Host "   $nodeProcesses" -ForegroundColor Gray
} else {
    Write-Host "❌ 没有Node.js进程运行" -ForegroundColor Red
}

# 检查数据库连接
Write-Host "3. 检查数据库连接..." -ForegroundColor Yellow
try {
    $dbTest = & psql -U postgres -d dreamhome -c "SELECT 'OK' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库连接正常" -ForegroundColor Green
    } else {
        Write-Host "❌ 数据库连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 数据库测试异常" -ForegroundColor Red
}

# 检查环境文件
Write-Host "4. 检查环境配置..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ .env文件不存在" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 系统状态总结 ===" -ForegroundColor Cyan
Write-Host "🌐 网站地址: http://localhost:5173" -ForegroundColor Green
Write-Host "🗄️  数据库: dreamhome (postgres/postgres)" -ForegroundColor Green
Write-Host "📝 如需停止服务器，请按 Ctrl+C" -ForegroundColor Yellow 