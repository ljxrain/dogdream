# 火山引擎AIGC图像风格化API集成指导

## 概述

本文档提供了完整的火山引擎AIGC图像风格化API集成方案，包括测试页面、API配置、错误解决和使用指导。

## 🚀 快速开始 - 模拟模式测试

如果您还没有完成火山引擎API配置，可以先使用**模拟模式**测试界面功能：

1. 访问测试页面：`http://localhost:5174/test-douban-api`
2. 选择一张测试图片
3. **开启"模拟模式"开关**
4. 点击"模拟测试"按钮

模拟模式会展示完整的界面功能，而不消耗真实的API额度。

## 📋 当前实现状态

### ✅ 已完成功能
- [x] 完整的测试页面UI界面
- [x] 图片上传和预览功能
- [x] 风格选择（动漫、油画、水彩、素描）
- [x] 强度调节滑块
- [x] 模拟模式测试
- [x] API签名算法实现
- [x] 错误处理和调试信息
- [x] 现代化响应式设计

### 🔧 API集成状态
- [x] AWS V4签名算法实现
- [x] 请求体构建
- [x] 网络连通性（可连接到火山引擎API服务器）
- [ ] API参数格式调试（当前返回503错误）
- [ ] 服务开通确认
- [ ] 接口权限配置

## 🔑 火山引擎API配置要求

### 1. 账户设置
```markdown
- 火山引擎账户已注册并实名认证
- 已开通veImageX服务或图像技术服务
- 已创建访问密钥（AccessKey）
- 已配置账户余额或开通免费试用
```

### 2. 服务开通确认
需要确保以下服务已正确开通：
- **veImageX** - 图像处理服务
- **图像技术** - AI图像处理功能
- **智能处理附加组件** - AIGC功能

### 3. API密钥配置
```javascript
const VOLC_CONFIG = {
  accessKeyId: 'YOUR_ACCESS_KEY_ID',     // 替换为您的AK
  secretAccessKey: 'YOUR_SECRET_KEY',    // 替换为您的SK（Base64编码）
  region: 'cn-north-1',                  // 服务区域
  service: 'imagex',                     // 服务名称
  baseURL: 'https://imagex.volcengineapi.com',
  action: 'AIProcess',                   // API动作
  version: '2018-08-01'                  // API版本
};
```

## 🔍 错误排查指南

### 常见错误及解决方案

#### 1. DNS解析错误 `ENOTFOUND`
```bash
Error: getaddrinfo ENOTFOUND cv.volcengineapi.com
```
**解决方案：** ✅ 已解决 - 使用正确的API域名 `imagex.volcengineapi.com`

#### 2. HTTP 503 服务不可用（当前问题）
```bash
HTTP error! status: 503
```
**可能原因和解决方案：**
- **服务未开通**: 确认火山引擎控制台中已开通图像处理相关服务
- **API密钥错误**: 验证AccessKey和SecretKey是否正确
- **权限不足**: 确认账户有调用图像AI处理的权限
- **配额限制**: 检查是否超出API调用配额
- **API参数格式**: 需要调整请求体格式以符合火山引擎接口要求

#### 3. 身份认证失败
- 检查AccessKey和SecretKey是否正确
- 确认密钥没有过期
- 验证签名算法实现

## 🛠️ 技术实现细节

### API请求流程
1. **图片处理**: 上传的图片转换为Base64编码
2. **请求体构建**: 按照火山引擎API格式构建JSON请求体
3. **签名生成**: 使用AWS V4签名算法进行请求签名
4. **API调用**: 发送HTTPS POST请求到火山引擎服务器
5. **响应处理**: 解析API响应并提取结果图片

### 当前API请求体格式
```json
{
  "req_key": "img2img_anime_accelerated",
  "binary_data_base64": ["图片的Base64编码"],
  "render_spec": {
    "render_type": "anime",  // 风格类型
    "strength": 0.8          // 强度 0.1-1.0
  }
}
```

### 支持的风格类型
- `anime` - 动漫风格
- `oil_painting` - 油画风格  
- `watercolor` - 水彩画风格
- `sketch` - 素描风格

## 📝 下一步开发计划

1. **调试API参数格式** - 修正503错误，确保请求格式符合火山引擎要求
2. **完善错误处理** - 添加更详细的错误信息和用户友好的提示
3. **结果图片显示** - 完善API成功返回后的图片展示功能
4. **性能优化** - 添加请求进度提示和超时处理
5. **集成到主应用** - 将API功能集成到网站的照片圆梦功能中

## 🔗 相关资源

- [火山引擎官方文档](https://www.volcengine.com/docs)
- [veImageX服务文档](https://www.volcengine.com/docs/508)
- [图像技术服务文档](https://www.volcengine.com/docs/6793)
- [火山引擎Python SDK](https://github.com/volcengine/volc-sdk-python)
- [火山引擎Node.js SDK](https://github.com/volcengine/volc-sdk-nodejs)

## 📞 技术支持

如需帮助，可以：
1. 查阅火山引擎官方文档
2. 联系火山引擎技术支持
3. 参考GitHub上的官方SDK示例
4. 使用模拟模式先测试界面功能

---

**注意**: 当前测试页面的模拟模式可以完整展示所有功能，建议先使用模拟模式熟悉界面操作，然后根据实际需求配置真实的火山引擎API调用。 