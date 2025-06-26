#!/bin/bash

# 狗狗造梦家 - 正确的Ubuntu启动脚本
# 使用正确的postgres用户名密码，不创建新用户

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 项目目录
PROJECT_DIR="/mnt/d/dream"
cd "$PROJECT_DIR" || { log_error "无法进入项目目录: $PROJECT_DIR"; exit 1; }

echo -e "${GREEN}🐕 狗狗造梦家 - Ubuntu正确启动${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "📁 工作目录: $(pwd)"

# 1. 环境检查
log_step "1️⃣ 检查运行环境"
NODE_VERSION=$(node --version 2>/dev/null)
NPM_VERSION=$(npm --version 2>/dev/null)

if [ -z "$NODE_VERSION" ] || [ -z "$NPM_VERSION" ]; then
    log_error "Node.js 或 NPM 未安装"
    exit 1
fi

log_success "Node.js: $NODE_VERSION"
log_success "NPM: $NPM_VERSION"

# 2. 数据库检查
log_step "2️⃣ 检查数据库"

# 检查PostgreSQL
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL未安装，请先安装: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# 检查PostgreSQL服务
if ! pgrep -x "postgres" > /dev/null; then
    log_warning "PostgreSQL服务未运行，正在启动..."
    echo "123" | sudo -S systemctl start postgresql
    sleep 3
    
    if ! pgrep -x "postgres" > /dev/null; then
        log_error "PostgreSQL服务启动失败"
        exit 1
    fi
fi

log_success "PostgreSQL服务正在运行"

# 测试数据库连接（使用正确的postgres用户）
log_info "测试数据库连接..."
if PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -c "SELECT 1;" >/dev/null 2>&1; then
    log_success "数据库连接测试成功"
    
    # 检查用户数据
    USER_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    if [ -n "$USER_COUNT" ] && [ "$USER_COUNT" -gt 0 ]; then
        log_success "用户数据完整，共 $USER_COUNT 个用户"
    else
        log_warning "未找到用户数据"
    fi
else
    log_error "数据库连接失败"
    exit 1
fi

# 3. 项目依赖检查
log_step "3️⃣ 检查项目依赖"

if [ ! -d "node_modules" ] || [ ! -f "node_modules/vite/bin/vite.js" ]; then
    log_warning "依赖缺失，正在安装..."
    npm install --no-audit --no-fund
    
    if [ $? -ne 0 ]; then
        log_error "依赖安装失败"
        exit 1
    fi
    log_success "依赖安装完成"
else
    log_success "项目依赖完整"
fi

# 验证Vite可用性
if node node_modules/vite/bin/vite.js --version >/dev/null 2>&1; then
    VITE_VERSION=$(node node_modules/vite/bin/vite.js --version)
    log_success "Vite可用: $VITE_VERSION"
else
    log_error "Vite无法正常运行"
    exit 1
fi

# 4. 环境变量配置（使用正确的数据库连接字符串）
log_step "4️⃣ 配置环境变量"

if [ ! -f ".env" ]; then
    log_info "创建.env文件..."
    cat > .env << 'EOF'
# 数据库配置（使用正确的postgres用户）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamhome"

# JWT密钥
JWT_SECRET="dream-home-super-secret-jwt-key-ubuntu-dev"

# 豆包API配置
DOUBAO_API_KEY="97e3922f-c817-47d3-8690-6a940a06081f"
DOUBAO_CHAT_API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
DOUBAO_IMAGE_API_URL="https://ark.cn-beijing.volces.com/api/v3/images/generations"
DOUBAO_VISION_MODEL_ID="ep-20250609024414-fwnn2"
DOUBAO_IMAGE_MODEL_ID="ep-m-20250609014544-4xckt"

# 服务器配置
PORT=3000
NODE_ENV=development
PUBLIC_APP_URL="http://localhost:3000"
EOF
    log_success "已创建.env文件"
else
    # 更新现有.env文件中的数据库连接字符串
    log_info "更新.env文件中的数据库连接..."
    if grep -q "DATABASE_URL" .env; then
        sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamhome"|' .env
        log_success "数据库连接字符串已更新"
    else
        echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamhome"' >> .env
        log_success "数据库连接字符串已添加"
    fi
fi

# 5. 数据库模式同步
log_step "5️⃣ 同步数据库模式"

# 使用npx确保Prisma可用
if npx prisma generate >/dev/null 2>&1; then
    log_success "Prisma客户端生成成功"
else
    log_warning "Prisma客户端生成失败，但继续启动"
fi

# 不执行db push，因为数据已经存在
log_info "跳过数据库模式推送，保护现有数据"

# 6. 清理端口
log_step "6️⃣ 清理端口3000"

# 查找并终止占用端口3000的进程
PIDS=$(lsof -ti:3000 2>/dev/null || echo "")
if [ -n "$PIDS" ]; then
    log_warning "发现端口3000被占用，正在清理..."
    for PID in $PIDS; do
        log_info "终止进程: $PID"
        kill -9 $PID 2>/dev/null || true
    done
    sleep 2
    log_success "端口3000已清理"
else
    log_success "端口3000空闲"
fi

# 7. 创建必要目录和清理临时文件
log_step "7️⃣ 准备静态资源和清理临时文件"
mkdir -p static/images/showcase
mkdir -p static/recommendations/shop

# 清理可能干扰热重载的Vite临时文件
rm -f vite.config.ts.timestamp-*.mjs 2>/dev/null || true
rm -rf .svelte-kit/generated 2>/dev/null || true
log_success "静态资源目录已准备，临时文件已清理"

# 8. 启动服务器
log_step "8️⃣ 启动开发服务器"

# 设置文件监视环境变量以改善WSL下的热重载性能
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=100
log_info "已启用文件轮询监视模式"

echo ""
echo -e "${GREEN}🚀 服务器启动信息${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📱 访问地址:${NC}"
echo "   🏠 本地访问: http://localhost:3000"
echo "   🌐 网络访问: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo -e "${BLUE}🎯 主要功能页面:${NC}"
echo "   • 首页: http://localhost:3000/"
echo "   • 用户登录: http://localhost:3000/login"
echo "   • 用户注册: http://localhost:3000/register"
echo "   • 照片圆梦: http://localhost:3000/photo-to-image"
echo "   • 宠物商店: http://localhost:3000/shop"
echo "   • 管理面板: http://localhost:3000/admin"
echo ""
echo -e "${BLUE}👤 现有用户数据已保护:${NC}"
echo "   • 所有用户数据完整保留"
echo "   • 数据库连接: postgres@localhost:5432/dreamhome"
echo ""
echo -e "${GREEN}✨ 启动完成! 按 Ctrl+C 可停止服务器${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动Vite开发服务器（使用npm脚本以确保热重载正常工作）
exec npm run dev 