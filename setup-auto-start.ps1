# Setup PostgreSQL Auto-Start on Windows Boot
Write-Host "Setting up PostgreSQL auto-start on system boot..." -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Create a scheduled task to start PostgreSQL on boot
$taskName = "PostgreSQL-AutoStart"
$scriptPath = "$PWD\start-database.ps1"

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing auto-start task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create new task
Write-Host "Creating new auto-start task..." -ForegroundColor Yellow
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -User "SYSTEM" -Force

Write-Host "PostgreSQL auto-start task created successfully!" -ForegroundColor Green
Write-Host "PostgreSQL will now start automatically when Windows boots." -ForegroundColor Cyan

# Also try to set the Windows service to auto-start
try {
    Set-Service -Name "postgresql-x64-17" -StartupType Automatic -ErrorAction SilentlyContinue
    Write-Host "PostgreSQL Windows service set to automatic startup." -ForegroundColor Green
} catch {
    Write-Host "Could not set Windows service to auto-start (this is OK, task scheduler will handle it)." -ForegroundColor Yellow
}

Write-Host "`nSetup completed! Your database should now start automatically." -ForegroundColor Green 