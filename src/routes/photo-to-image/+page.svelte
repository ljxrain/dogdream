<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let selectedImage = null;
  let selectedStyle = '写实风格';
  let selectedQuality = '普通';
  let resultImages = [];
  let isGenerating = false;
  let generationProgress = 0;
  let generationStage = '';
  let uploadedFile = null;
  let dragOver = false;
  let showLogin = false;

  const styles = [
    { name: '写实风格', preview: '/images/realistic-style.jpg', description: '真实感强，细节丰富' },
    { name: '卡通风格', preview: '/images/cartoon-style.jpg', description: '可爱卡通，色彩鲜艳' },
    { name: '水彩风格', preview: '/images/watercolor-style.jpg', description: '柔和渐变，艺术感强' },
    { name: '油画风格', preview: '/images/oil-style.jpg', description: '古典优雅，质感厚重' },
    { name: '素描风格', preview: '/images/sketch-style.jpg', description: '线条简洁，黑白经典' },
    { name: '像素风格', preview: '/images/pixel-style.jpg', description: '复古游戏，像素美感' },
    { name: '赛博朋克', preview: '/images/cyberpunk-style.jpg', description: '未来科技，霓虹炫酷' },
    { name: '日式动漫', preview: '/images/anime-style.jpg', description: '二次元风，精美细腻' }
  ];

  const qualities = ['普通', '高清', '超清'];
  const qualityPrices = { '普通': 2, '高清': 5, '超清': 8 };

  onMount(() => {
    // 检查用户登录状态
    checkAuthStatus();
  });

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        showLogin = true;
      }
    } catch (error) {
      showLogin = true;
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    dragOver = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    dragOver = false;
    
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadedFile = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage = e.target.result;
      };
      reader.readAsDataURL(files[0]);
    }
  }

  function selectStyle(style) {
    selectedStyle = style;
  }

  function selectQuality(quality) {
    selectedQuality = quality;
  }

  async function generateImage() {
    if (!selectedImage) {
      alert('请先上传照片');
      return;
    }

    if (showLogin) {
      goto('/login');
      return;
    }

    isGenerating = true;
    generationProgress = 0;
    generationStage = '正在上传图片...';

    try {
      // 模拟生成过程
      const stages = [
        '正在上传图片...',
        '正在分析图片内容...',
        '正在应用风格转换...',
        '正在优化图片质量...',
        '正在生成最终图片...'
      ];

      for (let i = 0; i < stages.length; i++) {
        generationStage = stages[i];
        generationProgress = (i + 1) * 20;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 模拟生成4张结果图片
      resultImages = [
        { url: '/images/result1.jpg', id: 1 },
        { url: '/images/result2.jpg', id: 2 },
        { url: '/images/result3.jpg', id: 3 },
        { url: '/images/result4.jpg', id: 4 }
      ];

      generationStage = '生成完成！';
      generationProgress = 100;

    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      isGenerating = false;
    }
  }

  function downloadImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `照片圆梦_${selectedStyle}_${Date.now()}.jpg`;
    link.click();
  }

  function resetAll() {
    selectedImage = null;
    uploadedFile = null;
    resultImages = [];
    isGenerating = false;
    generationProgress = 0;
    generationStage = '';
  }
</script>

<svelte:head>
  <title>照片圆梦 - 宠物王国</title>
  <meta name="description" content="将你的照片转换成各种艺术风格，实现照片圆梦">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
  <div class="container mx-auto px-4">
    <!-- 页面标题 -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">📸 照片圆梦</h1>
      <p class="text-xl text-gray-600">将您的照片转换成各种艺术风格，让创意无限绽放</p>
    </div>

    {#if showLogin}
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="text-6xl mb-4">🔐</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">需要登录</h2>
        <p class="text-gray-600 mb-6">请先登录后再使用照片圆梦功能</p>
        <button 
          on:click={() => goto('/login')}
          class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
        >
          立即登录
        </button>
      </div>
    {:else}
      <div class="max-w-6xl mx-auto">
        <!-- 图片上传区域 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">1. 上传您的照片</h2>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all {dragOver ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-400'}"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
          >
            {#if selectedImage}
              <div class="relative inline-block">
                <img src={selectedImage} alt="上传的图片" class="max-w-xs max-h-64 rounded-lg shadow-lg">
                <button 
                  on:click={resetAll}
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            {:else}
              <div class="text-gray-500">
                <div class="text-6xl mb-4">📷</div>
                <p class="text-xl mb-2">点击上传图片或拖拽图片到这里</p>
                <p class="text-sm">支持 JPG、PNG 格式，文件大小不超过 10MB</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  on:change={handleImageUpload}
                  class="hidden"
                  id="imageUpload"
                >
                <label 
                  for="imageUpload"
                  class="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  选择图片
                </label>
              </div>
            {/if}
          </div>
        </div>

        <!-- 风格选择区域 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">2. 选择转换风格</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each styles as style}
              <button 
                class="style-card p-4 border-2 rounded-xl text-center transition-all {selectedStyle === style.name ? 'selected' : 'border-gray-200 hover:border-purple-300'}"
                on:click={() => selectStyle(style.name)}
              >
                <div class="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span class="text-2xl">🎨</span>
                </div>
                <div class="font-semibold text-gray-800">{style.name}</div>
                <div class="text-sm text-gray-600 mt-1">{style.description}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- 质量选择区域 -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">3. 选择图片质量</h2>
          <div class="grid grid-cols-3 gap-4">
            {#each qualities as quality}
              <button 
                class="quality-btn p-6 rounded-xl border-2 text-center transition-all {selectedQuality === quality ? 'selected' : 'border-gray-200 hover:border-blue-300'}"
                on:click={() => selectQuality(quality)}
              >
                <div class="text-2xl font-bold mb-2">{quality}</div>
                <div class="text-lg text-blue-600 font-semibold">{qualityPrices[quality]} 积分</div>
                <div class="text-sm text-gray-600 mt-1">
                  {quality === '普通' ? '512x512' : quality === '高清' ? '1024x1024' : '2048x2048'}
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="text-center mb-8">
          <button 
            on:click={generateImage}
            disabled={isGenerating || !selectedImage}
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {#if isGenerating}
              🎨 生成中...
            {:else}
              🚀 开始生成 (消耗 {qualityPrices[selectedQuality]} 积分)
            {/if}
          </button>
        </div>

        <!-- 生成进度 -->
        {#if isGenerating}
          <div class="max-w-md mx-auto mb-8">
            <div class="text-center mb-4">
              <div class="text-lg font-semibold text-gray-800">{generationStage}</div>
              <div class="text-sm text-gray-600">{generationProgress}%</div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style="width: {generationProgress}%"
              ></div>
            </div>
          </div>
        {/if}

        <!-- 生成结果 -->
        {#if resultImages.length > 0}
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">🎉 生成结果</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each resultImages as image}
                <div class="result-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div class="aspect-square bg-gray-200 flex items-center justify-center">
                    <span class="text-4xl">🖼️</span>
                  </div>
                  <div class="p-4">
                    <button 
                      on:click={() => downloadImage(image.url)}
                      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      下载图片
                    </button>
                  </div>
                </div>
              {/each}
            </div>
            
            <div class="text-center mt-6">
              <button 
                on:click={resetAll}
                class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                重新开始
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .style-card.selected {
    @apply border-purple-500 bg-purple-50;
  }
  
  .quality-btn.selected {
    @apply border-blue-500 bg-blue-50;
  }
  
  .result-card:hover {
    transform: translateY(-2px);
  }
</style> 