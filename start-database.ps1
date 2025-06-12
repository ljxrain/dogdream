# PostgreSQL Auto Start Script
Write-Host "Starting PostgreSQL Database Service..." -ForegroundColor Green

# Stop all PostgreSQL processes
Write-Host "Cleaning existing PostgreSQL processes..." -ForegroundColor Yellow
Get-Process postgres* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to stop completely
Start-Sleep -Seconds 2

# Start PostgreSQL 17
Write-Host "Starting PostgreSQL 17..." -ForegroundColor Yellow
$pgDataPath = "C:\Program Files\PostgreSQL\17\data"

try {
    # Try to start PostgreSQL
    $process = Start-Process -FilePath "pg_ctl" -ArgumentList "-D `"$pgDataPath`" start" -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "PostgreSQL 17 started successfully!" -ForegroundColor Green
        
        # Wait for database to fully start
        Start-Sleep -Seconds 3
        
        # Test connection
        Write-Host "Testing database connection..." -ForegroundColor Yellow
        $testResult = psql -U postgres -d dreamhome -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database connection test successful!" -ForegroundColor Green
        } else {
            Write-Host "Database connection test failed, but service is started" -ForegroundColor Yellow
        }
    } else {
        Write-Host "PostgreSQL startup failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error during startup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Database startup completed!" -ForegroundColor Green 