# 自动化SSH密钥部署脚本
# PowerShell脚本用于自动部署狗狗造梦家到腾讯云

param(
    [string]$ServerIP = "49.232.220.223",
    [string]$Username = "root",
    [string]$KeyPath = "$env:USERPROFILE\.ssh\dreamhome_key"
)

Write-Host "🚀 开始自动化部署狗狗造梦家到腾讯云服务器" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 检查SSH密钥是否存在
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ SSH密钥不存在: $KeyPath" -ForegroundColor Red
    Write-Host "请先运行: ssh-keygen -t rsa -b 4096 -C 'dreamhome-deploy' -f ~/.ssh/dreamhome_key" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ SSH密钥已找到: $KeyPath" -ForegroundColor Green

# 检查部署包是否存在
$DeployPackage = "dreamhome-deploy-20250618_125151.tar.gz"
if (-not (Test-Path $DeployPackage)) {
    Write-Host "❌ 部署包不存在: $DeployPackage" -ForegroundColor Red
    Write-Host "请先运行: ./create-deploy-package.sh" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 部署包已找到: $DeployPackage" -ForegroundColor Green

# 步骤1: 复制SSH公钥到服务器
Write-Host "📋 步骤1: 配置SSH密钥认证..." -ForegroundColor Blue
try {
    # 读取公钥内容
    $PublicKey = Get-Content "$KeyPath.pub" -Raw
    
    # 将公钥添加到服务器的authorized_keys
    $SSHCommand = "mkdir -p ~/.ssh && echo `"$PublicKey`" >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
    
    Write-Host "正在配置SSH密钥认证..." -ForegroundColor Yellow
    # 这里需要输入一次密码来配置SSH密钥
    ssh $Username@$ServerIP $SSHCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH密钥配置成功" -ForegroundColor Green
    } else {
        Write-Host "❌ SSH密钥配置失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH密钥配置过程中出错: $_" -ForegroundColor Red
    exit 1
}

# 步骤2: 测试SSH密钥登录
Write-Host "📋 步骤2: 测试SSH密钥登录..." -ForegroundColor Blue
try {
    ssh -i $KeyPath -o ConnectTimeout=10 -o StrictHostKeyChecking=no $Username@$ServerIP "echo 'SSH密钥登录测试成功'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SSH密钥登录测试成功" -ForegroundColor Green
    } else {
        Write-Host "❌ SSH密钥登录测试失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH密钥登录测试失败: $_" -ForegroundColor Red
    exit 1
}

# 步骤3: 上传部署包
Write-Host "📋 步骤3: 上传部署包..." -ForegroundColor Blue
try {
    scp -i $KeyPath $DeployPackage $Username@${ServerIP}:/opt/
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 部署包上传成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 部署包上传失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 部署包上传失败: $_" -ForegroundColor Red
    exit 1
}

# 步骤4: 上传部署脚本
Write-Host "📋 步骤4: 上传部署脚本..." -ForegroundColor Blue
try {
    scp -i $KeyPath deploy-to-tencent.sh $Username@${ServerIP}:/opt/
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 部署脚本上传成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 部署脚本上传失败" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 部署脚本上传失败: $_" -ForegroundColor Red
    exit 1
}

# 步骤5: 远程执行部署
Write-Host "📋 步骤5: 执行远程部署..." -ForegroundColor Blue
try {
    $RemoteCommands = @(
        "cd /opt",
        "tar -xzf $DeployPackage",
        "chmod +x deploy-to-tencent.sh",
        "./deploy-to-tencent.sh"
    )
    
    $CommandString = $RemoteCommands -join " && "
    
    ssh -i $KeyPath $Username@$ServerIP $CommandString
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 远程部署执行完成" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 远程部署可能需要手动配置" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 远程部署执行失败: $_" -ForegroundColor Red
}

# 步骤6: 显示访问信息
Write-Host "📋 步骤6: 部署完成信息" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "🌐 网站访问地址: http://$ServerIP" -ForegroundColor Yellow
Write-Host "🔧 SSH连接命令: ssh -i $KeyPath $Username@$ServerIP" -ForegroundColor Yellow
Write-Host "📱 手机访问地址: http://$ServerIP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "📝 后续配置步骤:" -ForegroundColor Blue
Write-Host "1. 登录服务器配置豆包API密钥" -ForegroundColor White
Write-Host "2. 检查服务状态: pm2 status" -ForegroundColor White
Write-Host "3. 查看日志: pm2 logs dreamhome" -ForegroundColor White
Write-Host "4. 重启服务: pm2 restart dreamhome" -ForegroundColor White 