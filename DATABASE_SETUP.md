# 数据库设置与启动指南

## 🎯 问题解决方案

为了解决PostgreSQL数据库经常停止的问题，我们创建了一套自动化脚本来确保数据库稳定运行。

## 📁 脚本文件说明

### 1. `start-database.ps1` - 数据库启动脚本
- 自动清理旧的PostgreSQL进程
- 启动PostgreSQL 17数据库
- 测试数据库连接
- 确保数据库完全启动后才退出

### 2. `check-database.ps1` - 数据库状态检查脚本
- 检查PostgreSQL进程是否运行
- 测试数据库连接
- 验证用户数据是否可访问

### 3. `dev-start.ps1` - 开发环境一键启动脚本
- 启动数据库
- 设置环境变量
- 验证连接
- 启动开发服务器

### 4. `setup-auto-start.ps1` - 设置开机自启动脚本
- 创建Windows任务计划程序条目
- 确保系统重启后自动启动PostgreSQL
- **需要管理员权限运行**

### 5. `database-watchdog.ps1` - 数据库守护进程 🆕
- **持续监控数据库状态**
- **自动检测数据库停止并重启**
- **真正的自动故障恢复**
- **后台守护进程**

## 🚀 使用方法

### 日常开发启动
```powershell
# 一键启动开发环境（推荐）
powershell -ExecutionPolicy Bypass -File dev-start.ps1

# 或者分步启动
powershell -ExecutionPolicy Bypass -File start-database.ps1
npm run dev
```

### 检查数据库状态
```powershell
powershell -ExecutionPolicy Bypass -File check-database.ps1
```

### 设置开机自启动（一次性设置）
```powershell
# 以管理员身份运行PowerShell，然后执行：
powershell -ExecutionPolicy Bypass -File setup-auto-start.ps1
```

### 🔥 启动数据库守护进程（自动监控重启）
```powershell
# 基础监控（每30秒检查一次）
powershell -ExecutionPolicy Bypass -File database-watchdog.ps1

# 自定义检查间隔（每10秒检查一次）
powershell -ExecutionPolicy Bypass -File database-watchdog.ps1 -CheckInterval 10

# 详细日志模式
powershell -ExecutionPolicy Bypass -File database-watchdog.ps1 -Verbose

# 自定义重试次数
powershell -ExecutionPolicy Bypass -File database-watchdog.ps1 -MaxRetries 5
```

## ⚙️ 自动化级别对比

| 脚本 | 自动化程度 | 使用场景 | 说明 |
|------|-----------|----------|------|
| `start-database.ps1` | 手动 | 偶尔启动 | 你手动运行时启动数据库 |
| `setup-auto-start.ps1` | 开机启动 | 系统重启后 | Windows重启后自动启动 |
| `database-watchdog.ps1` | **全自动监控** | **生产使用** | **数据库停止立即重启** |

## 🔐 用户账户信息

系统中的测试账户：

| 邮箱 | 密码 | 角色 | 用户名 |
|------|------|------|--------|
| admin@dreamhome.com | admin123 | ADMIN | 管理员 |
| service@dreamhome.com | service123 | CUSTOMER_SERVICE | 客服小丽 |
| pm@dreamhome.com | pm123 | PRODUCT_MANAGER | 产品经理 |

## 🔧 数据库配置

- **数据库名称**: `dreamhome`
- **连接字符串**: `postgresql://postgres:password@localhost:5432/dreamhome`
- **PostgreSQL版本**: 17
- **端口**: 5432

## ⚠️ 故障排除

### 如果数据库启动失败
1. 运行 `check-database.ps1` 检查状态
2. 手动运行 `start-database.ps1`
3. 检查PostgreSQL日志文件

### 如果连接失败
1. 确认PostgreSQL进程正在运行
2. 检查端口5432是否被占用
3. 验证数据库用户名和密码

### 如果找不到用户账户
- 确认连接的是 `dreamhome` 数据库（不是 `dreamhome_db`）
- 运行 `node check_all_passwords.mjs` 验证用户数据

## 🎯 推荐使用方式

### 开发环境
```powershell
# 开发时使用
powershell -ExecutionPolicy Bypass -File dev-start.ps1
```

### 生产或长期运行
```powershell
# 启动守护进程，确保数据库永不停止
powershell -ExecutionPolicy Bypass -File database-watchdog.ps1 -CheckInterval 15 -Verbose
```

## 🎉 现在您可以稳定使用系统了！

- ✅ **手动启动**: 使用 `dev-start.ps1`
- ✅ **开机启动**: 使用 `setup-auto-start.ps1`
- ✅ **自动监控**: 使用 `database-watchdog.ps1` **← 真正的自动重启**

数据库启动问题已经彻底解决，系统会自动处理所有数据库启动和连接问题。 