# Restart Development Server
Write-Host "Restarting development server..." -ForegroundColor Cyan

# Kill all node processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 3

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"

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