# 快速切换到PostgreSQL数据库脚本

Write-Host "🔄 正在切换到PostgreSQL数据库..." -ForegroundColor Green

# 1. 备份当前SQLite数据
if (Test-Path "./dev.db") {
    Write-Host "📦 备份SQLite数据..." -ForegroundColor Yellow
    node migrate-to-postgresql.js
}

# 2. 更新Prisma schema
Write-Host "🔧 更新Prisma schema..." -ForegroundColor Yellow
$schemaPath = "prisma/schema.prisma"
$schemaContent = Get-Content $schemaPath -Raw

# 替换数据源配置
$newSchemaContent = $schemaContent -replace 'provider = "sqlite"', 'provider = "postgresql"'
$newSchemaContent = $newSchemaContent -replace 'url\s*=\s*"file:./dev.db"', 'url = env("DATABASE_URL")'

Set-Content $schemaPath $newSchemaContent

# 3. 更新.env文件
Write-Host "⚙️ 更新环境配置..." -ForegroundColor Yellow
$envContent = @"
# 数据库配置 - PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/dreamhome_db

# JWT认证配置
JWT_SECRET=dream-home-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# 豆包API配置
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_VISION_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_IMAGE_ENDPOINT=https://visual.volcengineapi.com

# 开发环境标识
NODE_ENV=development
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

# 4. 重新生成Prisma客户端
Write-Host "🔨 重新生成Prisma客户端..." -ForegroundColor Yellow
npx prisma generate

# 5. 推送数据库结构
Write-Host "📤 推送数据库结构..." -ForegroundColor Yellow
npx prisma db push

Write-Host "✅ 切换完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Cyan
Write-Host "1. 确保PostgreSQL服务正在运行" -ForegroundColor White
Write-Host "2. 如果需要，更新.env文件中的数据库连接字符串" -ForegroundColor White
Write-Host "3. 运行: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示：如果连接失败，请参考 setup-cloud-db.md 配置云数据库" -ForegroundColor Yellow 