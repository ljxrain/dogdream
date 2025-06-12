# 清理所有开发服务器进程
Write-Host "🔧 清理重复的开发服务器进程..." -ForegroundColor Red

# 检查当前Node.js进程
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现 $($nodeProcesses.Count) 个Node.js进程:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table ProcessName, Id, CPU, WorkingSet -AutoSize
    
    Write-Host "`n正在终止所有Node.js进程..." -ForegroundColor Red
    taskkill /f /im node.exe
    Start-Sleep -Seconds 2
    
    # 验证清理结果
    $remainingProcesses = Get-Process node -ErrorAction SilentlyContinue
    if ($remainingProcesses) {
        Write-Host "❌ 仍有 $($remainingProcesses.Count) 个进程未清理" -ForegroundColor Red
        $remainingProcesses | Format-Table ProcessName, Id -AutoSize
    } else {
        Write-Host "✅ 所有Node.js进程已清理完成" -ForegroundColor Green
    }
} else {
    Write-Host "✅ 没有发现Node.js进程" -ForegroundColor Green
}

# 检查端口占用
Write-Host "`n🔌 检查常用端口占用情况..." -ForegroundColor Yellow
$ports = @("5173", "5174", "5175", "5176", "5177", "5178", "5179")
foreach ($port in $ports) {
    $portCheck = netstat -an | Select-String ":$port"
    if ($portCheck) {
        Write-Host "端口 $port 被占用" -ForegroundColor Red
    }
}

Write-Host "`n🎯 清理完成！现在可以安全启动开发服务器" -ForegroundColor Green
Write-Host "使用命令: .\start-dev-safe.ps1" -ForegroundColor Cyan 