# Dream Home Website Startup Script - Smart Version
Write-Host "Starting Dream Home Website..." -ForegroundColor Green

# Smart environment check and repair
powershell -ExecutionPolicy Bypass -File check-env.ps1

# Set environment variables
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://localhost:5173"

Write-Host "Environment variables set" -ForegroundColor Green
Write-Host "Database: dreamhome" -ForegroundColor Cyan
Write-Host "Password: postgres (3rd option)" -ForegroundColor Cyan
Write-Host "Access URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray

# Start development server
npm run dev 