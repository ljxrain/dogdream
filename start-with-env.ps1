# 稳定的开发服务器启动脚本
# 确保环境变量在整个会话中持续存在

Write-Host "🚀 启动造梦家开发服务器" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 停止现有进程
Write-Host "🛑 停止现有Node.js进程..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 设置环境变量（使用[Environment]确保持久性）
Write-Host "🔧 设置环境变量..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("JWT_SECRET", "dream-home-super-secret-jwt-key-2024", "Process")
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://postgres:123456@localhost:5432/dream_home", "Process")
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "Process")
[Environment]::SetEnvironmentVariable("PUBLIC_APP_URL", "http://localhost:5173", "Process")

# 同时设置当前会话变量
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:123456@localhost:5432/dream_home"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"

# 验证环境变量
Write-Host "✅ 验证环境变量..." -ForegroundColor Green
$envVars = @{
    "JWT_SECRET" = $env:JWT_SECRET
    "DATABASE_URL" = $env:DATABASE_URL
    "NODE_ENV" = $env:NODE_ENV
}

foreach ($var in $envVars.GetEnumerator()) {
    if ($var.Value) {
        Write-Host "  ✓ $($var.Key): 已设置" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($var.Key): 未设置" -ForegroundColor Red
        exit 1
    }
}

# 检查PostgreSQL
Write-Host "🐘 检查PostgreSQL状态..." -ForegroundColor Yellow
try {
    $pgService = Get-Service postgresql-x64-17 -ErrorAction Stop
    if ($pgService.Status -eq "Running") {
        Write-Host "  ✓ PostgreSQL正在运行" -ForegroundColor Green
    } else {
        Write-Host "  🔄 启动PostgreSQL..." -ForegroundColor Yellow
        Start-Service postgresql-x64-17
        Start-Sleep -Seconds 3
        Write-Host "  ✓ PostgreSQL已启动" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  PostgreSQL服务未找到，请检查安装" -ForegroundColor Yellow
}

# 启动开发服务器
Write-Host "🌟 启动开发服务器..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📱 服务器地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🛑 按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan

# 启动npm dev
npm run dev 