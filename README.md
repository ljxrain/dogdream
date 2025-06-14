
# 狗狗造梦家 APP UI 原型

这是一个基于HTML/CSS/JavaScript的移动应用UI原型设计项目，展示了"狗狗造梦家"应用的各个页面和交互效果。

## 功能特性

- **表情包大师**：一键制作个性化表情包
- **梦想商城**：将数字创意转化为实体产品，专属定制服务
- **用户系统**：完整的用户注册、登录、个人中心
- **作品管理**：查看、管理、分享你的创作作品
- **响应式设计**：完美适配桌面端和移动端

## 项目结构

```
├── src/
│   ├── lib/
│   │   ├── components/    # 可复用组件
│   │   ├── stores/        # Svelte stores
│   │   └── utils/         # 工具函数
│   ├── routes/           # 页面路由
│   │   ├── emoji-master/  # 表情包大师功能
│   │   ├── shop/         # 梦想商城
│   │   ├── login/        # 登录页面
│   │   ├── register/     # 注册页面
│   │   ├── showcase/     # 作品展示
│   │   ├── my-works/     # 我的作品
│   │   └── me/           # 个人中心
├── pages/               # 静态HTML页面
├── prisma/             # 数据库schema
└── static/             # 静态资源
```

## 如何使用

### 本地查看

1. 克隆或下载本项目到本地
   ```
   git clone <项目地址> 或直接下载ZIP文件并解压
   ```

2. 文件结构保持不变，确保所有文件都在正确的位置

3. 在浏览器中打开 `index.html` 文件
   - 可以直接双击 index.html 文件
   - 或者使用本地服务器（推荐，可避免部分浏览器的跨域限制）
     ```
     # 如果安装了Python，可以使用以下命令快速启动一个本地服务器
     # Python 3.x
     python -m http.server
     
     # 然后在浏览器中访问 http://localhost:8000
     ```

### 查看特定页面

1. 主页面 `index.html` 提供了所有页面的预览框架
2. 每个页面都以手机外观呈现，便于理解移动app的界面效果
3. 可以点击底部导航栏在主要功能页面之间切换

### 修改或扩展

如果需要修改或扩展UI设计：

1. 各页面使用了 [Tailwind CSS](https://tailwindcss.com/) 进行样式设计
2. 图标采用了 [Font Awesome](https://fontawesome.com/) 
3. 修改各HTML文件可以调整页面内容和样式
4. 如需添加新页面，创建新的HTML文件并在 index.html 中添加相应的引用

## 技术栈

- HTML5
- CSS3 (Tailwind CSS框架)
- JavaScript
- Font Awesome 图标

## 注意事项

- 这是一个纯前端UI原型，没有后端功能
- 所有交互都是模拟的，不会真正处理数据
- 原型设计主要用于展示UI/UX设计，不包含实际业务逻辑 