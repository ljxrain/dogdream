#!/bin/bash

echo "🔍 Ubuntu环境诊断 - 狗狗造梦家"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /mnt/d/dream

echo "1. 📍 当前目录和权限:"
pwd
ls -la start-ubuntu.sh

echo ""
echo "2. 🌐 网络配置检查:"
echo "本机IP地址:"
hostname -I
echo "WSL版本:"
cat /proc/version | head -1

echo ""
echo "3. 🗄️ 数据库状态:"
echo "PostgreSQL进程:"
pgrep -f postgres || echo "未找到PostgreSQL进程"
echo "PostgreSQL服务状态:"
systemctl is-active postgresql || echo "服务未激活"

echo ""
echo "4. 📦 Node.js环境:"
echo "Node版本: $(node --version)"
echo "NPM版本: $(npm --version)"
echo "Vite可执行性:"
if [ -f "node_modules/vite/bin/vite.js" ]; then
    echo "✅ Vite文件存在"
    node node_modules/vite/bin/vite.js --version
else
    echo "❌ Vite文件不存在"
fi

echo ""
echo "5. 🔌 端口检查:"
echo "端口3000占用情况:"
lsof -i:3000 2>/dev/null || echo "端口3000空闲"
echo "端口5173占用情况:"
lsof -i:5173 2>/dev/null || echo "端口5173空闲"

echo ""
echo "6. 🔐 环境变量:"
if [ -f ".env" ]; then
    echo "✅ .env文件存在"
    echo "DATABASE_URL配置:"
    grep "DATABASE_URL" .env || echo "未找到DATABASE_URL"
else
    echo "❌ .env文件不存在"
fi

echo ""
echo "7. 🧪 数据库连接测试:"
if PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ 数据库连接成功"
    USER_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    echo "用户数量: $USER_COUNT"
else
    echo "❌ 数据库连接失败"
    echo "尝试启动PostgreSQL..."
    echo "123" | sudo -S systemctl start postgresql
    sleep 2
    if PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ PostgreSQL启动后连接成功"
    else
        echo "❌ PostgreSQL启动后仍无法连接"
    fi
fi

echo ""
echo "8. 🚀 启动测试:"
echo "尝试启动服务器..."

# 清理端口
PIDS=$(lsof -ti:3000 2>/dev/null || echo "")
if [ -n "$PIDS" ]; then
    echo "清理端口3000占用进程: $PIDS"
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null || true
    done
    sleep 2
fi

# 启动服务器（后台运行）
echo "启动命令: node node_modules/vite/bin/vite.js dev --host 0.0.0.0 --port 3000"
nohup node node_modules/vite/bin/vite.js dev --host 0.0.0.0 --port 3000 > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo "Vite进程ID: $VITE_PID"

# 等待启动
echo "等待服务器启动..."
sleep 8

echo ""
echo "9. 🌐 服务器响应测试:"
echo "检查端口监听:"
lsof -i:3000 2>/dev/null || echo "端口3000未被监听"

echo "HTTP响应测试:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP响应正常 ($HTTP_CODE)"
    echo "页面内容预览:"
    curl -s http://localhost:3000 | head -3
else
    echo "❌ HTTP响应异常 ($HTTP_CODE)"
    echo "Vite日志:"
    tail -10 /tmp/vite.log 2>/dev/null || echo "无日志文件"
fi

echo ""
echo "10. 📊 最终状态:"
echo "进程状态:"
ps aux | grep -E "(node|vite)" | grep -v grep || echo "无相关进程"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 诊断完成！"
echo ""
echo "如果服务器正常启动，请访问:"
echo "🏠 http://localhost:3000"
echo "🌐 http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "如果仍有问题，请查看上述诊断信息。" 