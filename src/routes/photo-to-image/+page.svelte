<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { user, isLoggedIn, initializeAuth } from '$lib/stores/auth';

  let selectedImage: string | null = null;
  let selectedStyle = '动漫风格';
  let selectedQuality: QualityType = '普通';
  let resultImages: Array<{url: string, id: number}> = [];
  let isGenerating = false;
  let generationProgress = 0;
  let generationStage = '';
  let uploadedFile: File | null = null;
  let dragOver = false;
  let showLogin = false;
  let userDescription = ''; // 用户补充描述
  let fastMode = false; // 快速模式

  const styles = [
    { name: '动漫风格', preview: '/styles/style1.png', description: '日式动漫风格，清新明亮' },
    { name: '吉卜力风格', preview: '/styles/style2.png', description: '宫崎骏动画风格，梦幻氛围' },
    { name: '油画风格', preview: '/styles/style3.png', description: '经典油画风格，艺术感强' },
    { name: '水墨画风格', preview: '/styles/style4.png', description: '中国水墨画风格，意境深远' },
    { name: '3D卡通', preview: '/styles/style5.png', description: '现代3D卡通风格，立体感强' },
    { name: '皮克斯风格', preview: '/styles/style6.png', description: '皮克斯3D动画风格，温暖色调' },
    { name: '迪士尼风格', preview: '/styles/style7.png', description: '迪士尼动画风格，温馨可爱' },
    { name: '乐高风格', preview: '/styles/style8.png', description: '积木玩具风格，色彩鲜艳' }
  ];

  const qualities = ['普通', '高清', '超清'] as const;
  type QualityType = typeof qualities[number];
  const qualityPrices: Record<QualityType, number> = { '普通': 2, '高清': 5, '超清': 8 };

  onMount(async () => {
    // 等待认证状态初始化
    if (browser) {
      await initializeAuth();
    }
  });

  // 响应式地监听登录状态变化
  $: {
    if (browser && $isLoggedIn !== undefined) {
      showLogin = !$isLoggedIn;
    }
  }

  function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      uploadedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          selectedImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files?.[0]) {
      const file = files[0];
      uploadedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          selectedImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function selectStyle(style: string) {
    selectedStyle = style;
  }

  function selectQuality(quality: string) {
    selectedQuality = quality as QualityType;
  }

  async function generateImage() {
    if (!selectedImage || !uploadedFile) {
      alert('请先上传照片');
      return;
    }

    if (showLogin) {
      goto('/login');
      return;
    }

    // 立即显示生成区域和初始状态
    isGenerating = true;
    generationProgress = 0;
    generationStage = '准备开始生成...';
    
    // 短暂延迟让用户看到生成区域出现，然后自动滚动
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 自动滚动到结果区域
    setTimeout(() => {
      const resultSection = document.getElementById('result-section');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
    
    generationStage = '正在上传图片...';

    try {
      // 显示准备阶段
      generationProgress = 5;
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 创建FormData
      generationProgress = 10;
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('style', selectedStyle);
      formData.append('quality', selectedQuality);
      formData.append('userDescription', userDescription);
      formData.append('fastMode', fastMode.toString());

      // 显示分析阶段
      if (fastMode) {
        generationStage = '⚡ 快速分析图片内容...';
        generationProgress = 25;
      } else {
        generationStage = '正在分析图片内容...';
        generationProgress = 20;
      }

      // 调用真实的豆包API
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        body: formData
      });

      // 显示生成阶段
      if (fastMode) {
        generationStage = '⚡ 快速生成风格化图片...';
        generationProgress = 70;
      } else {
        generationStage = '正在应用风格转换...';
        generationProgress = 50;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '服务器错误');
      }

      // 显示最终阶段
      if (fastMode) {
        generationStage = '⚡ 即将完成...';
        generationProgress = 90;
      } else {
        generationStage = '正在生成最终图片...';
        generationProgress = 80;
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '生成失败');
      }

      // 使用真实生成的图片
      resultImages = [
        { url: result.data.generatedImage, id: 1 }
      ];

      generationStage = '生成完成！';
      generationProgress = 100;

      console.log('生成结果:', {
        analysis: result.data.originalAnalysis,
        prompt: result.data.generatedPrompt,
        image: result.data.generatedImage
      });

    } catch (error) {
      console.error('生成失败:', error);
      alert(`生成失败: ${error instanceof Error ? error.message : '请重试'}`);
    } finally {
      isGenerating = false;
    }
  }

  function downloadImage(imageUrl: string) {
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
    userDescription = ''; // 重置用户描述
    fastMode = false; // 重置快速模式
  }
