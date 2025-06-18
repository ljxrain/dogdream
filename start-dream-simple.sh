#!/bin/bash

# 简单的狗狗造梦家启动脚本
echo "🐕 狗狗造梦家 - 快速启动"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 切换到项目目录
cd /mnt/d/dream

# 检查基本环境
echo "🔍 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ NPM 未安装"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查端口
PORT=3000
if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo "⚠️  端口 $PORT 已被占用，尝试终止..."
    PID=$(lsof -ti:$PORT 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
fi

echo "🚀 启动服务器..."
echo "📍 http://localhost:$PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 启动服务器
npm run dev -- --host 0.0.0.0 --port $PORT 