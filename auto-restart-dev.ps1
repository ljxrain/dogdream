# 自动重启开发服务器脚本
Write-Host "🔄 自动重启开发服务器..." -ForegroundColor Cyan

function Test-DevServerHealth {
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
    $nodeCount = if ($nodeProcesses) { $nodeProcesses.Count } else { 0 }
    
    $port5173 = netstat -an | Select-String ":5173" | Measure-Object | Select-Object -ExpandProperty Count
    
    # 检查是否有多个进程或没有进程
    if ($nodeCount -eq 0) {
        return @{ Status = "NoProcess"; Message = "没有开发服务器进程" }
    } elseif ($nodeCount -gt 1) {
        return @{ Status = "MultipleProcess"; Message = "检测到 $nodeCount 个重复进程" }
    } elseif ($port5173 -eq 0) {
        return @{ Status = "NoPort"; Message = "端口5173没有活动连接" }
    } else {
        return @{ Status = "Healthy"; Message = "开发服务器运行正常" }
    }
}

function Restart-DevServer {
    Write-Host "🔧 重启开发服务器..." -ForegroundColor Yellow
    
    # 清理所有Node.js进程
    Write-Host "1. 清理现有进程..." -ForegroundColor Gray
    taskkill /f /im node.exe 2>$null
    Start-Sleep -Seconds 3
    
    # 设置环境变量
    Write-Host "2. 设置环境变量..." -ForegroundColor Gray
    $env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
    $env:NODE_ENV = "development"
    
    # 启动开发服务器
    Write-Host "3. 启动开发服务器..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-Command", "cd D:\dream; npm run dev" -WindowStyle Minimized
    
    Start-Sleep -Seconds 5
    
    # 验证启动
    $health = Test-DevServerHealth
    if ($health.Status -eq "Healthy") {
        Write-Host "✅ 开发服务器重启成功" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ 重启失败: $($health.Message)" -ForegroundColor Red
        return $false
    }
}

# 主循环
$maxAttempts = 3
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "`n🔍 第 $attempt 次检查服务器状态..." -ForegroundColor Cyan
    
    $health = Test-DevServerHealth
    Write-Host "状态: $($health.Message)" -ForegroundColor Yellow
    
    if ($health.Status -eq "Healthy") {
        Write-Host "✅ 开发服务器运行正常！" -ForegroundColor Green
        Write-Host "访问地址: http://localhost:5173" -ForegroundColor Cyan
        break
    } else {
        Write-Host "⚠️ 检测到问题，正在重启..." -ForegroundColor Red
        
        if (Restart-DevServer) {
            Write-Host "✅ 重启成功！" -ForegroundColor Green
            Write-Host "访问地址: http://localhost:5173" -ForegroundColor Cyan
            break
        } else {
            Write-Host "❌ 第 $attempt 次重启失败" -ForegroundColor Red
            if ($attempt -lt $maxAttempts) {
                Write-Host "等待5秒后重试..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
}

if ($attempt -ge $maxAttempts) {
    Write-Host "`n❌ 自动重启失败，请手动检查：" -ForegroundColor Red
    Write-Host "1. 运行: .\kill-all-dev-servers.ps1" -ForegroundColor Yellow
    Write-Host "2. 然后运行: .\start-dev-safe.ps1" -ForegroundColor Yellow
} 