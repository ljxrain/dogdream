# 🌐 云PostgreSQL数据库配置指南

## 方案1: Supabase (推荐 - 免费)

### 1. 注册Supabase账户
- 访问 https://supabase.com
- 使用GitHub账户注册
- 创建新项目

### 2. 获取数据库连接信息
- 项目设置 → Database → Connection string
- 复制PostgreSQL连接字符串

### 3. 更新.env文件
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 方案2: Railway (免费额度)

### 1. 注册Railway账户
- 访问 https://railway.app
- 使用GitHub账户注册

### 2. 创建PostgreSQL数据库
- New Project → Add PostgreSQL
- 获取连接信息

### 3. 更新.env文件
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
```

## 方案3: Neon (免费)

### 1. 注册Neon账户
- 访问 https://neon.tech
- 创建免费账户

### 2. 创建数据库
- Create Project
- 获取连接字符串

### 3. 更新.env文件
```env
DATABASE_URL=postgresql://[username]:[password]@[endpoint]/[dbname]?sslmode=require
```

## 本地PostgreSQL配置（如果需要）

### Windows安装步骤：
1. 下载PostgreSQL安装程序
2. 运行安装，设置密码为 `password`
3. 启动服务
4. 创建数据库：`createdb dreamhome_db`

### 连接字符串：
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/dreamhome_db
```

## 下一步操作

配置好数据库连接后，运行：
```bash
npm run prisma:setup
npm run dev
``` 