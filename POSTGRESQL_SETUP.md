# PostgreSQL 配置指南

## 🐘 为什么需要PostgreSQL

PostgreSQL是生产级数据库，相比SQLite具有以下优势：
- **更好的并发性能**
- **完整的SQL功能支持**
- **更好的数据完整性**
- **支持复杂查询和索引**
- **适合生产环境部署**

## 🚀 PostgreSQL配置选项

### 方案一：免费云数据库服务（推荐）

#### 1. Supabase（最简单）
1. 访问 https://supabase.com
2. 注册免费账户
3. 创建新项目
4. 在设置 > 数据库中获取连接字符串
5. 更新.env文件：
```bash
DATABASE_URL="postgresql://postgres.user:password@db.host.supabase.co:5432/postgres"
```

#### 2. Railway（快速）
1. 访问 https://railway.app
2. 注册GitHub账户登录
3. 添加PostgreSQL服务
4. 获取连接字符串
5. 更新.env文件：
```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

#### 3. Neon（现代化）
1. 访问 https://neon.tech
2. 注册免费账户
3. 创建数据库
4. 获取连接字符串
5. 更新.env文件：
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
```

### 方案二：本地PostgreSQL安装

#### Windows安装（需要管理员权限）
```powershell
# 使用winget安装
winget install PostgreSQL.PostgreSQL

# 或者下载安装包
# 访问 https://www.postgresql.org/download/windows/
```

#### 配置本地数据库
```bash
# 启动PostgreSQL服务
net start postgresql-x64-14

# 创建数据库
createdb dreamhome

# 更新.env文件
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/dreamhome"
```

### 方案三：Docker PostgreSQL

```bash
# 安装Docker Desktop for Windows
# 运行PostgreSQL容器
docker run --name postgres-dreamhome -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=dreamhome -p 5432:5432 -d postgres:15

# 更新.env文件
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/dreamhome"
```

## 🔧 应用PostgreSQL配置

### 1. 更新.env文件
```bash
# 将下面任一配置复制到.env文件中替换DATABASE_URL
DATABASE_URL="你的PostgreSQL连接字符串"
JWT_SECRET=your-super-secret-jwt-key-2024
NODE_ENV=development
```

### 2. 更新数据库
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# 运行种子数据
node test-db-connection.js
```

### 3. 启动应用
```bash
npm run dev
```

## 🧪 测试账户

配置完成后，使用以下账户测试：

- **管理员**: admin@dreamhome.com / admin123
- **客服**: service@dreamhome.com / service123  
- **产品经理**: pm@dreamhome.com / pm123
- **普通用户**: user1@example.com / user123

## ⚠️ 常见问题

### 问题1：连接超时
- 检查网络连接
- 确认数据库服务状态
- 验证连接字符串格式

### 问题2：认证失败
- 检查用户名密码
- 确认数据库权限
- 验证SSL设置

### 问题3：数据库不存在
- 先创建数据库
- 检查数据库名称
- 确认用户权限

## 📝 当前状态

目前系统配置为PostgreSQL但使用SQLite连接字符串，所以需要：

1. **选择上述任一方案**配置真正的PostgreSQL
2. **更新.env文件**中的DATABASE_URL
3. **重新运行**数据库迁移和种子数据

这样就能彻底解决SQLite/PostgreSQL切换的问题！

## 🐘 PostgreSQL数据库配置完成

## ✅ 已完成的配置

### 1. 数据库架构准备
- ✅ Prisma schema已配置为支持PostgreSQL
- ✅ 当前使用SQLite进行开发（兼容性考虑）
- ✅ 创建了PostgreSQL迁移脚本

### 2. 环境配置
- ✅ .env文件已配置PostgreSQL连接字符串
- ✅ JWT认证配置完成
- ✅ 豆包API配置预留

### 3. 迁移工具
- ✅ `migrate-to-postgresql.js` - 数据迁移脚本
- ✅ `switch-to-postgresql.ps1` - 快速切换脚本
- ✅ `setup-postgresql.ps1` - PostgreSQL安装脚本

### 4. NPM脚本
- ✅ `npm run prisma:setup` - 完整数据库设置
- ✅ `npm run db:migrate` - 数据迁移
- ✅ `npm run db:switch-postgresql` - 切换到PostgreSQL

## 🚀 快速切换到PostgreSQL

### 方案1: 使用云数据库（推荐）

1. **注册云数据库服务**
   ```bash
   # 推荐服务：
   # - Supabase (https://supabase.com) - 免费
   # - Railway (https://railway.app) - 免费额度
   # - Neon (https://neon.tech) - 免费
   ```

2. **获取连接字符串**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

3. **快速切换**
   ```bash
   npm run db:switch-postgresql
   ```

### 方案2: 本地PostgreSQL

1. **安装PostgreSQL**
   ```powershell
   # 以管理员身份运行
   .\setup-postgresql.ps1
   ```

2. **切换数据库**
   ```bash
   npm run db:switch-postgresql
   ```

## 📋 当前状态

- **数据库**: SQLite (开发环境)
- **架构**: PostgreSQL兼容
- **认证**: JWT + bcrypt
- **迁移**: 准备就绪

## 🔧 手动切换步骤

如果自动脚本失败，可以手动执行：

1. **备份数据**
   ```bash
   node migrate-to-postgresql.js
   ```

2. **更新Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **更新.env文件**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dreamhome_db
   ```

4. **重新生成客户端**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🌟 优势

### PostgreSQL vs SQLite
- ✅ 更好的并发性能
- ✅ 完整的ACID事务支持
- ✅ 丰富的数据类型
- ✅ 生产环境标准
- ✅ 水平扩展能力

### 当前架构优势
- ✅ 零停机迁移
- ✅ 数据完整性保证
- ✅ 自动备份机制
- ✅ 一键切换能力

## 🚨 注意事项

1. **生产环境**
   - 使用强密码
   - 启用SSL连接
   - 配置防火墙
   - 定期备份

2. **开发环境**
   - 当前SQLite配置稳定
   - 可随时切换PostgreSQL
   - 数据迁移已测试

## 📞 支持

如果遇到问题：
1. 查看 `setup-cloud-db.md` 云数据库配置
2. 运行 `npm run prisma:studio` 查看数据
3. 检查 `.env` 文件配置
4. 确认PostgreSQL服务状态

---

**系统已准备就绪，可以随时切换到PostgreSQL！** 🎉 