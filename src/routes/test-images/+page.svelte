<script lang="ts">
  // 测试图片列表
  const testImages = [
    '微信图片_20250603200400.jpg',
    '微信图片_20250603200425.jpg', 
    '微信图片_20250603200431.jpg',
    '微信图片_20250603200438.jpg',
    '微信图片_20250603200446.jpg',
    '微信图片_20250603200453.jpg',
    '01a7fc26-bbf3-4a97-8458-6ea5f3cbe8a3.png',
    '05b0881c-a7e4-4e53-ad02-d60331b7328f.png'
  ];
</script>

<svelte:head>
  <title>图片测试 - 狗狗造梦家</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="max-w-6xl mx-auto px-6">
    <h1 class="text-3xl font-bold text-center mb-8">D盘图片API测试</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {#each testImages as imageName}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="aspect-square">
            <img 
              src="/api/images/{imageName}" 
              alt={imageName}
              class="w-full h-full object-cover"
              on:error={(e) => {
                console.error('图片加载失败:', imageName);
                e.target.src = '/api/placeholder/300/300';
              }}
            />
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-900 text-sm truncate">{imageName}</h3>
            <p class="text-xs text-gray-500 mt-1">来源: D:\图片\{imageName}</p>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="mt-12 text-center">
      <a href="/shop" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
        返回商城
      </a>
    </div>
  </div>
</div> 