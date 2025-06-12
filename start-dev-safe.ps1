# 安全启动开发服务器脚本
Write-Host "🚀 启动造梦家开发环境..." -ForegroundColor Cyan

# 1. 检查并清理现有的Node.js进程
Write-Host "`n🔍 检查现有的Node.js进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现 $($nodeProcesses.Count) 个Node.js进程正在运行" -ForegroundColor Red
    Write-Host "正在清理重复进程..." -ForegroundColor Yellow
    taskkill /f /im node.exe
    Start-Sleep -Seconds 2
    Write-Host "✅ 进程清理完成" -ForegroundColor Green
} else {
    Write-Host "✅ 没有发现现有的Node.js进程" -ForegroundColor Green
}

# 2. 检查PostgreSQL状态
Write-Host "`n🗄️ 检查PostgreSQL服务状态..." -ForegroundColor Yellow
$pgService = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL 17 正在运行" -ForegroundColor Green
} else {
    Write-Host "⚠️ PostgreSQL 17 未运行，正在启动..." -ForegroundColor Yellow
    try {
        Start-Service postgresql-x64-17
        Write-Host "✅ PostgreSQL 17 启动成功" -ForegroundColor Green
    } catch {
        Write-Host "❌ PostgreSQL 17 启动失败: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "请手动启动PostgreSQL服务" -ForegroundColor Yellow
    }
}

# 3. 设置环境变量
Write-Host "`n🔑 设置环境变量..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
Write-Host "✅ 环境变量设置完成" -ForegroundColor Green

# 4. 检查端口占用
Write-Host "`n🔌 检查端口5173占用情况..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String ":5173"
if ($portCheck) {
    Write-Host "⚠️ 端口5173被占用: $portCheck" -ForegroundColor Yellow
} else {
    Write-Host "✅ 端口5173可用" -ForegroundColor Green
}

# 5. 启动开发服务器
Write-Host "`n🎯 启动开发服务器..." -ForegroundColor Cyan
Write-Host "服务器将启动在: http://localhost:5173" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

try {
    npm run dev
} catch {
    Write-Host "`n❌ 开发服务器启动失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请检查npm和依赖是否正确安装" -ForegroundColor Yellow
}

Write-Host "`n🛑 开发服务器已停止" -ForegroundColor Red 