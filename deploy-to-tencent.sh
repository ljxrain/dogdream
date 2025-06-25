#!/bin/bash

# 腾讯云服务器部署脚本 - 狗狗造梦家
# 使用方法：./deploy-to-tencent.sh

echo "🚀 狗狗造梦家 - 腾讯云部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 设置变量
PROJECT_NAME="dreamhome"
PROJECT_DIR="/opt/$PROJECT_NAME"
SERVICE_NAME="dreamhome"
PORT=3000

echo "📋 部署配置："
echo "   项目名称: $PROJECT_NAME"
echo "   安装目录: $PROJECT_DIR"
echo "   服务端口: $PORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 系统环境检查和准备
echo "🔧 步骤1: 系统环境准备..."

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git unzip build-essential

# 2. 安装Node.js 18
echo "📦 步骤2: 安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js版本: $(node --version)"
echo "✅ NPM版本: $(npm --version)"

# 3. 安装PostgreSQL
echo "🗄️ 步骤3: 安装PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# 4. 配置数据库
echo "🔑 步骤4: 配置数据库..."
sudo -u postgres psql -c "CREATE DATABASE dreamhome;" 2>/dev/null || echo "数据库已存在"
sudo -u postgres psql -c "CREATE USER dreamuser WITH PASSWORD 'dream123456';" 2>/dev/null || echo "用户已存在"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dreamhome TO dreamuser;" 2>/dev/null

# 5. 创建项目目录
echo "📁 步骤5: 准备项目目录..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# 6. 部署项目文件
echo "📤 步骤6: 部署项目文件..."
cd $PROJECT_DIR

# 如果已有项目，备份
if [ -d ".git" ]; then
    echo "🔄 发现现有项目，进行更新..."
    git pull origin master
else
    echo "📥 首次部署，克隆项目..."
    # 这里需要替换为你的实际Git仓库地址
    echo "⚠️  请手动上传项目文件到 $PROJECT_DIR 目录"
    echo "   或者使用 git clone 你的仓库地址"
    read -p "按回车键继续（确保项目文件已上传）..."
fi

# 7. 安装依赖
echo "📦 步骤7: 安装项目依赖..."
npm install --production

# 8. 配置环境变量
echo "⚙️ 步骤8: 配置环境变量..."
cat > .env << EOF
# 数据库配置
DATABASE_URL="postgresql://dreamuser:dream123456@localhost:5432/dreamhome"

# JWT密钥（生产环境请使用更安全的密钥）
JWT_SECRET="your-super-secret-jwt-key-for-production"

# 豆包API配置（请替换为你的实际配置）
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_ACCESS_POINT_ID="your-access-point-id"

# 服务器配置
NODE_ENV=production
PORT=$PORT
HOST=0.0.0.0
EOF

echo "✅ 环境变量文件已创建"

# 9. 数据库迁移和种子
echo "🗃️ 步骤9: 数据库初始化..."
npx prisma generate
npx prisma db push
if [ -f "prisma/seed.cjs" ]; then
    node prisma/seed.cjs
fi

# 10. 构建项目
echo "🔨 步骤10: 构建项目..."
npm run build

# 11. 配置PM2进程管理
echo "🔄 步骤11: 配置PM2进程管理..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'build/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 创建日志目录
mkdir -p logs

# 12. 配置Nginx反向代理
echo "🌐 步骤12: 配置Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# 创建Nginx配置
sudo tee /etc/nginx/sites-available/$SERVICE_NAME << EOF
server {
    listen 80;
    server_name _;  # 替换为你的域名
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 13. 配置防火墙
echo "🔥 步骤13: 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 14. 启动服务
echo "🚀 步骤14: 启动服务..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 网站地址: http://你的服务器IP"
echo "🔧 管理命令:"
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs $SERVICE_NAME"
echo "   重启服务: pm2 restart $SERVICE_NAME"
echo "   停止服务: pm2 stop $SERVICE_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  重要提醒："
echo "1. 请在.env文件中配置正确的豆包API密钥"
echo "2. 如有域名，请修改Nginx配置中的server_name"
echo "3. 建议配置SSL证书以启用HTTPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 