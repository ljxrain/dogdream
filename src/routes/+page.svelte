<script lang="ts">
  import { onMount } from 'svelte';

  let currentBanner = 0;

  const banners = [
    {
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: '漫画人物',
      title: '一键变成梦想中的漫画人物',
      subtitle: 'AI智能转换，让你秒变动漫达人',
      cta: '开始创作'
    },
    {
      img: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: '爱情记忆',
      title: '一键纪念我们的爱情',
      subtitle: '将美好回忆转化为艺术品，留住幸福时刻',
      cta: '立即体验'
    },
    {
      img: 'https://images.unsplash.com/photo-1518754774392-2022d76dcd16?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: '宝宝成长',
      title: '一键记录宝宝的成长历程',
      subtitle: '捕捉每一个精彩瞬间，创造独特成长故事',
      cta: '开始记录'
    }
  ];

  const features = [
    {
      href: '/photo-to-image',
      img: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      icon: 'fas fa-image',
      title: '照片圆梦',
      description: '将你的照片转换成各种艺术风格，实现创意梦想',
      color: 'blue'
    },
    {
      href: '/emoji-master',
      img: 'https://images.unsplash.com/photo-1507484467459-0c01be16726e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      icon: 'far fa-laugh-beam',
      title: '表情包大师',
      description: '一键制作个性化表情包，让聊天社交更有趣',
      color: 'yellow'
    },
    {
      href: '/shop',
      img: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      icon: 'fas fa-gift',
      title: '梦想商城',
      description: '将数字创意转化为实体产品，专属定制服务',
      color: 'red'
    }
  ];

  const photoRecommendations = [
    { img: '/recommendations/photo/photo1.png', title: '吉卜力风格', likes: '2.3万' },
    { img: '/recommendations/photo/photo2.png', title: '迪士尼角色', likes: '1.8万' },
    { img: '/recommendations/photo/photo3.png', title: '水墨画风格', likes: '1.2万' },
    { img: '/recommendations/photo/photo4.png', title: '油画风格', likes: '0.9万' },
    { img: '/recommendations/photo/photo5.png', title: '像素艺术', likes: '0.8万' },
    { img: '/recommendations/photo/photo6.png', title: '水彩画', likes: '0.7万' },
    { img: '/recommendations/photo/photo7.png', title: '动漫风格', likes: '1.5万' },
    { img: '/recommendations/photo/photo8.png', title: '3D卡通', likes: '1.1万' },
    { img: '/recommendations/photo/photo9.png', title: '皮克斯风格', likes: '0.9万' },
    { img: '/recommendations/photo/photo10.png', title: '乐高风格', likes: '0.6万' }
  ];

  const videoRecommendations = [
    { img: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '动态乐高人偶', likes: '1.5万' },
    { img: 'https://images.unsplash.com/photo-1634987189829-78d3d2f6b649?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '动画漫游场景', likes: '1.3万' },
    { img: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '梦幻动态壁纸', likes: '0.9万' },
    { img: 'https://images.unsplash.com/photo-1660479643704-1e586a6dfb0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '动态人像', likes: '0.7万' },
    { img: 'https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '3D动画效果', likes: '0.6万' },
    { img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', title: '科幻风格', likes: '0.5万' }
  ];

  const emojiRecommendations = [
    { img: '/recommendations/emoji/emoji1.png', title: '人物表情包', likes: '2.1万' },
    { img: '/recommendations/emoji/emoji2.png', title: '萌宠表情包', likes: '1.6万' },
    { img: '/recommendations/emoji/emoji3.png', title: '动态表情包', likes: '1.4万' },
    { img: '/recommendations/emoji/emoji4.png', title: '个性文字表情', likes: '0.8万' },
    { img: '/recommendations/emoji/emoji5.png', title: '搞笑表情包', likes: '0.7万' },
    { img: '/recommendations/emoji/emoji6.png', title: '可爱表情包', likes: '0.6万' },
    { img: '/recommendations/emoji/emoji7.png', title: '卡通表情包', likes: '1.2万' },
    { img: '/recommendations/emoji/emoji8.png', title: '创意表情包', likes: '0.9万' },
    { img: '/recommendations/emoji/emoji9.png', title: '趣味表情包', likes: '0.8万' },
    { img: '/recommendations/emoji/emoji10.png', title: '经典表情包', likes: '0.5万' }
  ];

  const shopRecommendations = [
    { img: '/recommendations/shop/shop1.png', title: '3D车载玩偶', price: '¥266' },
    { img: '/recommendations/shop/shop2.png', title: '个性钥匙链', price: '¥39' },
    { img: '/recommendations/shop/shop3.png', title: '定制抱枕', price: '¥88' },
    { img: '/recommendations/shop/shop4.png', title: '毛绒玩偶', price: '¥128' },
    { img: '/recommendations/shop/shop5.png', title: '定制T恤', price: '¥89' },
    { img: '/recommendations/shop/shop6.png', title: '手机壳', price: '¥45' },
    { img: '/recommendations/shop/shop7.png', title: '马克杯', price: '¥35' },
    { img: '/recommendations/shop/shop8.png', title: '帆布包', price: '¥55' },
    { img: '/recommendations/shop/shop9.png', title: '鼠标垫', price: '¥25' },
    { img: '/recommendations/shop/shop10.png', title: '贴纸套装', price: '¥15' }
  ];

  const stats = [
    { number: '100万+', label: '注册用户' },
    { number: '500万+', label: '作品创作' },
    { number: '50万+', label: '商品销售' },
    { number: '99.9%', label: '满意度' }
  ];

  onMount(() => {
    const interval = setInterval(() => {
      currentBanner = (currentBanner + 1) % banners.length;
    }, 5000);

    return () => clearInterval(interval);
  });

  function setBanner(index: number) {
    currentBanner = index;
  }
</script>

<style>
  .feature-card {
    transition: all 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  .banner-container {
    height: 500px;
  }
  @media (max-width: 768px) {
    .banner-container {
      height: 300px;
    }
  }
  .recommendation-scroll {
    scroll-behavior: smooth;
  }
  .recommendation-scroll::-webkit-scrollbar {
    display: none;
  }
  .recommendation-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .animate-scroll {
    animation: scroll-left 30s linear infinite;
  }
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
</style>

<!-- Hero轮播图 -->
<section class="banner-container relative overflow-hidden rounded-2xl mx-4 mt-8 mb-16">
  {#each banners as banner, i}
  <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out {currentBanner === i ? 'opacity-100' : 'opacity-0'}">
    <img src="{banner.img}" alt="{banner.alt}" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
      <div class="max-w-2xl mx-auto px-8 text-white">
        <h2 class="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h2>
        <p class="text-lg md:text-xl mb-8 opacity-90">{banner.subtitle}</p>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
          {banner.cta}
        </button>
      </div>
    </div>
  </div>
  {/each}
  
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
    {#each banners as _, i}
      <button 
        on:click={() => setBanner(i)} 
        class="w-3 h-3 rounded-full transition-all duration-300 {currentBanner === i ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}"
      ></button>
    {/each}
  </div>
</section>

<!-- 核心功能展示 -->
<section class="py-16">
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">强大的AI创作工具</h2>
    <p class="text-lg text-gray-600 max-w-2xl mx-auto">释放创意潜能，让AI成为你的创作伙伴</p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {#each features as feature}
    <a href={feature.href} class="feature-card group">
      <div class="bg-white rounded-2xl overflow-hidden shadow-lg">
        <div class="relative h-48 overflow-hidden">
          <img src="{feature.img}" alt="{feature.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute top-4 left-4">
            <div class="w-12 h-12 bg-{feature.color}-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <i class="{feature.icon} text-xl"></i>
            </div>
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </a>
    {/each}
  </div>
</section>

<!-- 热门推荐作品 -->
<section class="py-16 bg-gray-50">
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">热门推荐作品</h2>
    <p class="text-lg text-gray-600">发现更多创意灵感，开启你的创作之旅</p>
  </div>

  <!-- 表情包大师推荐 -->
  <div class="mb-12">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-1 h-8 bg-yellow-500 rounded-full mr-4"></div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">表情包大师</h3>
          <p class="text-gray-600">个性化表情包，让聊天更有趣</p>
        </div>
      </div>
                  <a href="/emoji-gallery" class="text-yellow-600 hover:text-yellow-700 font-medium">查看更多 →</a>
    </div>
    <div class="relative overflow-hidden">
      <div class="flex overflow-x-auto recommendation-scroll gap-6 pb-4">
        <div class="flex gap-6 animate-scroll" style="animation-duration: 25s;">
          {#each [...emojiRecommendations, ...emojiRecommendations] as item}
          <div class="flex-shrink-0 w-48 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <img src="{item.img}" alt="{item.title}" class="w-full h-36 object-cover" />
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
              <p class="text-gray-500 text-sm">{item.likes}人喜欢</p>
            </div>
          </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- 照片圆梦推荐 -->
  <div class="mb-12">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">照片圆梦</h3>
          <p class="text-gray-600">将你的照片转换成各种艺术风格，实现创意梦想</p>
        </div>
      </div>
      <a href="/photo-gallery" class="text-blue-600 hover:text-blue-700 font-medium">查看更多 →</a>
    </div>
    <div class="relative overflow-hidden">
      <div class="flex overflow-x-auto recommendation-scroll gap-6 pb-4">
        <div class="flex gap-6 animate-scroll" style="animation-duration: 30s;">
          {#each [...photoRecommendations, ...photoRecommendations] as item}
          <div class="flex-shrink-0 w-48 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <img src="{item.img}" alt="{item.title}" class="w-full h-36 object-cover" />
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
              <p class="text-gray-500 text-sm">{item.likes}人喜欢</p>
            </div>
          </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- 梦想商城推荐 -->
  <div class="mb-12">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-1 h-8 bg-red-500 rounded-full mr-4"></div>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">梦想商城</h3>
          <p class="text-gray-600">创意变实物，专属定制服务</p>
        </div>
      </div>
      <a href="/shop" class="text-red-600 hover:text-red-700 font-medium">查看更多 →</a>
    </div>
    <div class="relative overflow-hidden">
      <div class="flex overflow-x-auto recommendation-scroll gap-6 pb-4">
        <div class="flex gap-6 animate-scroll" style="animation-duration: 40s; animation-direction: reverse;">
          {#each [...shopRecommendations, ...shopRecommendations] as item}
          <div class="flex-shrink-0 w-48 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <img src="{item.img}" alt="{item.title}" class="w-full h-36 object-cover" />
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
              <p class="text-red-500 text-sm font-semibold">{item.price}</p>
            </div>
          </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 数据统计 -->
<section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-4 my-16 text-white">
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">用户信赖，实力见证</h2>
    <p class="text-lg opacity-90">数百万用户的共同选择</p>
  </div>
  
  <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    {#each stats as stat}
    <div>
      <div class="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
      <div class="text-lg opacity-80">{stat.label}</div>
    </div>
    {/each}
  </div>
</section>

<!-- CTA区域 -->
<section class="py-16 text-center">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">开始你的创作之旅</h2>
    <p class="text-lg text-gray-600 mb-8">加入数百万创作者，用AI点亮你的想象力</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
        免费开始创作
      </button>
      <button class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
        了解更多
      </button>
    </div>
  </div>
</section> 