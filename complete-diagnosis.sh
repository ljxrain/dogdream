#!/bin/bash

echo "🔍 完整诊断检查 - 狗狗造梦家项目"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📋 第1步：检查Node.js和NPM版本"
echo "Node.js版本："
node -v
echo "NPM版本："
npm -v
echo ""

echo "📋 第2步：检查PostgreSQL服务状态"
sudo systemctl status postgresql --no-pager | head -10
echo ""

echo "📋 第3步：测试数据库连接"
echo "测试postgres用户连接："
PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -c "SELECT 1;" 2>&1 | head -5
echo "测试dreamhome用户连接："
PGPASSWORD=dreamhome123 psql -h localhost -U dreamhome -d dreamhome -c "SELECT 1;" 2>&1 | head -5
echo ""

echo "📋 第4步：检查项目文件结构"
echo "当前目录："
pwd
echo "项目文件："
ls -la | head -20
echo ""

echo "📋 第5步：检查依赖文件"
echo "node_modules目录："
ls -la node_modules/ 2>/dev/null | head -5
echo "vite文件："
ls -la node_modules/vite/bin/vite.js 2>/dev/null
echo ""

echo "📋 第6步：检查环境配置文件"
echo ".env文件："
ls -la .env 2>/dev/null
if [ -f .env ]; then
    echo ".env内容（隐藏敏感信息）："
    cat .env | sed 's/=.*/=***/' | head -10
fi
echo ""

echo "📋 第7步：检查启动脚本"
echo "启动脚本文件："
ls -la start-*.sh 2>/dev/null
echo ""

echo "📋 第8步：检查端口占用"
echo "端口3000占用情况："
netstat -tlnp | grep :3000 2>/dev/null || echo "端口3000未被占用"
echo ""

echo "📋 第9步：测试vite命令"
echo "测试直接运行vite："
if [ -f "node_modules/vite/bin/vite.js" ]; then
    echo "vite文件存在，测试运行（5秒超时）："
    timeout 5 node node_modules/vite/bin/vite.js --version 2>&1
    echo ""
else
    echo "❌ vite文件不存在！"
fi

echo "📋 第10步：测试package.json脚本"
echo "package.json中的scripts："
if [ -f "package.json" ]; then
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json不存在！"
fi
echo ""

echo "🔍 诊断完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 