# PostgreSQL 快速设置脚本
# 此脚本将下载并安装 PostgreSQL，创建数据库并配置用户

Write-Host "=== PostgreSQL 快速设置开始 ===" -ForegroundColor Green

# 检查是否以管理员身份运行
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "请以管理员身份运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查是否已安装 Chocolatey
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "正在安装 Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 安装 PostgreSQL
Write-Host "正在安装 PostgreSQL..." -ForegroundColor Yellow
choco install postgresql --yes --force

# 等待安装完成
Start-Sleep -Seconds 10

# 设置环境变量
$pgPath = "C:\Program Files\PostgreSQL\16\bin"
if (Test-Path $pgPath) {
    $env:PATH += ";$pgPath"
    [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$pgPath", [EnvironmentVariableTarget]::Machine)
    Write-Host "已添加 PostgreSQL 到 PATH" -ForegroundColor Green
} else {
    # 尝试查找其他版本
    $pgVersions = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory | Sort-Object Name -Descending
    if ($pgVersions) {
        $pgPath = "$($pgVersions[0].FullName)\bin"
        $env:PATH += ";$pgPath"
        [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$pgPath", [EnvironmentVariableTarget]::Machine)
        Write-Host "已添加 PostgreSQL 到 PATH: $pgPath" -ForegroundColor Green
    }
}

# 启动 PostgreSQL 服务
Write-Host "正在启动 PostgreSQL 服务..." -ForegroundColor Yellow
$service = Get-Service postgresql* | Select-Object -First 1
if ($service) {
    Start-Service $service.Name
    Write-Host "PostgreSQL 服务已启动" -ForegroundColor Green
} else {
    Write-Host "未找到 PostgreSQL 服务，可能需要手动配置" -ForegroundColor Red
}

# 创建数据库和用户
Write-Host "正在配置数据库..." -ForegroundColor Yellow

# 默认密码通常是安装时设置的，这里使用常见的默认设置
$env:PGPASSWORD = "password"

try {
    # 创建数据库
    & "$pgPath\createdb" -U postgres dreamhome_db
    Write-Host "数据库 dreamhome_db 创建成功" -ForegroundColor Green
    
    # 更新 .env 文件
    $envContent = @"
# 数据库配置
DATABASE_URL=postgresql://postgres:password@localhost:5432/dreamhome_db

# JWT认证配置
JWT_SECRET=dream-home-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# 豆包API配置
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_VISION_ENDPOINT=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_IMAGE_ENDPOINT=https://visual.volcengineapi.com
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env 文件已更新为 PostgreSQL 配置" -ForegroundColor Green
    
} catch {
    Write-Host "数据库配置失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "您可能需要手动设置 PostgreSQL 密码" -ForegroundColor Yellow
}

Write-Host "=== PostgreSQL 设置完成 ===" -ForegroundColor Green
Write-Host "如果遇到问题，请检查:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL 服务是否正在运行" -ForegroundColor Yellow
Write-Host "2. 端口 5432 是否被占用" -ForegroundColor Yellow
Write-Host "3. 防火墙设置" -ForegroundColor Yellow
Write-Host ""
Write-Host "接下来运行: npm run prisma:setup" -ForegroundColor Green 