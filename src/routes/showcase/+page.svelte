<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedCategory = 'all';
  
  const categories = [
    { id: 'all', label: '全部', icon: 'fas fa-th' },
    { id: 'image', label: '照片圆梦', icon: 'fas fa-image' },
    { id: 'emoji', label: '表情包', icon: 'far fa-laugh-beam' },
    { id: 'product', label: '实体产品', icon: 'fas fa-cube' }
  ];
  
  const featuredWorks = [
    {
      id: 1,
      title: '吉卜力风格头像',
      category: 'photo',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '小明',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 1234,
      views: 5678,
      time: '2小时前'
    },
    {
      id: 3,
      title: '搞怪表情包',
      category: 'emoji',
      image: 'https://images.unsplash.com/photo-1507484467459-0c01be16726e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '表情王',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 2341,
      views: 8765,
      time: '1天前'
    },
    {
      id: 4,
      title: '定制T恤设计',
      category: 'shop',
      image: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '设计师',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 567,
      views: 1234,
      time: '2天前'
    },
    {
      id: 5,
      title: '水彩画风格转换',
      category: 'photo',
      image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '水彩达人',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 1789,
      views: 4567,
      time: '3天前'
    },
    {
      id: 7,
      title: '漫画风格人像',
      category: 'photo',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '漫画家',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 2134,
      views: 6789,
      time: '1周前'
    },
    {
      id: 8,
      title: '可爱萌宠表情包',
      category: 'emoji',
      image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      author: '萌宠lover',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      likes: 1876,
      views: 4321,
      time: '1周前'
    }
  ];
  
  $: filteredWorks = selectedCategory === 'all' 
    ? featuredWorks 
    : featuredWorks.filter(work => {
        if (selectedCategory === 'image') return work.category === 'photo';
        if (selectedCategory === 'product') return work.category === 'shop';
        return work.category === selectedCategory;
      });
</script>

<svelte:head>
  	<title>热门作品 - 狗狗造梦家</title>
  <meta name="description" content="发现精彩创作，寻找创意灵感" />
</svelte:head>

<div class="min-h-screen bg-gray-50 pt-20 pb-20">
  <!-- 页面标题 -->
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">热门作品</h1>
      <p class="text-xl text-gray-600">发现精彩创作，寻找创意灵感</p>
    </div>

    <!-- 分类筛选 -->
    <div class="flex justify-center mb-12">
      <div class="bg-white rounded-full shadow-lg p-2 flex gap-2">
        {#each categories as category}
          <button 
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 {
              selectedCategory === category.id 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }"
            on:click={() => selectedCategory = category.id}
          >
            <i class="{category.icon} mr-2"></i>
            {category.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- 作品网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {#each filteredWorks as work}
        <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
          <!-- 作品图片 -->
          <div class="relative aspect-square overflow-hidden">
            <img 
              src={work.image} 
              alt={work.title}
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm">
                {categories.find(c => c.id === work.category)?.label}
              </span>
            </div>
          </div>
          
          <!-- 作品信息 -->
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
              {work.title}
            </h3>
            
            <!-- 作者信息 -->
            <div class="flex items-center gap-3 mb-4">
              <img 
                src={work.avatar} 
                alt={work.author}
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{work.author}</p>
                <p class="text-xs text-gray-500">{work.time}</p>
              </div>
            </div>
            
            <!-- 统计信息 -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <i class="fas fa-heart text-red-500"></i>
                  <span>{work.likes.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="fas fa-eye"></i>
                  <span>{work.views.toLocaleString()}</span>
                </div>
              </div>
              <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <i class="fas fa-share-alt text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- 加载更多 -->
    <div class="text-center mt-12">
      <button class="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
        加载更多作品
      </button>
    </div>
  </div>

  <!-- 创作激励区域 -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 mt-16">
    <div class="max-w-4xl mx-auto px-6 py-16 text-center text-white">
      <h2 class="text-3xl font-bold mb-4">释放你的创意，成为下一个热门创作者</h2>
      <p class="text-xl mb-8 opacity-90">使用AI工具，让你的想象力变成现实</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
          开始创作
        </button>
        <button class="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
          了解更多
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>