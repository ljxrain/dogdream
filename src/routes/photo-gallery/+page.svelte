<script lang="ts">
  let selectedStyle = 'all';
  let searchQuery = '';
  
  const styles = [
    { id: 'all', name: '全部风格', count: 24 },
    { id: 'anime', name: '动漫风格', count: 6 },
    { id: 'oil', name: '油画风格', count: 6 },
    { id: 'ink', name: '水墨画风格', count: 6 },
    { id: '3d', name: '3D卡通', count: 6 }
  ];
  
  // 简化的照片数据 - 使用静态数据避免SSR问题
  const photos = [
    { id: 1, title: '动漫风格作品1', image: '/recommendations/photo/photo1.png', style: 'anime', likes: 1234, views: 5678 },
    { id: 2, title: '动漫风格作品2', image: '/recommendations/photo/photo2.png', style: 'anime', likes: 2345, views: 6789 },
    { id: 3, title: '动漫风格作品3', image: '/recommendations/photo/photo3.png', style: 'anime', likes: 3456, views: 7890 },
    { id: 4, title: '动漫风格作品4', image: '/recommendations/photo/photo4.png', style: 'anime', likes: 4567, views: 8901 },
    { id: 5, title: '动漫风格作品5', image: '/recommendations/photo/photo5.png', style: 'anime', likes: 5678, views: 9012 },
    { id: 6, title: '动漫风格作品6', image: '/recommendations/photo/photo6.png', style: 'anime', likes: 6789, views: 1023 },
    { id: 7, title: '油画风格作品1', image: '/recommendations/photo/photo7.png', style: 'oil', likes: 7890, views: 2134 },
    { id: 8, title: '油画风格作品2', image: '/recommendations/photo/photo8.png', style: 'oil', likes: 8901, views: 3245 },
    { id: 9, title: '油画风格作品3', image: '/recommendations/photo/photo9.png', style: 'oil', likes: 9012, views: 4356 },
    { id: 10, title: '油画风格作品4', image: '/recommendations/photo/photo10.png', style: 'oil', likes: 1023, views: 5467 },
    { id: 11, title: '油画风格作品5', image: '/recommendations/photo/photo1.png', style: 'oil', likes: 2134, views: 6578 },
    { id: 12, title: '油画风格作品6', image: '/recommendations/photo/photo2.png', style: 'oil', likes: 3245, views: 7689 },
    { id: 13, title: '水墨画作品1', image: '/recommendations/photo/photo3.png', style: 'ink', likes: 4356, views: 8790 },
    { id: 14, title: '水墨画作品2', image: '/recommendations/photo/photo4.png', style: 'ink', likes: 5467, views: 9801 },
    { id: 15, title: '水墨画作品3', image: '/recommendations/photo/photo5.png', style: 'ink', likes: 6578, views: 1012 },
    { id: 16, title: '水墨画作品4', image: '/recommendations/photo/photo6.png', style: 'ink', likes: 7689, views: 2123 },
    { id: 17, title: '水墨画作品5', image: '/recommendations/photo/photo7.png', style: 'ink', likes: 8790, views: 3234 },
    { id: 18, title: '水墨画作品6', image: '/recommendations/photo/photo8.png', style: 'ink', likes: 9801, views: 4345 },
    { id: 19, title: '3D卡通作品1', image: '/recommendations/photo/photo9.png', style: '3d', likes: 1012, views: 5456 },
    { id: 20, title: '3D卡通作品2', image: '/recommendations/photo/photo10.png', style: '3d', likes: 2123, views: 6567 },
    { id: 21, title: '3D卡通作品3', image: '/recommendations/photo/photo1.png', style: '3d', likes: 3234, views: 7678 },
    { id: 22, title: '3D卡通作品4', image: '/recommendations/photo/photo2.png', style: '3d', likes: 4345, views: 8789 },
    { id: 23, title: '3D卡通作品5', image: '/recommendations/photo/photo3.png', style: '3d', likes: 5456, views: 9890 },
    { id: 24, title: '3D卡通作品6', image: '/recommendations/photo/photo4.png', style: '3d', likes: 6567, views: 1001 }
  ];
  
  // 使用函数而不是响应式语句来避免SSR问题
  function getFilteredPhotos() {
    return photos.filter(photo => {
      const matchesStyle = selectedStyle === 'all' || photo.style === selectedStyle;
      const matchesSearch = searchQuery === '' || photo.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStyle && matchesSearch;
    });
  }
  
  function handleStyleChange(styleId: string) {
    selectedStyle = styleId;
  }
  
  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/recommendations/photo/photo1.png';
    }
  }
</script>

<svelte:head>
  <title>照片圆梦作品展示 - 造梦家</title>
  <meta name="description" content="将你的照片转换成各种艺术风格，实现创意梦想" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">照片圆梦作品展示</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-90">将你的照片转换成各种艺术风格，实现创意梦想</p>
      <p class="text-lg opacity-80">探索无限可能，让每张照片都成为艺术品</p>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- 搜索框 -->
    <div class="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div class="flex items-center gap-4">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          type="text" 
          placeholder="搜索作品..." 
          bind:value={searchQuery}
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>

    <!-- 风格分类 -->
    <div class="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">艺术风格</h3>
      <div class="flex flex-wrap gap-3">
        {#each styles as style}
          <button 
            class="px-6 py-3 rounded-full border font-medium transition-all duration-300 {selectedStyle === style.id ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:border-blue-400'}"
            on:click={() => handleStyleChange(style.id)}
          >
            {style.name} ({style.count})
          </button>
        {/each}
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        共找到 {getFilteredPhotos().length} 个作品
      </h2>
    </div>

    <!-- 作品展示 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {#each getFilteredPhotos() as photo}
        <div class="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
          <div class="relative">
            <img 
              src={photo.image} 
              alt={photo.title} 
              class="w-full h-64 object-cover"
              on:error={handleImageError}
            />
          </div>
          
          <div class="p-4">
            <h4 class="font-semibold text-gray-900 mb-2">{photo.title}</h4>
            
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center">
                <svg class="w-4 h-4 text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                <span>{photo.likes.toLocaleString()}</span>
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 text-blue-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{photo.views.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- 空状态 -->
    {#if getFilteredPhotos().length === 0}
      <div class="text-center py-16">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">没有找到相关作品</h3>
        <p class="text-gray-500">试试调整搜索关键词或选择其他风格</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* 移除所有自定义CSS，使用内联样式 */
</style>