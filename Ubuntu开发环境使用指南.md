# 狗狗造梦家 - Ubuntu开发环境使用指南

## 🎯 开发环境
- **本地开发**: Ubuntu (WSL)
- **生产环境**: 腾讯云服务器 (Ubuntu 24.04 LTS)

## 🚀 快速启动

### 本地开发启动
```bash
# 在Windows PowerShell中执行
wsl -e bash -c "cd /mnt/d/dream && bash start-ubuntu.sh"
```

### 访问地址
- 本地访问: http://localhost:3000
- 网络访问: http://172.26.98.247:3000

## 📋 环境信息

### 技术栈
- **前端**: SvelteKit + TypeScript + Tailwind CSS
- **后端**: Node.js 18.19.1 + SvelteKit API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **AI服务**: 豆包API (字节跳动)

### 数据库配置
- **数据库**: dreamhome
- **用户**: postgres
- **密码**: postgres
- **连接**: postgresql://postgres:postgres@localhost:5432/dreamhome

### 测试账户
- **管理员**: admin@dreamhome.com (密码: 123456)
- **产品经理**: pm@dreamhome.com (密码: 123456)
- **客服**: service@dreamhome.com (密码: 123456)
- **普通用户**: user1@example.com (密码: 123456)

## 🔧 常用命令

### 启动服务
```bash
# 完整启动（推荐）
wsl -e bash -c "cd /mnt/d/dream && bash start-ubuntu.sh"

# 简单启动
wsl -e bash -c "cd /mnt/d/dream && bash start-ubuntu-simple.sh"
```

### 数据库操作
```bash
# 在Ubuntu环境中执行
sudo -u postgres psql -d dreamhome -c "SELECT COUNT(*) FROM users;"
```

### 检查服务状态
```bash
# 检查端口占用
wsl -e bash -c "netstat -tlnp | grep :3000"

# 检查进程
wsl -e bash -c "ps aux | grep vite"
```

## 🌐 生产环境部署

### 腾讯云服务器信息
- **公网IP**: 49.232.220.223
- **内网IP**: 10.2.20.6
- **SSH用户**: ubuntu
- **访问地址**: http://49.232.220.223

### 部署命令
```bash
# 本地打包部署
bash deploy-to-tencent.sh

# 服务器端更新
ssh ubuntu@49.232.220.223
sudo /path/to/deploy-script.sh
```

## 🔍 故障排除

### 常见问题
1. **WSL连接超时**: 执行 `wsl --shutdown` 重启WSL
2. **端口被占用**: 启动脚本会自动清理端口3000
3. **数据库连接失败**: 检查PostgreSQL服务状态

### 网络问题
如果浏览器无法访问localhost:3000，尝试：
1. 重启WSL: `wsl --shutdown`
2. 使用不同地址: http://127.0.0.1:3000
3. 检查Windows防火墙设置

## 📁 项目结构
```
/mnt/d/dream/
├── src/                    # 源代码
├── static/                 # 静态资源
├── prisma/                 # 数据库模式
├── start-ubuntu.sh         # Ubuntu启动脚本
├── deploy-to-tencent.sh    # 部署脚本
└── 狗狗造梦家-技术说明文档.md
```

## 🎯 功能模块
- **照片圆梦**: AI图像生成与风格转换
- **表情包制作**: 智能文字叠加
- **宠物商店**: 产品定制与预览
- **用户管理**: 多角色权限控制
- **订单系统**: 完整购买流程
- **管理后台**: 数据统计与内容审核

---

**更新时间**: 2025-06-25  
**环境版本**: Ubuntu WSL + 腾讯云服务器 