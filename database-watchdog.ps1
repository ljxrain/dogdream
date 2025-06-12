# PostgreSQL Database Watchdog - 数据库守护进程
# 持续监控数据库状态，发现停止时自动重启

param(
    [int]$CheckInterval = 30,  # 检查间隔（秒）
    [int]$MaxRetries = 3,      # 最大重试次数
    [switch]$Verbose           # 详细日志
)

Write-Host "=== PostgreSQL Database Watchdog Started ===" -ForegroundColor Cyan
Write-Host "检查间隔: $CheckInterval 秒" -ForegroundColor Yellow
Write-Host "最大重试: $MaxRetries 次" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止监控" -ForegroundColor Yellow
Write-Host "=====================================`n" -ForegroundColor Cyan

$retryCount = 0
$lastStatus = $null

function Test-DatabaseConnection {
    try {
        # 检查PostgreSQL进程
        $pgProcesses = Get-Process postgres* -ErrorAction SilentlyContinue
        if (-not $pgProcesses) {
            return $false, "No PostgreSQL processes found"
        }

        # 测试数据库连接
        $env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/dreamhome"
        $testResult = node -e "
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prisma.user.count().then(() => {
                console.log('OK');
                process.exit(0);
            }).catch(() => {
                console.log('FAILED');
                process.exit(1);
            });
        " 2>&1

        if ($LASTEXITCODE -eq 0) {
            return $true, "Database connection successful"
        } else {
            return $false, "Database connection failed: $testResult"
        }
    } catch {
        return $false, "Error testing connection: $($_.Exception.Message)"
    }
}

function Start-DatabaseService {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 尝试启动数据库..." -ForegroundColor Yellow
    
    try {
        # 清理僵尸进程
        Get-Process postgres* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        # 启动PostgreSQL
        $process = Start-Process -FilePath "pg_ctl" -ArgumentList "-D `"C:\Program Files\PostgreSQL\17\data`" start" -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 数据库启动成功！" -ForegroundColor Green
            Start-Sleep -Seconds 3  # 等待完全启动
            return $true
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 数据库启动失败！" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 启动异常: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 主监控循环
try {
    while ($true) {
        $isHealthy, $message = Test-DatabaseConnection
        $currentTime = Get-Date -Format 'HH:mm:ss'
        
        if ($isHealthy) {
            # 数据库正常
            if ($lastStatus -ne "HEALTHY") {
                Write-Host "[$currentTime] ✅ 数据库状态正常" -ForegroundColor Green
                $retryCount = 0  # 重置重试计数
            } elseif ($Verbose) {
                Write-Host "[$currentTime] ✅ 数据库运行正常" -ForegroundColor Green
            }
            $lastStatus = "HEALTHY"
        } else {
            # 数据库异常
            Write-Host "[$currentTime] ❌ 数据库异常: $message" -ForegroundColor Red
            
            if ($retryCount -lt $MaxRetries) {
                $retryCount++
                Write-Host "[$currentTime] 🔄 开始第 $retryCount 次重启尝试..." -ForegroundColor Yellow
                
                if (Start-DatabaseService) {
                    Write-Host "[$currentTime] ✅ 数据库重启成功！" -ForegroundColor Green
                    $retryCount = 0
                    $lastStatus = "RECOVERED"
                } else {
                    Write-Host "[$currentTime] ❌ 第 $retryCount 次重启失败" -ForegroundColor Red
                    $lastStatus = "FAILED"
                }
            } else {
                Write-Host "[$currentTime] 🚨 达到最大重试次数，需要手动处理！" -ForegroundColor Red
                $lastStatus = "CRITICAL"
                # 可以选择退出或继续监控
                # break
            }
        }
        
        # 等待下次检查
        Start-Sleep -Seconds $CheckInterval
    }
} catch {
    Write-Host "监控进程异常退出: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Write-Host "`n=== Database Watchdog Stopped ===" -ForegroundColor Cyan
} 