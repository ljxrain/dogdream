# Safe Development Server Startup Script
Write-Host "Starting Dream Home Development Environment..." -ForegroundColor Cyan

# 1. Check and clean existing Node.js processes
Write-Host "`nChecking existing Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes running" -ForegroundColor Red
    Write-Host "Cleaning duplicate processes..." -ForegroundColor Yellow
    taskkill /f /im node.exe
    Start-Sleep -Seconds 2
    Write-Host "Process cleanup completed" -ForegroundColor Green
} else {
    Write-Host "No existing Node.js processes found" -ForegroundColor Green
}

# 2. Check PostgreSQL status
Write-Host "`nChecking PostgreSQL service status..." -ForegroundColor Yellow
$pgService = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "PostgreSQL 17 is running" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL 17 not running, starting..." -ForegroundColor Yellow
    try {
        Start-Service postgresql-x64-17
        Write-Host "PostgreSQL 17 started successfully" -ForegroundColor Green
    } catch {
        Write-Host "PostgreSQL 17 startup failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please start PostgreSQL service manually" -ForegroundColor Yellow
    }
}

# 3. Set environment variables
Write-Host "`nSetting environment variables..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
Write-Host "Environment variables set successfully" -ForegroundColor Green

# 4. Check port usage
Write-Host "`nChecking port 5173 usage..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String ":5173"
if ($portCheck) {
    Write-Host "Port 5173 is in use: $portCheck" -ForegroundColor Yellow
} else {
    Write-Host "Port 5173 is available" -ForegroundColor Green
}

# 5. Start development server
Write-Host "`nStarting development server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

try {
    npm run dev
} catch {
    Write-Host "`nDevelopment server startup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check if npm and dependencies are properly installed" -ForegroundColor Yellow
}

Write-Host "`nDevelopment server stopped" -ForegroundColor Red