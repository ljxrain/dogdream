<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedImage: File | null = null;
  let imagePreview: string = '';
  let isLoading = false;
  let result: any = null;
  let error: string = '';
  let selectedStyle = 'anime';
  let styleStrength = 0.8;
  let accessKeyId = 'AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ';
  let secretAccessKey = 'TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==';

  const styleOptions = [
    { value: 'anime', label: '动漫风格', description: '将照片转换为动漫风格' },
    { value: 'oil_painting', label: '油画风格', description: '艺术油画效果' },
    { value: 'watercolor', label: '水彩画', description: '清新水彩效果' },
    { value: 'sketch', label: '素描风格', description: '铅笔素描效果' }
  ];

  function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      selectedImage = file;
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // 清空之前的结果
      result = null;
      error = '';
    }
  }
  
  async function testVolcanoCV() {
    if (!selectedImage) {
      error = '请先选择一张图片';
      return;
    }

    if (!accessKeyId || !secretAccessKey) {
      error = '请先配置火山引擎的AccessKey和SecretKey';
      return;
    }
    
    isLoading = true;
    error = '';
    result = null;
    
    try {
      // 首先更新配置
      await updateAPIConfig();
      
      // 准备FormData
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('style', selectedStyle);
      formData.append('strength', styleStrength.toString());
      formData.append('accessKeyId', accessKeyId);
      formData.append('secretAccessKey', secretAccessKey);
      
             console.log('🔥 调用火山引擎CV API...');
      
      // 调用火山引擎CV API（图生图）
      const response = await fetch('/api/volcano-cv', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      result = data;
      
      console.log('✅ 火山引擎CV API响应:', data);
      
    } catch (err) {
      error = err instanceof Error ? err.message : '未知错误';
      console.error('❌ 火山引擎CV API调用失败:', err);
    } finally {
      isLoading = false;
    }
  }

  async function updateAPIConfig() {
    try {
      // 这里可以添加配置更新的逻辑
      console.log('📝 更新API配置...');
    } catch (err) {
      console.error('配置更新失败:', err);
    }
  }
  
  function resetTest() {
    selectedImage = null;
    imagePreview = '';
    result = null;
    error = '';
    
    // 清空文件输入
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
</script>

<svelte:head>
  <title>火山引擎CV API测试 - 造梦家</title>
  <meta name="description" content="火山引擎CV服务图生图API测试页面" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-6xl mx-auto px-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">🔥 火山引擎CV图生图测试</h1>
      <p class="text-gray-600">使用火山引擎CV服务进行图像风格转换（图生图）</p>
      <div class="text-sm text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full">
        API: visual.volcengineapi.com | CVProcess | img2img_anime_accelerated
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 左侧：配置和上传区域 -->
      <div class="space-y-6">
        <!-- API配置 -->
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-red-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">🔑 API配置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                AccessKeyId <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                bind:value={accessKeyId}
                placeholder="请输入您的AccessKeyId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                SecretAccessKey <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                bind:value={secretAccessKey}
                placeholder="请输入您的SecretAccessKey"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- 图片上传 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">📸 上传测试图片</h2>
          
          <div class="space-y-4">
            <!-- 文件选择 -->
            <div>
              <label for="imageInput" class="block text-sm font-medium text-gray-700 mb-2">
                选择图片文件
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                on:change={handleImageSelect}
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <!-- 图片预览 -->
            {#if imagePreview}
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  图片预览
                </label>
                <div class="relative">
                  <img 
                    src={imagePreview} 
                    alt="预览图片" 
                    class="w-full max-w-sm rounded-lg shadow-sm"
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- 风格设置 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">🎨 风格设置</h2>
          
          <div class="space-y-4">
            <!-- 风格选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                选择风格类型
              </label>
              <select 
                bind:value={selectedStyle}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {#each styleOptions as option}
                  <option value={option.value}>
                    {option.label} - {option.description}
                  </option>
                {/each}
              </select>
            </div>
            
            <!-- 强度调节 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                风格强度: {styleStrength}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                bind:value={styleStrength}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>轻微 (0.1)</span>
                <span>强烈 (1.0)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 测试按钮 -->
        <div class="flex space-x-4">
          <button
            on:click={testVolcanoCV}
            disabled={isLoading || !selectedImage || !accessKeyId || !secretAccessKey}
            class="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {#if isLoading}
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在调用火山引擎CV API...
              </span>
            {:else}
                             🚀 测试火山引擎CV图生图
            {/if}
          </button>
          
          <button
            on:click={resetTest}
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      <!-- 右侧：结果显示区域 -->
      <div class="space-y-6">
        <!-- 错误显示 -->
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-red-800 mb-2">❌ 错误信息</h3>
            <p class="text-red-700">{error}</p>
          </div>
        {/if}

        <!-- 成功结果 -->
        {#if result && result.success}
          <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-green-800 mb-4">✅ 处理成功</h3>
            
            <div class="space-y-4">
              <!-- 处理信息 -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-2">处理信息</h4>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><strong>消息:</strong> {result.message}</p>
                  <p><strong>风格:</strong> {result.data.style}</p>
                  <p><strong>强度:</strong> {result.data.strength}</p>
                  <p><strong>处理时间:</strong> {result.metadata.processedAt}</p>
                  <p><strong>API提供商:</strong> {result.metadata.apiProvider}</p>
                  <p><strong>请求密钥:</strong> {result.metadata.reqKey}</p>
                </div>
              </div>

              <!-- 生成的图片 -->
              {#if result.data.generatedImage}
                <div class="bg-white rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">生成的图片</h4>
                  <img 
                    src={result.data.generatedImage} 
                    alt="生成的图片" 
                    class="w-full rounded-lg shadow-sm"
                  />
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- 加载状态 -->
        {#if isLoading}
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div class="flex items-center space-x-3">
              <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                             <span class="text-blue-800">正在调用火山引擎CV API...</span>
            </div>
            <div class="mt-4 text-sm text-blue-600">
              <p>步骤：图片上传 → 签名计算 → API调用 → 结果处理</p>
            </div>
          </div>
        {/if}

        <!-- API信息 -->
        <div class="bg-gray-50 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 API信息</h3>
          <div class="text-sm text-gray-600 space-y-2">
            <p><strong>端点:</strong> /api/volcano-cv</p>
            <p><strong>服务:</strong> visual.volcengineapi.com</p>
            <p><strong>动作:</strong> CVProcess</p>
            <p><strong>版本:</strong> 2022-08-31</p>
            <p><strong>模型:</strong> img2img_anime_accelerated</p>
            <p><strong>流程:</strong> 上传图片 → 风格转换 → 返回结果</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    background: #3B82F6;
    border-radius: 50%;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    height: 20px;
    width: 20px;
    background: #3B82F6;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
</style> 