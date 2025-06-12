# 修复Git仓库以便GitHub Desktop识别
Write-Host "正在修复Git仓库..." -ForegroundColor Green

# 设置Git路径
$gitPath = "C:\Program Files\Git\bin\git.exe"

# 确保在正确目录
Set-Location "D:\dream"

# 初始化Git仓库
& $gitPath init

# 配置用户信息
& $gitPath config user.name "Dream User"
& $gitPath config user.email "user@dream.com"

# 添加所有文件
& $gitPath add .

# 创建初始提交
& $gitPath commit -m "项目恢复后的初始提交"

Write-Host "Git仓库修复完成！" -ForegroundColor Green
Write-Host "现在可以在GitHub Desktop中重新添加这个仓库了。" -ForegroundColor Yellow
Write-Host "路径: D:\dream" -ForegroundColor Yellow

# 显示Git状态
& $gitPath status 