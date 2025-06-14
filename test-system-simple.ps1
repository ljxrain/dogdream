# Dream Home - 简化系统测试脚本
Write-Host "=== 造梦者系统测试 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 测试PostgreSQL连接
Write-Host "1. 测试数据库连接..." -ForegroundColor Yellow
try {
    $dbTest = & psql -U postgres -d dreamhome -c "SELECT 'Database OK' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 数据库连接成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 数据库连接失败" -ForegroundColor Red
        Write-Host "尝试创建数据库..." -ForegroundColor Yellow
        & psql -U postgres -c "CREATE DATABASE dreamhome;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 数据库创建成功" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ 数据库测试失败: $_" -ForegroundColor Red
}

# 2. 检查环境配置
Write-Host "2. 检查环境配置..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env 文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ .env 文件不存在" -ForegroundColor Red
}

# 3. 设置环境变量
Write-Host "3. 设置环境变量..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"
Write-Host "✅ 环境变量已设置" -ForegroundColor Green

# 4. 检查端口
Write-Host "4. 检查端口5173..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr :5173
if ($portInUse) {
    Write-Host "⚠️  端口5173被占用" -ForegroundColor Yellow
} else {
    Write-Host "✅ 端口5173可用" -ForegroundColor Green
}

# 5. 启动开发服务器
Write-Host "5. 启动开发服务器..." -ForegroundColor Yellow
Write-Host "🚀 启动造梦者网站..." -ForegroundColor Green
Write-Host "🌐 访问地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📝 按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host "================================" -ForegroundColor Gray
Write-Host ""

npm run dev 