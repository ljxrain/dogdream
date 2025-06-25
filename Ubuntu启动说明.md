# 狗狗造梦家 - Ubuntu环境启动说明

## 🚀 一键启动

在Windows WSL环境下启动狗狗造梦家项目：

```bash
wsl -e bash -c "cd /mnt/d/dream && bash start-ubuntu.sh"
```

## 📋 脚本功能

`start-ubuntu.sh` 脚本会自动完成以下操作：

### ✅ 环境检查
- 检查 Node.js 和 NPM 版本
- 验证 PostgreSQL 安装和服务状态

### ✅ 数据库配置
- 使用正确的数据库凭据：`postgres:postgres`
- 自动测试数据库连接
- 保护现有用户数据（不会覆盖）

### ✅ 项目依赖
- 智能检查项目依赖完整性
- 必要时自动安装缺失的依赖
- 验证 Vite 可执行性

### ✅ 环境变量
- 自动配置 `.env` 文件
- 使用正确的数据库连接字符串
- 包含完整的豆包API配置

### ✅ 端口管理
- 自动清理端口3000占用
- 确保服务器启动在正确端口

### ✅ 服务器启动
- 使用直接的 `node` 命令启动 Vite
- 避免 WSL 兼容性问题
- 支持本地和网络访问

## 🌐 访问地址

启动成功后，可通过以下地址访问：

- **本地访问**: http://localhost:3000
- **网络访问**: http://[你的IP地址]:3000

## 🎯 主要功能页面

- **首页**: http://localhost:3000/
- **用户登录**: http://localhost:3000/login
- **用户注册**: http://localhost:3000/register
- **照片圆梦**: http://localhost:3000/photo-to-image
- **宠物商店**: http://localhost:3000/shop
- **管理面板**: http://localhost:3000/admin

## 🔧 数据库信息

- **连接字符串**: `postgresql://postgres:postgres@localhost:5432/dreamhome`
- **数据库名**: `dreamhome`
- **用户名**: `postgres`
- **密码**: `postgres`
- **备份数据库**: `dreamhome_backup` (可用于恢复)

## 🛑 停止服务器

按 `Ctrl+C` 即可停止开发服务器。

## 🔍 故障排除

### 如果遇到问题：

1. **端口被占用**: 脚本会自动清理端口3000
2. **数据库连接失败**: 检查PostgreSQL服务是否运行
3. **依赖缺失**: 脚本会自动安装缺失的依赖
4. **权限问题**: 确保WSL中有sudo权限（密码：123）

### 手动检查命令：

```bash
# 检查PostgreSQL服务
wsl -e bash -c "sudo systemctl status postgresql"

# 检查端口占用
wsl -e bash -c "lsof -i:3000"

# 检查数据库连接
wsl -e bash -c "PGPASSWORD=postgres psql -h localhost -U postgres -d dreamhome -c 'SELECT 1;'"
```

## 📞 技术支持

如果遇到问题，请检查：
1. WSL是否正常运行
2. PostgreSQL服务状态
3. Node.js版本兼容性
4. 网络连接状态

---

**最后更新**: 2025-06-18  
**脚本版本**: start-ubuntu.sh v1.0 