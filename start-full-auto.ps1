# Dream Home - Full Auto Startup Script
# 完全自动化启动脚本：数据库 + 环境配置 + 开发服务器
Write-Host "=== Dream Home Full Auto Startup ===" -ForegroundColor Cyan
Write-Host ""

# 第一步：清理旧进程
Write-Host "Step 1: Cleaning up old processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes, terminating..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Node.js processes cleaned up" -ForegroundColor Green
} else {
    Write-Host "✅ No Node.js processes to clean up" -ForegroundColor Green
}

# 第二步：检查并启动PostgreSQL服务
Write-Host "Step 2: Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue

if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✅ PostgreSQL 17 is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting PostgreSQL 17 service..." -ForegroundColor Yellow
        try {
            Start-Service -Name "postgresql-x64-17"
            Start-Sleep -Seconds 3
            Write-Host "✅ PostgreSQL 17 started successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to start PostgreSQL service: $_" -ForegroundColor Red
            Write-Host "Trying alternative service names..." -ForegroundColor Yellow
            
            # 尝试其他可能的服务名
            $altServices = @("postgresql-17", "PostgreSQL", "postgresql")
            foreach ($serviceName in $altServices) {
                $altService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($altService -and $altService.Status -ne "Running") {
                    try {
                        Start-Service -Name $serviceName
                        Write-Host "✅ PostgreSQL started with service name: $serviceName" -ForegroundColor Green
                        break
                    } catch {
                        continue
                    }
                }
            }
        }
    }
} else {
    Write-Host "❌ PostgreSQL service not found. Please install PostgreSQL 17" -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# 第三步：初始化数据库
Write-Host "Step 3: Database initialization..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File init-database.ps1

# 第四步：智能环境配置检查
Write-Host "Step 4: Environment configuration check..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File check-env.ps1

# 第五步：检查并同步备份文件
if ((Test-Path ".env") -and (Test-Path "env-backup.txt")) {
    $envTime = (Get-Item ".env").LastWriteTime
    $backupTime = (Get-Item "env-backup.txt").LastWriteTime
    
    if ($envTime -gt $backupTime) {
        Write-Host "Step 5: Syncing backup files..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -File sync-backup.ps1
    } else {
        Write-Host "Step 5: Backup files are up to date" -ForegroundColor Green
    }
} else {
    Write-Host "Step 5: Skipping backup sync" -ForegroundColor Gray
}

# 第六步：设置环境变量
Write-Host "Step 6: Setting environment variables..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"

# 第七步：检查端口占用
Write-Host "Step 7: Checking port availability..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr :5173
if ($portInUse) {
    Write-Host "⚠️  Port 5173 is in use, Vite will try another port" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 5173 is available" -ForegroundColor Green
}

# 第八步：启动开发服务器
Write-Host "Step 8: Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 All systems ready! Starting Dream Home..." -ForegroundColor Green
Write-Host "🗄️  Database: dreamhome (postgres/postgres)" -ForegroundColor Cyan
Write-Host "🌐 Access URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📝 Press Ctrl+C to stop all services" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# 启动开发服务器
npm run dev 