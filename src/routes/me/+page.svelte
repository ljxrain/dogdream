<script lang="ts">
  import { onMount } from 'svelte';
  
  let user = {
    name: '张小明',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    email: 'zhangxiaoming@example.com',
    phone: '138****8888',
    level: 'VIP会员',
    points: 2580,
    credits: 158.50
  };
  
  const menuItems = [
    { icon: 'fas fa-image', title: '我的作品', desc: '查看创作历史', href: '/my-works', badge: '12' },
    { icon: 'fas fa-heart', title: '我的收藏', desc: '收藏的内容', href: '/my-favorites', badge: '8' },
    { icon: 'fas fa-shopping-bag', title: '我的订单', desc: '订单管理', href: '/orders' },
    { icon: 'fas fa-comment', title: '我的评价', desc: '评价记录', href: '/my-comments' },
    { icon: 'fas fa-gift', title: '优惠券', desc: '查看可用优惠券', href: '/coupons', badge: '3' },
    { icon: 'fas fa-map-marker-alt', title: '地址管理', desc: '收货地址', href: '/address-management' },
    { icon: 'fas fa-cog', title: '设置', desc: '账户设置', href: '/settings' },
    { icon: 'fas fa-question-circle', title: '帮助反馈', desc: '获取帮助', href: '/help-feedback' },
    		{ icon: 'fas fa-info-circle', title: '关于我们', desc: '了解狗狗造梦家', href: '/about' }
  ];
  
  const stats = [
    { label: '累计创作', value: '126', unit: '件' },
    { label: '获得点赞', value: '1.2k', unit: '' },
    { label: '收藏作品', value: '89', unit: '件' },
    { label: '分享次数', value: '45', unit: '次' }
  ];
</script>

<svelte:head>
  	<title>个人中心 - 狗狗造梦家</title>
  <meta name="description" content="管理你的账户信息、作品和订单" />
</svelte:head>

<style>
  .menu-item {
    transition: all 0.3s ease;
  }
  .menu-item:hover {
    background-color: #f9fafb;
    transform: translateX(4px);
  }
  .stat-card {
    transition: all 0.3s ease;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  .profile-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- 用户信息头部 -->
  <section class="profile-section text-white py-16">
    <div class="max-w-4xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="relative">
          <img src={user.avatar} alt="用户头像" class="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
        </div>
        
        <div class="text-center md:text-left flex-1">
          <h1 class="text-3xl font-bold mb-2">{user.name}</h1>
          <div class="flex flex-col md:flex-row gap-4 mb-4">
            <span class="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">{user.level}</span>
            <span class="text-white/80">{user.email}</span>
          </div>
          
          <div class="grid grid-cols-2 gap-6 mt-6">
            <div class="text-center">
              <div class="text-2xl font-bold">{user.points}</div>
              <div class="text-white/80 text-sm">积分余额</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold">¥{user.credits}</div>
              <div class="text-white/80 text-sm">账户余额</div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button class="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            <i class="fas fa-edit mr-2"></i>
            编辑资料
          </button>
          <button class="bg-purple-600 bg-opacity-20 border border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-all">
            <i class="fas fa-plus mr-2"></i>
            充值
          </button>
        </div>
      </div>
    </div>
  </section>

  <div class="max-w-4xl mx-auto px-6 py-12">
    <!-- 数据统计 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">我的数据</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        {#each stats as stat}
          <div class="stat-card bg-white rounded-xl p-6 text-center shadow-lg">
            <div class="text-3xl font-bold text-purple-600 mb-2">{stat.value}{stat.unit}</div>
            <div class="text-gray-600">{stat.label}</div>
          </div>
        {/each}
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">功能菜单</h2>
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        {#each menuItems as item, index}
          <a 
            href={item.href} 
            class="menu-item flex items-center p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all"
          >
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <i class="{item.icon} text-purple-600"></i>
            </div>
            
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{item.title}</h3>
              <p class="text-sm text-gray-500">{item.desc}</p>
            </div>
            
            {#if item.badge}
              <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-3">{item.badge}</span>
            {/if}
            
            <i class="fas fa-chevron-right text-gray-400"></i>
          </a>
        {/each}
      </div>
    </section>

    <!-- 快速创作 -->
    <div class="bg-white rounded-xl p-6 shadow-sm">
      <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
        <i class="fas fa-magic text-purple-500 mr-2"></i>
        快速创作
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/photo-to-image" class="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-image text-blue-600 text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">照片圆梦</h3>
          <p class="text-gray-600 text-sm">将照片转换成艺术风格</p>
        </a>
        <a href="/emoji-master" class="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i class="far fa-laugh-beam text-yellow-600 text-xl"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">表情包大师</h3>
          <p class="text-gray-600 text-sm">制作个性化表情包</p>
        </a>
      </div>
    </div>

    <!-- 最近活动 -->
    <section>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">最近活动</h2>
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">创建了新作品</h3>
              <p class="text-gray-600 text-sm">使用吉卜力风格转换了头像照片</p>
              <span class="text-xs text-gray-400">2小时前</span>
            </div>
          </div>
          
          <div class="flex items-start gap-4">
            <div class="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">购买了商品</h3>
              <p class="text-gray-600 text-sm">定制T恤 x1，订单号：#202401001</p>
              <span class="text-xs text-gray-400">1天前</span>
            </div>
          </div>
          
          <div class="flex items-start gap-4">
            <div class="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">生成了表情包</h3>
              <p class="text-gray-600 text-sm">制作了3个搞笑表情包</p>
              <span class="text-xs text-gray-400">3天前</span>
            </div>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <button class="text-purple-600 hover:text-purple-700 font-medium">
            查看全部活动 <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </section>
  </div>
</div> 