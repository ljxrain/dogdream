# 开发服务器监控脚本
Write-Host "🔍 开发服务器监控启动..." -ForegroundColor Cyan
Write-Host "此脚本将持续监控开发服务器状态" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止监控" -ForegroundColor Green
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

$logFile = "dev-server-monitor.log"
$startTime = Get-Date

function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "监控开始 - $startTime" "Green"

try {
    while ($true) {
        # 检查Node.js进程
        $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
        $nodeCount = if ($nodeProcesses) { $nodeProcesses.Count } else { 0 }
        
        # 检查端口5173
        $port5173 = netstat -an | Select-String ":5173" | Measure-Object | Select-Object -ExpandProperty Count
        
        # 检查PostgreSQL
        $pgService = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
        $pgStatus = if ($pgService) { $pgService.Status } else { "未安装" }
        
        # 内存使用情况
        $totalMemory = (Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize / 1MB
        $availableMemory = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB
        $memoryUsage = [math]::Round(($totalMemory - $availableMemory) / $totalMemory * 100, 1)
        
        # 状态报告
        $status = @(
            "Node进程: $nodeCount 个",
            "端口5173: $port5173 个连接",
            "PostgreSQL: $pgStatus",
            "内存使用: $memoryUsage%"
        ) -join " | "
        
        Write-Log $status
        
        # 异常检测
        if ($nodeCount -eq 0) {
            Write-Log "⚠️ 警告: 没有Node.js进程在运行！" "Red"
        } elseif ($nodeCount -gt 1) {
            Write-Log "⚠️ 警告: 检测到多个Node.js进程 ($nodeCount 个)！" "Yellow"
        }
        
        if ($port5173 -eq 0) {
            Write-Log "⚠️ 警告: 端口5173没有活动连接！" "Red"
        }
        
        if ($pgStatus -ne "Running") {
            Write-Log "⚠️ 警告: PostgreSQL服务未运行！" "Yellow"
        }
        
        if ($memoryUsage -gt 90) {
            Write-Log "⚠️ 警告: 内存使用率过高 ($memoryUsage%)！" "Red"
        }
        
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Log "监控异常停止: $($_.Exception.Message)" "Red"
} finally {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-Log "监控结束 - 运行时长: $($duration.ToString('hh\:mm\:ss'))" "Green"
}

Write-Host "`n📋 监控日志已保存到: $logFile" -ForegroundColor Cyan 