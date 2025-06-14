# Dream Home Environment Check Script
Write-Host "Checking environment configuration..." -ForegroundColor Yellow

$needRestore = $false
$reason = ""

# Check if .env file exists
if (!(Test-Path ".env")) {
    $needRestore = $true
    $reason = ".env file not found"
} else {
    # Check .env file content
    $envContent = Get-Content ".env" -ErrorAction SilentlyContinue
    $requiredKeys = @("JWT_SECRET", "DATABASE_URL", "NODE_ENV", "PUBLIC_APP_URL")
    
    $missingKeys = @()
    foreach ($key in $requiredKeys) {
        $found = $false
        foreach ($line in $envContent) {
            if ($line -match "^$key=") {
                $found = $true
                break
            }
        }
        if (!$found) {
            $missingKeys += $key
        }
    }
    
    if ($missingKeys.Count -gt 0) {
        $needRestore = $true
        $reason = "Missing keys: " + ($missingKeys -join ", ")
    }
    
    # Check database configuration (3rd password option)
    $dbUrlCorrect = $false
    foreach ($line in $envContent) {
        if ($line -match "DATABASE_URL=.*postgres:postgres.*dreamhome") {
            $dbUrlCorrect = $true
            break
        }
    }
    
    if (!$dbUrlCorrect) {
        $needRestore = $true
        $reason = "Database config incorrect (should use 3rd password option)"
    }
}

# Restore if needed
if ($needRestore) {
    Write-Host "Need to restore environment: $reason" -ForegroundColor Red
    
    if (Test-Path "env-backup.txt") {
        Write-Host "Restoring from backup..." -ForegroundColor Yellow
        Get-Content "env-backup.txt" | Where-Object { $_ -notmatch "^#" -and $_ -ne "" -and $_.Contains("=") } | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "Environment restored successfully" -ForegroundColor Green
        Write-Host "Database: dreamhome (postgres/postgres)" -ForegroundColor Cyan
        Write-Host "Access URL: http://localhost:5173" -ForegroundColor Cyan
    } else {
        Write-Host "Backup file env-backup.txt not found" -ForegroundColor Red
        Write-Host "Please ensure backup file exists in project root" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Environment configuration is OK" -ForegroundColor Green
} 