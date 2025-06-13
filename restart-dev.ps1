# Restart Development Server
Write-Host "Restarting development server..." -ForegroundColor Cyan

# Kill all node processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 3

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:123456@localhost:5432/dream_home"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"

# Verify environment variables are set
Write-Host "Verifying environment variables..." -ForegroundColor Yellow
if ($env:JWT_SECRET) {
    Write-Host "✓ JWT_SECRET is set" -ForegroundColor Green
} else {
    Write-Host "✗ JWT_SECRET is missing" -ForegroundColor Red
}

if ($env:DATABASE_URL) {
    Write-Host "✓ DATABASE_URL is set" -ForegroundColor Green
} else {
    Write-Host "✗ DATABASE_URL is missing" -ForegroundColor Red
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgService = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
    Start-Service postgresql-x64-17 -ErrorAction SilentlyContinue
}

# Start development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

npm run dev 