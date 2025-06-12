# Dream Home Development Environment Startup Script
Write-Host "=== Dream Home Development Environment ===" -ForegroundColor Cyan
Write-Host "Starting development environment..." -ForegroundColor Green

# Step 1: Start PostgreSQL Database
Write-Host "`n1. Starting PostgreSQL Database..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File start-database.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start database. Exiting..." -ForegroundColor Red
    exit 1
}

# Step 2: Set Environment Variables
Write-Host "`n2. Setting environment variables..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/dreamhome"
Write-Host "DATABASE_URL set to: $env:DATABASE_URL" -ForegroundColor Green

# Step 3: Check Database Connection
Write-Host "`n3. Verifying database connection..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File check-database.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database connection failed. Exiting..." -ForegroundColor Red
    exit 1
}

# Step 4: Start Development Server
Write-Host "`n4. Starting development server..." -ForegroundColor Yellow
Write-Host "Development server will start on http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan

# Start the dev server
npm run dev 