</script>

<svelte:head>
  <title>照片圆梦 - 宠物王国</title>
  <meta name="description" content="将你的照片转换成各种艺术风格，实现照片圆梦">
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
  <div class="container mx-auto px-4">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
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
      <div class="max-w-7xl mx-auto">
        <div class="max-w-4xl mx-auto space-y-8">
          <!-- 第一步：图片上传区域 -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
              <h2 class="text-xl font-bold text-gray-800">上传您的照片</h2>
            </div>
            <div 
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all {dragOver ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-400'}"
              on:dragover={handleDragOver}
              on:dragleave={handleDragLeave}
              on:drop={handleDrop}
              role="button"
              tabindex="0"
            >
              {#if selectedImage}
                <div class="relative inline-block">
                  <img src={selectedImage} alt="上传的图片" class="max-w-full max-h-32 rounded-lg shadow-lg">
                  <button 
                    on:click={resetAll}
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                  >
                    ×
                  </button>
                </div>
              {:else}
                <div class="text-gray-500">
                  <div class="text-4xl mb-2">📷</div>
                  <p class="text-sm mb-2">点击上传或拖拽图片到这里</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    on:change={handleImageUpload}
                    class="hidden"
                    id="imageUpload"
                  >
                  <label 
                    for="imageUpload"
                    class="inline-block mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors text-sm"
                  >
                    选择图片
                  </label>
                </div>
              {/if}
            </div>
          </div>

          <!-- 第二步：风格选择区域 -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
              <h2 class="text-xl font-bold text-gray-800">选择转换风格</h2>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {#each styles as style}
                <button 
                  class="style-card p-3 border-2 rounded-lg text-center transition-all {selectedStyle === style.name ? 'selected' : 'border-gray-200 hover:border-purple-300'}"
                  on:click={() => selectStyle(style.name)}
                >
                  <div class="aspect-square bg-gray-200 rounded-md mb-2 overflow-hidden">
                    <img 
                      src={style.preview} 
                      alt={style.name}
                      class="w-full h-full object-cover"
                      on:error={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        target.parentElement.innerHTML = '<span class="text-lg flex items-center justify-center h-full">🎨</span>';
                      }}
                    />
                  </div>
                  <div class="font-semibold text-sm text-gray-800">{style.name}</div>
                  <div class="text-xs text-gray-600">{style.description}</div>
                </button>
              {/each}
            </div>
          </div>

          <!-- 第三步：用户描述区域 -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
              <h2 class="text-xl font-bold text-gray-800">添加您的创意描述（可选）</h2>
            </div>
            <textarea
              bind:value={userDescription}
              placeholder="描述您想要的效果，比如：更明亮的色彩、特定的表情、环境要求等..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-purple-600 font-medium">💡 您的描述将优先应用到生成中</p>
              <span class="text-xs text-gray-400">{userDescription.length}/200</span>
            </div>
          </div>

          <!-- 第四步：质量选择区域 -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
              <h2 class="text-xl font-bold text-gray-800">选择图片质量</h2>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-4">
              {#each qualities as quality}
                <button 
                  class="quality-btn p-4 rounded-lg border-2 text-center transition-all {selectedQuality === quality ? 'selected' : 'border-gray-200 hover:border-blue-300'}"
                  on:click={() => selectQuality(quality)}
                >
                  <div class="text-lg font-bold mb-1">{quality}</div>
                  <div class="text-sm text-blue-600 font-semibold">{qualityPrices[quality]} 积分</div>
                  <div class="text-xs text-gray-600">
                    {quality === '普通' ? '512x512' : quality === '高清' ? '1024x1024' : '2048x2048'}
                  </div>
                </button>
              {/each}
            </div>
            
            <!-- 快速模式选项 -->
            <div class="border-t pt-4">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  bind:checked={fastMode}
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                >
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800">⚡ 快速模式</div>
                  <div class="text-xs text-gray-600">大幅提升生成速度，略微降低分析精度</div>
                </div>
                <div class="text-xs text-green-600 font-semibold">节省50%时间</div>
              </label>
            </div>
          </div>

          <!-- 第五步：生成按钮 -->
          <div class="text-center py-6">
            <button 
              on:click={generateImage}
              disabled={isGenerating || !selectedImage}
              class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            >
              {#if isGenerating}
                {#if fastMode}
                  ⚡ 快速生成中...
                {:else}
                  🎨 生成中...
                {/if}
              {:else}
                {#if fastMode}
                  ⚡ 快速生成 (消耗 {qualityPrices[selectedQuality]} 积分)
                {:else}
                  🚀 开始生成 (消耗 {qualityPrices[selectedQuality]} 积分)
                {/if}
              {/if}
            </button>
            
            {#if fastMode && !isGenerating}
              <div class="mt-3 text-sm text-green-600 font-medium">
                ⚡ 快速模式已启用 - 预计30-45秒完成
              </div>
            {:else if !isGenerating}
              <div class="mt-3 text-sm text-gray-600">
                📊 标准模式 - 预计60-90秒完成
              </div>
            {/if}
          </div>

          <!-- 第六步：生成结果区域 (点击生成后显示) -->
          {#if isGenerating || resultImages.length > 0}
            <div id="result-section" class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="w-8 h-8 {isGenerating ? 'bg-purple-600' : 'bg-green-600'} text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {#if isGenerating}6{:else}✓{/if}
                </div>
                <h2 class="text-xl font-bold text-gray-800">{isGenerating ? '正在生成中...' : '生成结果'}</h2>
              </div>
              
              {#if isGenerating}
                <!-- 生成进度 -->
                <div class="py-8">
                  <div class="text-center mb-6">
                    <div class="text-lg font-semibold text-gray-800 mb-2">{generationStage}</div>
                    <div class="text-sm text-gray-600 mb-4">{generationProgress}% 完成</div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-4 max-w-md mx-auto">
                      <div 
                        class="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style="width: {generationProgress}%"
                      ></div>
                    </div>
                    {#if fastMode}
                      <div class="text-xs text-green-600 font-medium">⚡ 快速模式 - 预计还需 {Math.max(0, Math.round((100-generationProgress)/3))} 秒</div>
                    {:else}
                      <div class="text-xs text-gray-600">📊 标准模式 - 预计还需 {Math.max(0, Math.round((100-generationProgress)/2))} 秒</div>
                    {/if}
                  </div>
                  
                  <!-- 预览占位区域 -->
                  <div class="max-w-lg mx-auto">
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                      <div class="animate-pulse text-center">
                        <span class="text-6xl mb-4 block">🎨</span>
                        <div class="text-gray-500 text-sm">正在为您生成精美图片...</div>
                      </div>
                      <!-- 渐变遮罩效果 -->
                      <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              {:else if resultImages.length > 0}
                <!-- 生成结果 -->
                <div class="space-y-6">
                  {#each resultImages as image}
                    <div class="text-center">
                      <div class="max-w-lg mx-auto">
                        <div class="aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
                          <img 
                            src={image.url} 
                            alt="生成的图片" 
                            class="w-full h-full object-cover"
                            on:error={() => console.error('图片加载失败:', image.url)}
                          />
                        </div>
                        <div class="flex gap-3 justify-center">
                          <button 
                            on:click={() => downloadImage(image.url)}
                            class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            📥 下载图片
                          </button>
                          <button 
                            on:click={resetAll}
                            class="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            🔄 重新开始
                          </button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
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