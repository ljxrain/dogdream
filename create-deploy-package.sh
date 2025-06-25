#!/bin/bash

# 创建部署包脚本
echo "📦 创建狗狗造梦家部署包..."

# 设置包名和时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="dreamhome-deploy-${TIMESTAMP}.tar.gz"

echo "📋 包名: $PACKAGE_NAME"
echo "🗂️  正在打包核心文件..."

# 创建临时目录
TEMP_DIR="deploy_temp"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# 复制核心文件和目录
echo "📁 复制项目文件..."
cp -r src $TEMP_DIR/
cp -r static $TEMP_DIR/
cp -r prisma $TEMP_DIR/

# 复制配置文件
echo "⚙️ 复制配置文件..."
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/
cp svelte.config.js $TEMP_DIR/
cp vite.config.ts $TEMP_DIR/
cp tsconfig.json $TEMP_DIR/
cp tailwind.config.js $TEMP_DIR/
cp postcss.config.js $TEMP_DIR/
cp .eslintrc.cjs $TEMP_DIR/
cp .prettierrc $TEMP_DIR/

# 复制部署脚本
echo "🚀 复制部署脚本..."
cp deploy-to-tencent.sh $TEMP_DIR/
cp 小白版部署脚本.sh $TEMP_DIR/
cp 腾讯云网页版部署指南.md $TEMP_DIR/

# 复制启动脚本
echo "▶️ 复制启动脚本..."
cp start-ubuntu-complete.sh $TEMP_DIR/
cp start-dream-simple.sh $TEMP_DIR/

# 创建部署说明
cat > $TEMP_DIR/README-部署说明.md << 'EOF'
# 狗狗造梦家 - 腾讯云部署包

## 部署步骤

### 1. 上传文件
将此部署包上传到腾讯云服务器：
```bash
scp dreamhome-deploy-*.tar.gz root@你的服务器IP:/opt/
```

### 2. 解压部署包
```bash
cd /opt
tar -xzf dreamhome-deploy-*.tar.gz
cd dreamhome
```

### 3. 运行部署脚本
```bash
chmod +x deploy-to-tencent.sh
./deploy-to-tencent.sh
```

### 4. 配置环境变量
编辑 `.env` 文件，配置豆包API密钥：
```bash
nano .env
```

### 5. 重启服务
```bash
pm2 restart dreamhome
```

## 管理命令

- 查看状态：`pm2 status`
- 查看日志：`pm2 logs dreamhome`
- 重启服务：`pm2 restart dreamhome`
- 停止服务：`pm2 stop dreamhome`

## 访问网站

部署完成后，访问：`http://你的服务器IP`

## 默认账户

- admin@dreamhome.com (管理员)
- pm@dreamhome.com (产品经理)
- 密码：123456

## 注意事项

1. 确保服务器已开放80端口
2. 配置正确的豆包API密钥
3. 如有域名，修改Nginx配置
EOF

# 打包
echo "📦 创建压缩包..."
tar -czf $PACKAGE_NAME -C $TEMP_DIR .

# 清理临时目录
rm -rf $TEMP_DIR

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 部署包创建完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 文件名: $PACKAGE_NAME"
echo "📏 文件大小: $(du -h $PACKAGE_NAME | cut -f1)"
echo ""
echo "📤 上传到服务器："
echo "scp $PACKAGE_NAME root@你的服务器IP:/opt/"
echo ""
echo "🚀 服务器上解压和部署："
echo "cd /opt && tar -xzf $PACKAGE_NAME && cd dreamhome && chmod +x deploy-to-tencent.sh && ./deploy-to-tencent.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 