<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { user, isLoggedIn, initializeAuth } from '$lib/stores/auth';

  let selectedImage: string | null = null;
  let selectedEmojiType = '情感表达';
  let selectedStyle = '卡通风格';
  let resultImages: Array<{url: string, id: number}> = [];
  let isGenerating = false;
  let generationProgress = 0;
  let generationStage = '';
  let uploadedFile: File | null = null;
  let dragOver = false;
  let showLogin = false;
  let userDescription = '';
  let isSatisfied: boolean | null = null;
  let savedToDatabase = false;

  // 参照表情包浏览页的分类
  const emojiTypes = [
    { name: '情感表达', icon: '😊', description: '开心、愤怒、悲伤等情感表达' },
    { name: '问候交流', icon: '👋', description: '打招呼、告别、感谢等交流表情' },
    { name: '生活状态', icon: '🍕', description: '吃饭、睡觉、工作等生活状态' },
    { name: '互动回应', icon: '👍', description: '点赞、鼓掌、比心等互动表情' },
    { name: '搞笑娱乐', icon: '😂', description: '搞笑、幽默、卖萌等娱乐表情' },
    { name: '节日庆祝', icon: '🎉', description: '春节、生日、情人节等节日表情' },
    { name: '职场商务', icon: '💼', description: '职场、商务、握手等工作表情' },
    { name: '语气辅助', icon: '🤔', description: '疑问、强调、无奈等语气表情' }
  ];

  // 制作风格
  const styles = [
    { name: '卡通风格', preview: '/styles/style1.png', description: '可爱卡通风格，色彩鲜艳' },
    { name: '真实风格', preview: '/styles/style2.png', description: '真实照片风格，自然逼真' },
    { name: '手绘风格', preview: '/styles/style3.png', description: '手绘插画风格，艺术感强' },
    { name: '像素风格', preview: '/styles/style4.png', description: '复古像素风格，怀旧感' }
  ];

  onMount(async () => {
    if (browser) {
      await initializeAuth();
    }
  });

  $: {
    if (browser && $isLoggedIn !== undefined) {
      showLogin = !$isLoggedIn;
    }
  }

  function handleImageUpload(event: Event) {
    const input = event.target;
    // @ts-ignore
    if (input?.files?.[0]) {
      // @ts-ignore
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

  function selectEmojiType(type: string) {
    selectedEmojiType = type;
  }

  function selectStyle(style: string) {
    selectedStyle = style;
  }

  async function generateEmoji() {
    if (!selectedImage || !uploadedFile) {
      alert('请先上传照片');
      return;
    }

    if (showLogin) {
      goto('/login');
      return;
    }

    isGenerating = true;
    generationProgress = 0;
    generationStage = '准备制作表情包...';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setTimeout(() => {
      const resultSection = document.getElementById('result-section');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);

    try {
      generationStage = '正在分析照片内容...';
      generationProgress = 20;

      // 创建FormData
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('emojiType', selectedEmojiType);
      formData.append('style', selectedStyle);
      formData.append('userDescription', userDescription);

      // 调用表情包生成API
      const response = await fetch('/api/emoji-generation', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      generationStage = '正在应用表情包效果...';
      generationProgress = 60;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '服务器错误');
      }

      generationStage = '正在生成表情包...';
      generationProgress = 80;

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '生成失败');
      }

      // 使用真实生成的表情包
      resultImages = [
        { url: result.data.generatedImage, id: 1 }
      ];

      generationStage = '表情包制作完成！';
      generationProgress = 100;

      console.log('表情包生成结果:', {
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

  async function saveToDatabase() {
    if (!resultImages.length) return;
    
    try {
      const response = await fetch('/api/emoji-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emojiUrl: resultImages[0].url,
          emojiType: selectedEmojiType,
          style: selectedStyle
        }),
        credentials: 'include'
      });

      if (response.ok) {
        savedToDatabase = true;
        alert('表情包已保存到您的作品库！');
      } else {
        const error = await response.json();
        alert(`保存失败: ${error.error}`);
      }
    } catch (error) {
      console.error('保存表情包失败:', error);
      alert('保存失败，请重试');
    }
  }

  function downloadEmoji(imageUrl: string) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `表情包_${selectedEmojiType}_${Date.now()}.png`;
    link.click();
  }

  function resetAll() {
    selectedImage = null;
    uploadedFile = null;
    resultImages = [];
    isGenerating = false;
    generationProgress = 0;
    generationStage = '';
    isSatisfied = null;
    savedToDatabase = false;
  }

  function handleImageError(e: Event) {
    const target = e.target;
    // @ts-ignore
    if (target && target.src) {
      // @ts-ignore
      target.src = '/recommendations/emoji/emoji1.png';
    }
  }
