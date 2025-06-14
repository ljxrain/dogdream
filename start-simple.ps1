# 造梦者网�?- 简单启动脚�?(无监控，无冲�?
Write-Host "🚀 启动造梦者网�?.." -ForegroundColor Green

# 清理旧进�?
Write-Host "🧹 清理旧进�?.." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 直接设置环境变量 (不依赖文�?
Write-Host "⚙️ 设置环境变量..." -ForegroundColor Yellow
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/dreamhome"
$env:NODE_ENV = "development"
$env:PUBLIC_APP_URL = "http://127.0.0.1:5173"
$env:DOUBAO_API_KEY = "97e3922f-c817-47d3-8690-6a940a06081f"
$env:DOUBAO_CHAT_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
$env:DOUBAO_IMAGE_API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
$env:DOUBAO_VISION_MODEL_ID = "ep-20250609024414-fwnn2"
$env:DOUBAO_IMAGE_MODEL_ID = "ep-m-20250609014544-4xckt"

Write-Host "�?环境变量已设�? -ForegroundColor Green
Write-Host "🌐 访问地址: http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "🛑 �?Ctrl+C 停止服务�? -ForegroundColor Gray

# 启动开发服务器
npm run dev 
