#!/bin/bash

# 狗狗造梦家 - 完整Ubuntu启动脚本
# 确保所有依赖和资源都准备就绪

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查项目目录
PROJECT_DIR="/mnt/d/dream"
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
log_info "🚀 启动狗狗造梦家服务器 (Ubuntu环境)"
log_info "📁 工作目录: $(pwd)"

# 1. 环境信息检查
log_info "📋 检查环境信息..."
NODE_VERSION=$(node --version 2>/dev/null || echo "未安装")
NPM_VERSION=$(npm --version 2>/dev/null || echo "未安装")

echo "Node.js: $NODE_VERSION"
echo "NPM: $NPM_VERSION"

if [ "$NODE_VERSION" = "未安装" ] || [ "$NPM_VERSION" = "未安装" ]; then
    log_error "Node.js 或 NPM 未安装，请先安装 Node.js"
    exit 1
fi

# 2. 检查package.json
if [ ! -f "package.json" ]; then
    log_error "package.json 文件不存在"
    exit 1
fi

# 3. 智能依赖管理
log_info "📦 检查项目依赖..."

# 检查node_modules是否存在且完整
NEED_INSTALL=false

if [ ! -d "node_modules" ]; then
    log_warning "node_modules 目录不存在，需要安装依赖"
    NEED_INSTALL=true
elif [ ! -f "node_modules/.package-lock.json" ] && [ ! -f "package-lock.json" ]; then
    log_warning "依赖锁定文件不存在，建议重新安装"
    NEED_INSTALL=true
else
    # 检查关键依赖是否存在
    CRITICAL_DEPS=("@sveltejs/kit" "vite" "prisma" "@prisma/client" "bcryptjs" "jsonwebtoken")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ ! -d "node_modules/$dep" ]; then
            log_warning "关键依赖 $dep 缺失，需要重新安装"
            NEED_INSTALL=true
            break
        fi
    done
fi

# 安装依赖（如果需要）
if [ "$NEED_INSTALL" = true ]; then
    log_info "🔧 安装项目依赖..."
    
    # 清理可能损坏的node_modules
    if [ -d "node_modules" ]; then
        log_info "清理旧的 node_modules..."
        rm -rf node_modules
    fi
    
    # 安装依赖
    npm install --no-audit --no-fund
    
    if [ $? -eq 0 ]; then
        log_success "依赖安装成功"
    else
        log_error "依赖安装失败"
        exit 1
    fi
else
    log_success "依赖检查通过，跳过安装"
fi

# 4. 检查和准备静态资源
log_info "🖼️  检查静态资源..."

# 创建必要的目录
mkdir -p static/images/showcase
mkdir -p static/recommendations/shop

# 检查关键图片文件
REQUIRED_IMAGES=(
    "static/favicon.png"
    "static/images/showcase/user2.jpg"
    "static/images/showcase/user3.jpg"
    "static/images/showcase/user4.jpg"
    "static/images/showcase/feature1.png"
    "static/images/showcase/feature2.png"
    "static/images/showcase/feature3.png"
)

MISSING_IMAGES=()
for img in "${REQUIRED_IMAGES[@]}"; do
    if [ ! -f "$img" ]; then
        MISSING_IMAGES+=("$img")
    fi
done

