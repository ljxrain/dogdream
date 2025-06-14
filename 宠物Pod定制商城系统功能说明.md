# 宠物Pod定制商城系统功能说明

## 🎯 系统概述

本系统是一个完整的宠物照片定制商城，集成了AI图像处理、订单管理、物流跟踪等功能。用户可以上传宠物照片，选择定制产品，通过豆包AI生成预览效果，完成下单并跟踪订单状态。

## 🚀 核心功能

### 1. 5步定制流程

#### 步骤1：选择宠物照片
- 支持JPG、PNG格式图片上传
- 建议尺寸：500x500px
- 实时预览上传的照片
- 支持重新选择照片

#### 步骤2：选择定制产品
- **宠物马克杯** - ¥68
- **宠物抱枕** - ¥88  
- **宠物T恤** - ¥78
- **宠物手机壳** - ¥45
- **宠物钥匙链** - ¥35
- **宠物车载摆件** - ¥128

#### 步骤3：AI预览效果
- **豆包AI集成**：使用豆包的图生图API
- **两步处理**：
  1. 图片分析：分析宠物照片特征
  2. 文生图：将照片印制在产品中央位置
- **智能优化**：根据产品特性调整照片尺寸和位置
- **实时预览**：显示定制效果图
- **错误处理**：API失败时提供重试选项

#### 步骤4：确认订单信息
- 填写收货人信息
- 配送地址管理
- 价格明细显示（含¥10配送费）
- 订单信息确认

#### 步骤5：订单完成
- 生成唯一订单号（PET+时间戳格式）
- 显示订单详情
- 提供订单跟踪入口

### 2. 完整订单管理系统

#### 订单状态管理
- **PENDING** - 待处理
- **PROCESSING** - 制作中（30%进度）
- **SHIPPED** - 配送中（70%进度）  
- **DELIVERED** - 已完成（100%进度）
- **CANCELLED** - 已取消（0%进度）

#### 数据库存储
- 订单基本信息（订单号、金额、收货信息等）
- 宠物定制信息（照片URL、产品名称、预览图等）
- 物流跟踪记录
- 时间戳记录（创建、发货、送达等）

#### 物流跟踪功能
- 实时物流状态更新
- 详细的时间线显示
- 快递单号跟踪
- 进度条可视化

### 3. 用户界面功能

#### 订单页面
- 订单状态筛选（全部、制作中、配送中、已完成、已取消）
- 订单搜索和分页
- 订单详情查看
- 物流跟踪模态框
- 订单操作（取消、重新下单、再次定制）

#### 响应式设计
- 支持桌面端和移动端
- 现代化UI设计（紫色到粉色渐变主题）
- 流畅的动画效果
- Font Awesome图标集成

## 🔧 技术实现

### 前端技术栈
- **SvelteKit** - 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Font Awesome** - 图标库

### 后端技术栈
- **Node.js** - 运行环境
- **Prisma** - 数据库ORM
- **PostgreSQL** - 数据库
- **JWT** - 身份认证

### AI集成
- **豆包API** - 图像分析和生成
- **图生图技术** - 智能定制预览
- **错误处理** - API调用失败时的降级方案

### API路由

#### `/api/pet-pod-preview` - 定制预览生成
- **POST** - 生成AI定制预览
- 参数：图片文件、产品名称、模式选择
- 返回：预览图片URL

#### `/api/orders` - 订单管理
- **GET** - 获取用户订单列表
- **POST** - 创建新订单
- 支持分页、状态筛选
- 包含物流信息

#### `/api/images/[filename]` - 图片服务
- 安全访问D盘图片资源
- 支持多种图片格式
- 缓存控制和Content-Type识别

## 📊 数据库设计

### 订单表 (orders)
```sql
- id: 主键
- orderNumber: 订单号（唯一）
- status: 订单状态
- totalAmount: 总金额
- shippingFee: 配送费
- recipientName: 收货人姓名
- recipientPhone: 收货人电话
- shippingAddress: 配送地址
- petImageUrl: 宠物照片URL
- productName: 产品名称
- customPreviewUrl: 定制预览图URL
- customNotes: 定制备注
- createdAt: 创建时间
- updatedAt: 更新时间
- paidAt: 支付时间
- shippedAt: 发货时间
- deliveredAt: 送达时间
- cancelledAt: 取消时间
```

### 物流表 (logistics)
```sql
- id: 主键
- orderId: 订单ID（外键）
- status: 物流状态
- description: 状态描述
- location: 当前位置
- trackingNumber: 快递单号
- createdAt: 创建时间
```

## 🔐 安全特性

### 身份认证
- JWT令牌验证
- 用户权限控制
- 安全的API访问

### 数据安全
- 输入验证和清理
- SQL注入防护
- 文件上传安全检查

### 图片安全
- 预定义图片列表
- 安全的文件路径访问
- Content-Type验证

## 🚀 部署说明

### 开发环境启动
```bash
# 设置环境变量
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"

# 启动开发服务器
npm run dev
```

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
node build/index.js
```

### 环境变量配置
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamhome"
JWT_SECRET="your-secret-key"
NODE_ENV="production"
PUBLIC_APP_URL="https://your-domain.com"
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_CHAT_API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
DOUBAO_IMAGE_GEN_API_URL="https://ark.cn-beijing.volces.com/api/v3/images/generations"
DOUBAO_VISION_MODEL="your-vision-model-id"
DOUBAO_IMAGE_GEN_MODEL="your-image-gen-model-id"
```

## 📈 功能特色

### AI智能定制
- 使用豆包AI技术分析宠物照片
- 智能调整照片在产品上的位置和尺寸
- 生成专业级定制预览效果

### 完整业务流程
- 从选择照片到订单完成的完整流程
- 实时订单状态跟踪
- 专业的物流管理系统

### 用户体验优化
- 直观的5步定制流程
- 实时预览和反馈
- 响应式设计适配各种设备
- 流畅的动画和交互效果

### 数据管理
- 完整的订单数据存储
- 物流信息实时更新
- 用户行为数据跟踪
- 客服查询支持

## 🎯 业务价值

1. **用户体验**：简化定制流程，提供专业预览效果
2. **运营效率**：自动化订单管理，实时状态跟踪
3. **技术创新**：AI技术应用，智能图像处理
4. **商业模式**：完整的电商闭环，支持规模化运营

## 📞 技术支持

系统已完成开发和测试，支持：
- 本地开发环境运行
- 生产环境部署
- API接口调用
- 数据库管理
- 用户界面操作

访问地址：http://localhost:5173
管理后台：支持订单查询和状态管理
技术文档：完整的API文档和部署指南 