<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedFilter = 'all';
  let selectedSort = 'newest';
  let works: any[] = [];
  
  const categories = [
    { id: 'all', label: '全部', count: 12 },
    { id: 'photo', label: '照片圆梦', count: 6 },
    { id: 'emoji', label: '表情包', count: 3 },
    { id: 'shop', label: '定制商品', count: 3 }
  ];
  
  const sortOptions = [
    { id: 'newest', label: '最新创建' },
    { id: 'oldest', label: '最早创建' },
    { id: 'likes', label: '点赞最多' },
    { id: 'views', label: '浏览最多' }
  ];
  
  // 模拟作品数据
  const mockWorks = [
    {
      id: 1,
      type: 'photo',
      title: '吉卜力风格头像',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      createdAt: '2024-01-15',
      likes: 234,
      views: 1567,
      status: 'public',
      description: '使用AI将普通头像转换为吉卜力动画风格'
    },
    {
      id: 3,
      type: 'emoji',
      title: '搞笑表情包',
      image: 'https://images.unsplash.com/photo-1507484467459-0c01be16726e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1507484467459-0c01be16726e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      createdAt: '2024-01-13',
      likes: 456,
      views: 2134,
      status: 'public',
      description: '自制搞笑表情包合集'
    },
    {
      id: 4,
      type: 'photo',
      title: '水彩画风格',
      image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      createdAt: '2024-01-12',
      likes: 123,
      views: 678,
      status: 'public',
      description: '风景照片转水彩画效果'
    },
    {
      id: 5,
      type: 'shop',
      title: '定制T恤设计',
      image: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      createdAt: '2024-01-11',
      likes: 67,
      views: 234,
      status: 'private',
      description: '个人创意T恤设计'
    }
  ];
  
  onMount(() => {
    works = mockWorks;
  });
  
  $: filteredWorks = selectedFilter === 'all' 
    ? works 
    : works.filter(work => work.type === selectedFilter);
    
  function toggleWorkStatus(workId: number) {
    works = works.map(work => 
      work.id === workId 
        ? { ...work, status: work.status === 'public' ? 'private' : 'public' }
        : work
    );
  }
  
  function deleteWork(workId: number) {
    if (confirm('确定要删除这个作品吗？')) {
      works = works.filter(work => work.id !== workId);
    }
  }
  
  function shareWork(work: any) {
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: work.description,
        url: window.location.origin + '/work/' + work.id
      });
    } else {
      // 备用分享方案
      const shareUrl = window.location.origin + '/work/' + work.id;
      navigator.clipboard.writeText(shareUrl);
      alert('作品链接已复制到剪贴板');
    }
  }
  
  function getTypeIcon(type: string) {
    const icons: { [key: string]: string } = {
      photo: 'fas fa-magic',
      emoji: 'fas fa-laugh-beam',
      shop: 'fas fa-gift'
    };
    return icons[type] || 'fas fa-image';
  }
  
  function getTypeLabel(type: string) {
    const labels: { [key: string]: string } = {
      photo: '照片圆梦',
      emoji: '表情包',
      shop: '商品定制'
    };
    return labels[type] || '其他';
  }
</script>

<svelte:head>
  <title>我的作品 - 造梦家</title>
  <meta name="description" content="管理你的创作作品，查看作品数据" />
</svelte:head>

<div class="min-h-screen bg-gray-50 pt-20 pb-20">
  <div class="max-w-7xl mx-auto px-6 py-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">我的作品</h1>
        <p class="text-gray-600">管理你的创作作品，查看作品数据</p>
      </div>
      <button class="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
        <i class="fas fa-plus"></i>
        创建新作品
      </button>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-layer-group text-blue-600 text-xl"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{works.length}</p>
            <p class="text-sm text-gray-600">总作品数</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-heart text-red-500 text-xl"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{works.reduce((sum, work) => sum + work.likes, 0).toLocaleString()}</p>
            <p class="text-sm text-gray-600">总点赞数</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-eye text-green-600 text-xl"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{works.reduce((sum, work) => sum + work.views, 0).toLocaleString()}</p>
            <p class="text-sm text-gray-600">总浏览数</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-globe text-purple-600 text-xl"></i>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{works.filter(work => work.status === 'public').length}</p>
            <p class="text-sm text-gray-600">公开作品</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <!-- 分类筛选 -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">筛选:</label>
          <div class="flex gap-2">
            {#each categories as filter}
              <button 
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {
                  selectedFilter === filter.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }"
                on:click={() => selectedFilter = filter.id}
              >
                {filter.label} ({filter.count})
              </button>
            {/each}
          </div>
        </div>
        
        <!-- 排序选择 -->
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">排序:</label>
          <select 
            bind:value={selectedSort}
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {#each sortOptions as option}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- 作品列表 -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">作品</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">类型</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">创建时间</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">状态</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">数据</th>
              <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each filteredWorks as work}
              <tr class="hover:bg-gray-50 transition-colors">
                <!-- 作品信息 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img 
                      src={work.thumbnail} 
                      alt={work.title}
                      class="w-16 h-16 rounded-xl object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900 mb-1">{work.title}</h3>
                      <p class="text-xs text-gray-500 line-clamp-2">{work.description}</p>
                    </div>
                  </div>
                </td>
                
                <!-- 类型 -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <i class="{getTypeIcon(work.type)}"></i>
                    {getTypeLabel(work.type)}
                  </span>
                </td>
                
                <!-- 创建时间 -->
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900">{work.createdAt}</span>
                </td>
                
                <!-- 状态 -->
                <td class="px-6 py-4">
                  <button 
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors {
                      work.status === 'public' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }"
                    on:click={() => toggleWorkStatus(work.id)}
                  >
                    <i class="fas fa-{work.status === 'public' ? 'globe' : 'lock'} text-xs"></i>
                    {work.status === 'public' ? '公开' : '私有'}
                  </button>
                </td>
                  
                <!-- 数据统计 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <div class="flex items-center gap-1">
                      <i class="fas fa-heart text-red-500"></i>
                      <span>{work.likes.toLocaleString()}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <i class="fas fa-eye"></i>
                      <span>{work.views.toLocaleString()}</span>
                    </div>
                  </div>
                </td>
                
                <!-- 操作按钮 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 justify-end">
                    <button 
                      class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      on:click={() => shareWork(work)}
                      title="分享"
                    >
                      <i class="fas fa-share-alt"></i>
                    </button>
                    <button 
                      class="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="编辑"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      on:click={() => deleteWork(work.id)}
                      title="删除"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- 空状态 -->
      {#if filteredWorks.length === 0}
        <div class="text-center py-12">
          <i class="fas fa-image text-gray-300 text-6xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无作品</h3>
          <p class="text-gray-500 mb-6">开始创作你的第一个作品吧</p>
          <button class="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
            创建作品
          </button>
        </div>
      {/if}
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

 