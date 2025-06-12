# Quick Database Status Check
Write-Host "Checking PostgreSQL Database Status..." -ForegroundColor Green

# Check if PostgreSQL process is running
$pgProcesses = Get-Process postgres* -ErrorAction SilentlyContinue
if ($pgProcesses) {
    Write-Host "PostgreSQL processes found: $($pgProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "No PostgreSQL processes running!" -ForegroundColor Red
    exit 1
}

# Test database connection
Write-Host "Testing database connection to 'dreamhome'..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = "postgresql://postgres:password@localhost:5432/dreamhome"
    $testResult = node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.user.count().then(count => {
            console.log('Database connection OK. User count:', count);
            process.exit(0);
        }).catch(err => {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        });
    " 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "Database connection failed: $testResult" -ForegroundColor Red
    }
} catch {
    Write-Host "Error testing connection: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Database status check completed!" -ForegroundColor Green 