# 如果有缺失的图片，尝试从Windows目录复制或创建占位符
if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
    log_warning "发现 ${#MISSING_IMAGES[@]} 个缺失的图片文件"
    
    # Windows图片源目录
    WIN_IMG_DIR="/mnt/d/图片"
    
    if [ -d "$WIN_IMG_DIR" ]; then
        log_info "尝试从 Windows 图片目录复制图片..."
        
        # 获取Windows目录中的图片文件
        WIN_IMAGES=($(find "$WIN_IMG_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | head -10))
        
        if [ ${#WIN_IMAGES[@]} -gt 0 ]; then
            # 复制图片并重命名
            for i in "${!MISSING_IMAGES[@]}"; do
                if [ $i -lt ${#WIN_IMAGES[@]} ]; then
                    src_img="${WIN_IMAGES[$i]}"
                    dest_img="${MISSING_IMAGES[$i]}"
                    
                    # 创建目标目录
                    mkdir -p "$(dirname "$dest_img")"
                    
                    # 复制并转换格式（如果需要）
                    if command -v convert >/dev/null 2>&1; then
                        convert "$src_img" "$dest_img" 2>/dev/null || cp "$src_img" "$dest_img"
                    else
                        cp "$src_img" "$dest_img"
                    fi
                    
                    if [ -f "$dest_img" ]; then
                        log_success "已复制: $(basename "$src_img") -> $dest_img"
                    fi
                fi
            done
        fi
    fi
    
    # 为仍然缺失的图片创建占位符
    for img in "${MISSING_IMAGES[@]}"; do
        if [ ! -f "$img" ]; then
            mkdir -p "$(dirname "$img")"
            
            # 创建简单的占位符图片（SVG转PNG）
            if command -v convert >/dev/null 2>&1; then
                # 使用ImageMagick创建占位符
                convert -size 400x300 xc:lightgray -pointsize 20 -fill black -gravity center -annotate +0+0 "占位符图片\n$(basename "$img")" "$img" 2>/dev/null || {
                    # 如果ImageMagick失败，创建简单文本文件作为占位符
                    echo "占位符图片: $(basename "$img")" > "$img.txt"
                    mv "$img.txt" "$img"
                }
            else
                # 创建文本占位符
                echo "占位符图片: $(basename "$img")" > "$img"
            fi
            
            log_info "已创建占位符: $img"
        fi
    done
fi

# 5. 数据库检查和准备
log_info "🗄️  检查数据库连接..."

# 检查Prisma客户端
if [ ! -d "node_modules/.prisma" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
    log_info "生成 Prisma 客户端..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        log_success "Prisma 客户端生成成功"
    else
        log_error "Prisma 客户端生成失败"
        exit 1
    fi
fi

# 6. 环境变量检查
log_info "🔐 检查环境变量..."

if [ ! -f ".env" ]; then
    log_warning ".env 文件不存在，创建默认配置..."
    cat > .env << EOF
# 数据库配置
DATABASE_URL="postgresql://dreamhome_user:dreamhome_pass@localhost:5432/dreamhome_db"

# JWT密钥
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 豆包API配置
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_ENDPOINT_ID="your-doubao-endpoint-id"

# 服务器配置
PORT=3000
NODE_ENV=development
EOF
    log_info "已创建默认 .env 文件，请根据需要修改配置"
fi

# 7. 网络连接检查
log_info "🌐 检查网络连接..."

# 检查基本网络连接
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    log_success "网络连接正常"
else
    log_warning "网络连接可能有问题，某些功能可能受影响"
fi

# 8. 端口检查
log_info "🔌 检查端口占用..."

PORT=3000
if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    log_warning "端口 $PORT 已被占用，尝试终止相关进程..."
    
    # 尝试找到并终止占用端口的进程
    PID=$(lsof -ti:$PORT 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        sleep 2
        log_info "已终止端口 $PORT 的占用进程"
    fi
fi

# 9. 启动服务器
log_info "🚀 启动开发服务器..."
log_info "📱 服务器将在以下地址可用:"
log_info "   - 本地访问: http://localhost:$PORT"
log_info "   - 网络访问: http://$(hostname -I | awk '{print $1}'):$PORT"
log_info ""
log_info "🎯 主要功能页面:"
log_info "   - 首页: http://localhost:$PORT/"
log_info "   - 登录: http://localhost:$PORT/login"
log_info "   - 注册: http://localhost:$PORT/register"
log_info "   - 照片圆梦: http://localhost:$PORT/photo-to-image"
log_info "   - 商店: http://localhost:$PORT/shop"
log_info "   - 管理面板: http://localhost:$PORT/admin"
log_info ""
log_info "👤 测试账户 (密码: 123456):"
log_info "   - admin@dreamhome.com (管理员)"
log_info "   - pm@dreamhome.com (产品经理)"
log_info "   - service@dreamhome.com (客服)"
log_info "   - user1@example.com (普通用户)"
log_info ""
log_success "✨ 所有检查完成，正在启动服务器..."
log_info "💡 按 Ctrl+C 可停止服务器"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 启动开发服务器
exec npm run dev -- --host 0.0.0.0 --port $PORT 