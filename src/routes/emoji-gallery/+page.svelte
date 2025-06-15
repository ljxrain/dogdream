<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedCategory = 'all';
  let searchQuery = '';
  let sortBy = 'likes';
  
  const categories = [
    { id: 'all', name: '全部表情包', count: 80, icon: '🎭' },
    { id: 'emotion', name: '情感表达类', count: 15, icon: '😊' },
    { id: 'greeting', name: '问候交流类', count: 12, icon: '👋' },
    { id: 'lifestyle', name: '生活状态类', count: 10, icon: '🍽️' },
    { id: 'interaction', name: '互动回应类', count: 8, icon: '👍' },
    { id: 'funny', name: '搞笑娱乐类', count: 15, icon: '😂' },
    { id: 'festival', name: '节日庆祝类', count: 8, icon: '🎉' },
    { id: 'business', name: '职场商务类', count: 6, icon: '🤝' },
    { id: 'tone', name: '语气辅助类', count: 6, icon: '❓' }
  ];
  
  const sortOptions = [
    { value: 'likes', label: '按热度排序' },
    { value: 'newest', label: '按时间排序' },
    { value: 'downloads', label: '按下载量排序' }
  ];
  
  function getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      emotion: '情感表达',
      greeting: '问候交流',
      lifestyle: '生活状态',
      interaction: '互动回应',
      funny: '搞笑娱乐',
      festival: '节日庆祝',
      business: '职场商务',
      tone: '语气辅助'
    };
    return names[category] || '表情包';
  }
  
  function getRandomTags(category: string): string[] {
    const tagMap: { [key: string]: string[] } = {
      emotion: ['开心', '愤怒', '悲伤', '惊讶'],
      greeting: ['打招呼', '告别', '感谢', '问候'],
      lifestyle: ['吃饭', '睡觉', '工作', '运动'],
      interaction: ['点赞', '鼓掌', '比心', '互动'],
      funny: ['搞笑', '幽默', '卖萌', '恶搞'],
      festival: ['春节', '生日', '情人节', '节日'],
      business: ['职场', '商务', '握手', '工作'],
      tone: ['疑问', '强调', '无奈', '语气']
    };
    const tags = tagMap[category] || ['表情包'];
    return tags.slice(0, 2);
  }
  
  // 生成表情包数据
  let allEmojis = Array.from({ length: 80 }, (_, i) => {
    const imageIndex = (i % 10) + 1;
    const categoryTypes = ['emotion', 'greeting', 'lifestyle', 'interaction', 'funny', 'festival', 'business', 'tone'];
    const category = categoryTypes[i % categoryTypes.length];
    
    return {
      id: i + 1,
      title: `${getCategoryName(category)}${Math.floor(i / 8) + 1}`,
      image: `/recommendations/emoji/emoji${imageIndex}.png`,
      category,
      likes: Math.floor(Math.random() * 50000) + 1000,
      downloads: Math.floor(Math.random() * 100000) + 5000,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      author: `用户${Math.floor(Math.random() * 1000) + 1}`,
      tags: getRandomTags(category)
    };
  });
  
  $: filteredEmojis = allEmojis
    .filter(emoji => {
      const matchesCategory = selectedCategory === 'all' || emoji.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        emoji.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emoji.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return b.likes - a.likes;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'downloads':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });
  
  function downloadEmoji(emoji: any) {
    alert(`下载表情包: ${emoji.title}`);
  }
  
  function likeEmoji(emoji: any) {
    emoji.likes += 1;
    allEmojis = [...allEmojis];
  }
</script>

<svelte:head>
  <title>表情包浏览 - 狗狗造梦家</title>
  <meta name="description" content="浏览海量精品表情包，找到你喜欢的表情" />
</svelte:head>

<style>
  .emoji-card {
    transition: all 0.3s ease;
  }
  .emoji-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
  .category-btn {
    transition: all 0.3s ease;
  }
  .category-btn.active {
    background-color: #f59e0b;
    color: white;
    transform: scale(1.05);
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">表情包浏览</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-90">海量精品表情包，总有一款适合你</p>
      <p class="text-lg opacity-80">发现更多创意表情，让聊天更有趣</p>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- 搜索和筛选区域 -->
    <div class="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div class="flex flex-col lg:flex-row gap-6 items-center">
        <!-- 搜索框 -->
        <div class="flex-1 relative">
          <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="搜索表情包..." 
            bind:value={searchQuery}
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
          />
        </div>
        
        <!-- 排序选择 -->
        <div class="flex items-center gap-4">
          <span class="text-gray-700 font-medium">排序:</span>
          <select bind:value={sortBy} class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500">
            {#each sortOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">表情包分类</h3>
      <div class="flex flex-wrap gap-3">
        {#each categories as category}
          <button 
            class="category-btn px-6 py-3 rounded-full border border-gray-300 font-medium {selectedCategory === category.id ? 'active' : 'hover:border-yellow-400'}"
            on:click={() => selectedCategory = category.id}
          >
            <span class="mr-2">{category.icon}</span>
            {category.name}
            <span class="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">{category.count}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {selectedCategory === 'all' ? '全部表情包' : categories.find(c => c.id === selectedCategory)?.name}
      </h2>
      <div class="text-gray-600">
        共找到 <span class="font-semibold text-yellow-600">{filteredEmojis.length}</span> 个表情包
      </div>
    </div>

    <!-- 表情包网格 -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {#each filteredEmojis as emoji}
        <div class="emoji-card bg-white rounded-xl overflow-hidden shadow-lg">
          <div class="relative group">
            <div class="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={emoji.image} 
                alt={emoji.title} 
                class="max-w-full max-h-full object-contain"
                on:error={(e) => {
                  // @ts-ignore
                  if (e.target) e.target.src = '/recommendations/emoji/emoji1.png';
                }}
              />
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <button 
                  on:click={() => downloadEmoji(emoji)}
                  class="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                  title="下载"
                >
                  <i class="fas fa-download"></i>
                </button>
                <button 
                  on:click={() => likeEmoji(emoji)}
                  class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  title="点赞"
                >
                  <i class="fas fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="p-4">
            <h4 class="font-semibold text-gray-900 mb-2 truncate">{emoji.title}</h4>
            
            <!-- 标签 -->
            <div class="flex flex-wrap gap-1 mb-3">
              {#each emoji.tags as tag}
                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{tag}</span>
              {/each}
            </div>
            
            <!-- 统计信息 -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center">
                <i class="fas fa-heart text-red-400 mr-1"></i>
                <span>{emoji.likes.toLocaleString()}</span>
              </div>
              <div class="flex items-center">
                <i class="fas fa-download text-blue-400 mr-1"></i>
                <span>{emoji.downloads.toLocaleString()}</span>
              </div>
            </div>
            
            <!-- 作者信息 -->
            <div class="mt-2 text-xs text-gray-400">
              by {emoji.author}
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- 空状态 -->
    {#if filteredEmojis.length === 0}
      <div class="text-center py-16">
        <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">没有找到相关表情包</h3>
        <p class="text-gray-500">试试调整搜索关键词或选择其他分类</p>
      </div>
    {/if}

    <!-- 加载更多按钮 -->
    {#if filteredEmojis.length > 0}
      <div class="text-center mt-12">
        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          <i class="fas fa-plus mr-2"></i>
          加载更多表情包
        </button>
      </div>
    {/if}
  </div>
</div> 