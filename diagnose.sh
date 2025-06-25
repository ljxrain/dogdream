#!/bin/bash

echo "🔍 狗狗造梦家 - 问题诊断"
echo "================================"

# 检查当前位置
echo "📍 当前目录: $(pwd)"

# 检查关键文件
echo "📦 检查package.json:"
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi

# 检查node_modules
echo "📚 检查依赖:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules 存在"
    if [ -f "node_modules/vite/bin/vite.js" ]; then
        echo "✅ vite 可执行文件存在"
    else
        echo "❌ vite 可执行文件不存在"
        exit 1
    fi
else
    echo "❌ node_modules 不存在"
    exit 1
fi

# 检查环境变量
echo "🌍 检查环境:"
echo "NODE_VERSION: $(node -v)"
echo "NPM_VERSION: $(npm -v)"

# 检查端口占用
echo "🔌 检查端口3000:"
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    echo "⚠️  端口3000被占用"
    echo "占用进程:"
    lsof -ti:3000 2>/dev/null | head -5
else
    echo "✅ 端口3000可用"
fi

# 尝试启动服务器
echo "🚀 尝试启动服务器..."
echo "使用命令: npm run dev"

# 设置环境变量
export NODE_ENV=development
export DATABASE_URL="postgresql://dreamhome:dreamhome123@localhost:5432/dreamhome"

# 启动服务器
npm run dev 