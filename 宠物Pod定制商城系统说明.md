# 🐾 宠物Pod定制商城系统

## 系统概述

狗狗造梦家的宠物Pod定制商城是一个完整的5步定制流程系统，让用户可以将自己的宠物照片定制到各种商品上。

## 🎯 核心功能

### 1. 五步定制流程

#### 步骤1：选择宠物照片
- 支持JPG、PNG格式图片上传
- 建议尺寸不小于500x500像素
- 实时预览选择的照片
- 安全的文件上传处理

#### 步骤2：选择定制产品
- **宠物马克杯** - ¥68
  - 陶瓷材质，保温性好
  - 印制区域：200x150px
  
- **宠物抱枕** - ¥88
  - 柔软舒适，高品质面料
  - 印制区域：250x250px
  
- **宠物T恤** - ¥78
  - 优质纯棉面料，舒适透气
  - 印制区域：180x200px
  
- **宠物手机壳** - ¥45
  - 适用多种型号，防摔防刮
  - 印制区域：120x180px
  
- **宠物钥匙链** - ¥35
  - 亚克力材质，小巧精致
  - 印制区域：80x80px
  
- **宠物车载摆件** - ¥128
  - 3D立体打印，精工制作
  - 印制区域：100x120px

#### 步骤3：预览定制效果
- 实时生成定制效果预览
- 显示宠物照片在产品上的位置
- 提供定制说明和注意事项

#### 步骤4：确认订单信息
- 订单详情确认
- 配送信息填写
- 价格明细展示（商品价格 + ¥10配送费）

#### 步骤5：完成订单
- 生成唯一订单号（PET + 时间戳）
- 显示订单创建成功信息
- 提供订单跟踪和继续定制选项

### 2. 完善的订单管理系统

#### 订单状态跟踪
- **制作中** - 30%进度
  - 订单确认
  - 图片处理
  - 制作中
  
- **配送中** - 70%进度
  - 制作完成
  - 已发货
  - 运输中
  - 到达目的地
  - 派送中
  
- **已完成** - 100%进度
  - 已签收
  
- **已取消** - 0%进度

#### 物流跟踪功能
- 详细的物流时间线
- 实时状态更新
- 快递单号显示
- 预计送达时间

#### 订单操作
- 查看制作进度
- 查看物流信息
- 取消订单（制作中状态）
- 再次定制
- 重新下单

### 3. 图片资源管理

#### D盘图片集成
- 直接调用D:\图片目录中的真实图片
- 安全的文件访问控制
- 支持多种图片格式（JPG、PNG、GIF、BMP）
- 自动Content-Type识别

#### 图片API路由
- `/api/images/[filename]` - 提供D盘图片访问
- `/api/placeholder/[...path]` - 提供SVG占位符
- 缓存控制和性能优化

## 🛠️ 技术实现

### 前端技术栈
- **SvelteKit** - 现代Web框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 响应式UI设计
- **Font Awesome** - 图标库

### 后端功能
- **文件上传处理** - 安全的图片上传
- **图片服务** - D盘图片资源访问
- **订单管理** - 完整的订单生命周期
- **状态跟踪** - 实时订单状态更新

### 数据结构
```typescript
// 产品数据结构
interface Product {
  id: number;
  name: string;
  price: number;
  desc: string;
  img: string;
  category: string;
  printArea: { width: number; height: number };
}

// 订单数据结构
interface Order {
  id: string;
  status: 'processing' | 'shipping' | 'completed' | 'cancelled';
  date: string;
  total: number;
  items: OrderItem[];
  logistics: LogisticsRecord[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}
```

## 🎨 用户界面设计

### 设计特色
- **渐变色主题** - 紫色到粉色的现代渐变
- **步骤指示器** - 清晰的进度展示
- **响应式布局** - 适配各种设备
- **动画效果** - 流畅的交互体验

### 页面结构
- **商城首页** (`/shop`) - 5步定制流程
- **订单管理** (`/orders`) - 订单列表和跟踪
- **图片测试** (`/test-images`) - D盘图片API测试

## 🔧 部署和配置

### 环境变量
```bash
JWT_SECRET=dream-home-super-secret-jwt-key-2024
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dreamhome
NODE_ENV=development
PUBLIC_APP_URL=http://localhost:5173
```

### 启动命令
```bash
# 设置环境变量并启动
$env:JWT_SECRET = "dream-home-super-secret-jwt-key-2024"
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/dreamhome"
$env:NODE_ENV = "development"
npm run dev
```

### 图片目录配置
- 图片源目录：`D:\图片`
- 支持的格式：JPG, JPEG, PNG, GIF, BMP
- 访问路径：`/api/images/[filename]`

## 📱 功能特性

### 用户体验
- ✅ 直观的5步定制流程
- ✅ 实时预览效果
- ✅ 详细的订单跟踪
- ✅ 响应式设计
- ✅ 错误处理和反馈

### 安全性
- ✅ 文件上传安全检查
- ✅ 图片访问权限控制
- ✅ 输入验证和清理
- ✅ 错误边界处理

### 性能优化
- ✅ 图片缓存控制
- ✅ 懒加载和预加载
- ✅ 组件级别的状态管理
- ✅ 优化的打包和部署

## 🚀 未来扩展

### 计划功能
- [ ] 支付系统集成
- [ ] 用户账户系统
- [ ] 商品评价系统
- [ ] 批量定制功能
- [ ] 移动端APP
- [ ] 社交分享功能

### 技术优化
- [ ] 图片处理和优化
- [ ] CDN集成
- [ ] 数据库优化
- [ ] 性能监控
- [ ] 自动化测试

## 📞 联系信息

项目名称：狗狗造梦家 - 宠物Pod定制商城
开发时间：2025年6月
技术栈：SvelteKit + TypeScript + Tailwind CSS
特色功能：5步定制流程 + 完整订单跟踪系统

---

*让每一个宠物都能成为独一无二的艺术品！* 🐾✨ 