</script>

<svelte:head>
  <title>表情包大师 - 狗狗造梦家</title>
  <meta name="description" content="AI智能表情包制作工具，上传照片即可生成个性化表情包" />
</svelte:head>

<style>
  .upload-area {
    transition: all 0.3s ease;
  }
  .upload-area.drag-over {
    border-color: #f59e0b;
    background-color: #fef3c7;
    transform: scale(1.02);
  }
  .style-card {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .style-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
  .style-card.selected {
    border-color: #f59e0b;
    background-color: #fef3c7;
    transform: translateY(-2px);
  }
  .emoji-type-card {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .emoji-type-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  .emoji-type-card.selected {
    border-color: #f59e0b;
    background-color: #fef3c7;
    transform: translateY(-2px);
  }
  .result-card {
    transition: all 0.3s ease;
  }
  .result-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">表情包大师</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-90">AI智能表情包制作工具</p>
      <p class="text-lg opacity-80">上传照片，选择类型，一键生成个性化表情包</p>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- 步骤1: 上传照片 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
      <div class="flex items-center mb-6">
        <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">1</div>
        <h2 class="text-2xl font-bold text-gray-900">选择照片</h2>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 上传区域 -->
        <div>
          <div 
            class="upload-area border-2 border-dashed border-gray-300 rounded-xl p-8 text-center {dragOver ? 'drag-over' : ''}"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
          >
            {#if selectedImage}
              <img src={selectedImage} alt="上传的照片" class="max-w-full max-h-64 mx-auto rounded-lg shadow-md" />
              <p class="mt-4 text-gray-600">照片已上传，可以重新选择</p>
            {:else}
              <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
              <p class="text-xl font-semibold text-gray-700 mb-2">拖拽照片到这里</p>
              <p class="text-gray-500 mb-4">或者点击下方按钮选择文件</p>
            {/if}
            
            <input 
              type="file" 
              accept="image/*" 
              on:change={handleImageUpload}
              class="hidden"
              id="image-upload"
            />
            <label 
              for="image-upload" 
              class="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors font-medium"
            >
              选择照片
            </label>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-gray-900">使用说明</h3>
          <div class="space-y-3">
            <div class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <p class="font-medium text-gray-800">支持格式</p>
                <p class="text-gray-600 text-sm">JPG、PNG、WEBP等常见图片格式</p>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <p class="font-medium text-gray-800">最佳效果</p>
                <p class="text-gray-600 text-sm">清晰的人物照片，表情明显</p>
              </div>
            </div>
            <div class="flex items-start">
              <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
              <div>
                <p class="font-medium text-gray-800">文件大小</p>
                <p class="text-gray-600 text-sm">建议不超过10MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤2: 选择表情包类型 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
      <div class="flex items-center mb-6">
        <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">2</div>
        <h2 class="text-2xl font-bold text-gray-900">选择表情包类型</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each emojiTypes as type}
          <div 
            class="emoji-type-card border-2 border-gray-200 rounded-xl p-4 text-center {selectedEmojiType === type.name ? 'selected' : ''}"
            on:click={() => selectEmojiType(type.name)}
          >
            <div class="text-3xl mb-2">{type.icon}</div>
            <h3 class="font-bold text-gray-900 mb-1">{type.name}</h3>
            <p class="text-sm text-gray-600">{type.description}</p>
          </div>
        {/each}
      </div>
    </div>

    <!-- 步骤3: 选择制作风格 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
      <div class="flex items-center mb-6">
        <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">3</div>
        <h2 class="text-2xl font-bold text-gray-900">选择制作风格</h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        {#each styles as style}
          <div 
            class="style-card border-2 border-gray-200 rounded-xl overflow-hidden {selectedStyle === style.name ? 'selected' : ''}"
            on:click={() => selectStyle(style.name)}
          >
            <img 
              src={style.preview} 
              alt={style.name}
              class="w-full h-32 object-cover"
              on:error={handleImageError}
            />
            <div class="p-4">
              <h3 class="font-bold text-gray-900 mb-1">{style.name}</h3>
              <p class="text-sm text-gray-600">{style.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 步骤4: 自定义描述 -->
    <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
      <div class="flex items-center mb-6">
        <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">4</div>
        <h2 class="text-2xl font-bold text-gray-900">自定义描述</h2>
        <span class="ml-3 text-sm text-gray-500">(可选)</span>
      </div>
      
      <div class="max-w-2xl">
        <label for="user-description" class="block text-sm font-medium text-gray-700 mb-2">
          添加您的创意描述
        </label>
        <textarea
          id="user-description"
          bind:value={userDescription}
          placeholder="例如：让表情更加夸张一些，添加一些搞笑元素，或者特定的背景色彩..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 resize-none"
          rows="3"
        ></textarea>
        <p class="text-sm text-gray-500 mt-2">
          <i class="fas fa-lightbulb mr-1"></i>
          描述您希望的表情包效果，AI会根据您的描述进行个性化制作
        </p>
      </div>
    </div>

    <!-- 生成按钮 -->
    <div class="text-center mb-8">
      <button 
        on:click={generateEmoji}
        disabled={!selectedImage || isGenerating}
        class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
      >
        {#if isGenerating}
          <i class="fas fa-spinner fa-spin mr-2"></i>
          制作中...
        {:else}
          <i class="fas fa-magic mr-2"></i>
          开始制作表情包
        {/if}
      </button>
    </div>

    <!-- 生成进度 -->
    {#if isGenerating}
      <div id="result-section" class="bg-white rounded-2xl p-8 shadow-lg mb-8">
        <div class="text-center">
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <i class="fas fa-cog fa-spin text-2xl text-yellow-600"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{generationStage}</h3>
          </div>
          
          <div class="max-w-md mx-auto">
            <div class="bg-gray-200 rounded-full h-3 mb-4">
              <div 
                class="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style="width: {generationProgress}%"
              ></div>
            </div>
            <p class="text-gray-600">{generationProgress}% 完成</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- 步骤5: 生成结果 -->
    {#if resultImages.length > 0 && !isGenerating}
      <div id="result-section" class="bg-white rounded-2xl p-8 shadow-lg mb-8">
        <div class="flex items-center mb-6">
          <div class="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">5</div>
          <h2 class="text-2xl font-bold text-gray-900">生成结果</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {#each resultImages as image}
            <div class="result-card bg-gray-50 rounded-xl p-4">
              <div class="w-full aspect-square bg-white rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img 
                  src={image.url} 
                  alt="生成的表情包" 
                  class="max-w-full max-h-full object-contain"
                  on:error={handleImageError}
                />
              </div>
              <button 
                on:click={() => downloadEmoji(image.url)}
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-download mr-2"></i>
                下载
              </button>
            </div>
          {/each}
        </div>

        <!-- 满意度确认 -->
        <div class="text-center border-t pt-8">
          <h3 class="text-lg font-bold text-gray-900 mb-4">您对生成的表情包满意吗？</h3>
          <div class="flex justify-center gap-4 mb-6">
            <button 
              on:click={() => isSatisfied = false}
              class="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors {isSatisfied === false ? 'bg-red-50 border-red-500' : ''}"
            >
              <i class="fas fa-times mr-2"></i>
              不满意，重新制作
            </button>
            <button 
              on:click={() => isSatisfied = true}
              class="px-6 py-3 border-2 border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors {isSatisfied === true ? 'bg-green-50 border-green-500' : ''}"
            >
              <i class="fas fa-check mr-2"></i>
              满意，保存作品
            </button>
          </div>

          {#if isSatisfied === false}
            <button 
              on:click={resetAll}
              class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <i class="fas fa-redo mr-2"></i>
              重新开始制作
            </button>
          {:else if isSatisfied === true}
            <button 
              on:click={saveToDatabase}
              disabled={savedToDatabase}
              class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {#if savedToDatabase}
                <i class="fas fa-check mr-2"></i>
                已保存到作品库
              {:else}
                <i class="fas fa-save mr-2"></i>
                保存到作品库
              {/if}
            </button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- 登录提示 -->
    {#if showLogin}
      <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
        <i class="fas fa-user-circle text-4xl text-yellow-600 mb-4"></i>
        <h3 class="text-lg font-bold text-gray-900 mb-2">登录后使用完整功能</h3>
        <p class="text-gray-600 mb-4">登录后可以保存作品、查看历史记录等</p>
        <button 
          on:click={() => goto('/login')}
          class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          立即登录
        </button>
      </div>
    {/if}
  </div>
</div> 