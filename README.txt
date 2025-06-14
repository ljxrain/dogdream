狗狗造梦家 APP UI 原型

这是一个基于HTML/CSS/JavaScript的移动应用UI原型设计项目，展示了"狗狗造梦家"应用的各个页面和交互效果。

项目结构

狗狗造梦家/
│
├── index.html          # 主入口文件，包含所有页面的展示框架
│
└── pages/             # 所有页面文件
    ├── home.html                 # 首页
    ├── photo-to-image.html       # 照片圆梦功能
    ├── image-to-video.html       # 圆梦视频功能
    ├── emoji_master.html         # 表情包大师功能
    ├── shop.html                 # 商城页面
    ├── works.html                # 热门作品页面
    ├── hot-products-list.html    # 热门作品列表
    ├── hot-recommendations.html  # 热门作品详情
    ├── me.html                   # 个人中心
    ├── orders.html               # 订单列表
    ├── order_detail.html         # 订单详情
    ├── shipping_tracking.html    # 物流跟踪
    ├── payment.html              # 支付确认
    ├── my_works.html             # 我的作品
    ├── my_favorites.html         # 我的收藏
    ├── address_management.html   # 地址管理
    ├── coupons.html              # 优惠券
    ├── my_comments.html          # 我的评论
    ├── more_services.html        # 更多服务
    ├── notification_settings.html # 消息通知设置
    ├── privacy_settings.html     # 隐私设置
    ├── payment_settings.html     # 支付设置
    ├── help_feedback.html        # 帮助与反馈
    └── about_us.html             # 关于我们

如何使用

本地查看

1. 克隆或下载本项目到本地
   git clone <项目地址> 或直接下载ZIP文件并解压

2. 文件结构保持不变，确保所有文件都在正确的位置

3. 在浏览器中打开 index.html 文件
   - 可以直接双击 index.html 文件
   - 或者使用本地服务器（推荐，可避免部分浏览器的跨域限制）
     
     # 如果安装了Python，可以使用以下命令快速启动一个本地服务器
     # Python 3.x
     python -m http.server
     
     # 然后在浏览器中访问 http://localhost:8000

查看特定页面

1. 主页面 index.html 提供了所有页面的预览框架
2. 每个页面都以手机外观呈现，便于理解移动app的界面效果
3. 可以点击底部导航栏在主要功能页面之间切换

修改或扩展

如果需要修改或扩展UI设计：

1. 各页面使用了 Tailwind CSS (https://tailwindcss.com/) 进行样式设计
2. 图标采用了 Font Awesome (https://fontawesome.com/)
3. 修改各HTML文件可以调整页面内容和样式
4. 如需添加新页面，创建新的HTML文件并在 index.html 中添加相应的引用

技术栈

- HTML5
- CSS3 (Tailwind CSS框架)
- JavaScript
- Font Awesome 图标

注意事项

- 这是一个纯前端UI原型，没有后端功能
- 所有交互都是模拟的，不会真正处理数据
- 原型设计主要用于展示UI/UX设计，不包含实际业务逻辑 