# Dream Home Website - Smart Startup Script
# 智能启动脚本：自动检测配置变化并同步备份
Write-Host "Starting Dream Home Website (Smart Mode)..." -ForegroundColor Green

# 第一步：智能环境检查和修复
Write-Host "Step 1: Environment check..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File check-env.ps1

# 第二步：检查.env文件是否比备份文件新
if ((Test-Path ".env") -and (Test-Path "env-backup.txt")) {
    $envTime = (Get-Item ".env").LastWriteTime
    $backupTime = (Get-Item "env-backup.txt").LastWriteTime
    
    if ($envTime -gt $backupTime) {
        Write-Host "Step 2: .env file is newer than backup, syncing..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -File sync-backup.ps1
    } else {
        Write-Host "Step 2: Backup files are up to date" -ForegroundColor Green
    }
} else {
    Write-Host "Step 2: Skipping backup sync (files not found)" -ForegroundColor Gray
}

# 第三步：设置环境变量
Write-Host "Step 3: Setting environment variables..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"

Write-Host "Environment configured successfully!" -ForegroundColor Green
Write-Host "Database: dreamhome (postgres/postgres)" -ForegroundColor Cyan
Write-Host "Access URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray

# 第四步：启动开发服务器
npm run dev 