# Dream Home - Database Initialization Script
# 注意：此脚本只检查和创建数据库，不会影响现有数据
Write-Host "Initializing Dream Home Database..." -ForegroundColor Yellow
Write-Host "此脚本只创建数据库，不会删除或修改现有数据" -ForegroundColor Cyan

# 检查psql是否可用
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "PostgreSQL client found: $($psqlVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "psql command not found. Please add PostgreSQL bin to PATH" -ForegroundColor Red
    Write-Host "Typical path: C:\Program Files\PostgreSQL\17\bin" -ForegroundColor Yellow
    exit 1
}

# 检查数据库是否存在
Write-Host "Checking if database 'dreamhome' exists..." -ForegroundColor Yellow
$dbExists = & psql -U postgres -lqt 2>$null | Select-String "dreamhome"

if ($dbExists) {
    Write-Host "Database 'dreamhome' already exists" -ForegroundColor Green
    Write-Host "现有数据和用户账户将被保留" -ForegroundColor Cyan
    
    # 检查数据库中是否有表
    try {
        $tableCount = & psql -U postgres -d dreamhome -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
        if ($tableCount -and $tableCount.Trim() -gt 0) {
            Write-Host "发现 $($tableCount.Trim()) 个数据表，数据完整保留" -ForegroundColor Green
        }
    } catch {
        # 忽略表计数错误
    }
} else {
    Write-Host "Creating database 'dreamhome'..." -ForegroundColor Yellow
    Write-Host "这是首次创建，不会影响任何现有数据" -ForegroundColor Cyan
    try {
        & psql -U postgres -c "CREATE DATABASE dreamhome;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database 'dreamhome' created successfully" -ForegroundColor Green
        } else {
            Write-Host "Failed to create database. It might already exist." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Failed to create database: $_" -ForegroundColor Red
    }
}

# 验证连接
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    $testResult = & psql -U postgres -d dreamhome -c "SELECT 'Connection successful' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database connection test passed" -ForegroundColor Green
    } else {
        Write-Host "Database connection test failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not test database connection" -ForegroundColor Yellow
}

Write-Host "Database initialization completed!" -ForegroundColor Green
Write-Host "所有现有数据和用户账户都已安全保留" -ForegroundColor Green 