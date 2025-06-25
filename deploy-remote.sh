#!/bin/bash

echo "🚀 狗狗造梦家 - 腾讯云远程部署助手"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SERVER_IP="49.232.220.223"
DEPLOY_PACKAGE="dreamhome-deploy-20250618_125151.tar.gz"

echo "📋 服务器信息："
echo "   IP地址: $SERVER_IP"
echo "   用户名: root"
echo "   部署包: $DEPLOY_PACKAGE (188M)"
echo ""

echo "🔧 部署步骤："
echo ""
echo "步骤1: 手动上传部署包"
echo "请在新的终端窗口中运行以下命令："
echo ""
echo "Windows PowerShell:"
echo "scp $DEPLOY_PACKAGE root@$SERVER_IP:/opt/"
echo ""
echo "或使用WinSCP等图形化工具上传到 /opt/ 目录"
echo ""
echo "步骤2: SSH连接到服务器"
echo "ssh root@$SERVER_IP"
echo ""
echo "步骤3: 在服务器上运行部署命令"
cat << 'EOF'

# 进入目录
cd /opt

# 解压部署包
tar -xzf dreamhome-deploy-20250618_125151.tar.gz

# 进入项目目录
cd dreamhome

# 给脚本执行权限
chmod +x deploy-to-tencent.sh

# 运行部署脚本
./deploy-to-tencent.sh

EOF

echo ""
echo "步骤4: 配置豆包API（部署完成后）"
cat << 'EOF'

# 编辑环境变量
nano .env

# 修改以下配置：
DOUBAO_API_KEY="你的豆包API密钥"
DOUBAO_ACCESS_POINT_ID="你的接入点ID"

# 重启服务
pm2 restart dreamhome

EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📞 需要帮助时："
echo "   查看服务状态: pm2 status"
echo "   查看日志: pm2 logs dreamhome"
echo "   访问网站: http://$SERVER_IP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" 