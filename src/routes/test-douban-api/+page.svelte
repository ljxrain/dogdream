<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedImage: File | null = null;
  let imagePreview: string = '';
  let isLoading = false;
  let result: any = null;
  let error: string = '';
  let selectedStyle = 'anime';
  let styleStrength = 0.8;
  let userDescription = '';
  let isSimulationMode = false;
  let fastMode = false;

  const styleOptions = [
    { value: 'anime', label: '动漫风格', description: '将照片转换为动漫风格' },
    { value: 'oil_painting', label: '油画风格', description: '艺术油画效果' },
    { value: 'watercolor', label: '水彩画', description: '清新水彩效果' },
    { value: 'sketch', label: '素描风格', description: '铅笔素描效果' }
  ];
  
  // 豆包API配置
  const API_CONFIG = {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    visionModel: '250415',
    imageGenModel: '250415',
    provider: '豆包AI'
  };
  
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
  
    async function testAPI() {
    if (!selectedImage) {
      error = '请先选择一张图片';
      return;
    }
    
    isLoading = true;
    error = '';
    result = null;
    
    try {
      if (isSimulationMode) {
        // 模拟模式 - 用于界面测试
        setTimeout(() => {
          result = {
            success: true,
            message: '图片风格化处理成功（模拟）',
            data: {
              result_base64: imagePreview, // 使用原图作为示例
              process_time: 2.5,
              style_applied: selectedStyle,
              strength_used: styleStrength
            },
            metadata: {
              originalFile: {
                name: selectedImage?.name,
                size: selectedImage?.size,
                type: selectedImage?.type
              },
              processedAt: new Date().toISOString(),
              apiProvider: 'volcengine-simulation',
              mode: 'simulation'
            }
          };
          isLoading = false;
        }, 2000);
        return;
      }
      
      // 准备FormData
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('style', selectedStyle);
      formData.append('strength', styleStrength.toString());
      formData.append('userDescription', userDescription);
      formData.append('fastMode', fastMode.toString());
      
      // 调用火山引擎API
      const response = await fetch('/api/douban-test', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      result = data;
      
    } catch (err) {
      error = err instanceof Error ? err.message : '未知错误';
      console.error('API调用失败:', err);
    } finally {
      if (!isSimulationMode) {
        isLoading = false;
      }
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
  	<title>火山引擎API测试 - 狗狗造梦家</title>
  <meta name="description" content="火山引擎AIGC图像风格化API测试页面" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-4xl mx-auto px-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">豆包AI图像分析与生成测试</h1>
      <p class="text-gray-600">使用豆包Vision分析图片 + Seedream生成风格化图片</p>
      <div class="text-sm text-gray-500 mt-2">
        步骤：上传图片 → Vision分析 → 生成Prompt → Seedream生成图片
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 左侧：上传和控制区域 -->
      <div class="space-y-6">
        <!-- 图片上传 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">上传测试图片</h2>
          
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
          <h2 class="text-xl font-semibold text-gray-900 mb-4">风格设置</h2>
          
          <div class="space-y-4">
            <!-- 风格选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                选择风格类型
              </label>
              <select 
                bind:value={selectedStyle}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>弱</span>
                <span>强</span>
              </div>
            </div>
            
            <!-- 用户补充描述 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                补充描述（可选）
              </label>
              <textarea
                bind:value={userDescription}
                placeholder="添加您的特殊要求或描述，例如：更明亮的色彩、特定的表情、环境要求等..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="3"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">这些描述将结合AI分析结果生成最终的图片生成指令</p>
            </div>

            <!-- 快速模式选项 -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  bind:checked={fastMode}
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  🚀 <strong>快速模式</strong>
                  <span class="text-gray-600">(降低分辨率和分析详细度以提高生成速度)</span>
                </span>
              </label>
              <p class="text-xs text-blue-600 mt-2 ml-6">
                启用后：512x512分辨率（普通1024x1024），简化分析，约提速40%
              </p>
            </div>
          </div>
        </div>

        <!-- API配置信息 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">API配置</h2>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">服务商:</span>
              <span class="text-gray-900 font-mono">{API_CONFIG.provider}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">基础URL:</span>
              <span class="text-gray-900 font-mono">{API_CONFIG.baseURL}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Vision模型:</span>
              <span class="text-gray-900 font-mono">{API_CONFIG.visionModel}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">图像生成模型:</span>
              <span class="text-gray-900 font-mono">{API_CONFIG.imageGenModel}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">认证:</span>
              <span class="text-green-600 font-mono">已配置API Key</span>
            </div>
          </div>
          
          <!-- API状态提示 -->
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center">
              <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              <span class="text-sm text-yellow-800">
                API集成调试中 - 建议使用模拟模式测试
              </span>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">测试控制</h2>
          
          <!-- 模拟模式开关 -->
          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={isSimulationMode}
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">
                模拟模式 
                <span class="text-gray-500">(用于界面测试，不调用真实API)</span>
              </span>
            </label>
          </div>
          
          <div class="flex gap-4">
            <button
              on:click={testAPI}
              disabled={!selectedImage || isLoading}
              class="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {#if isLoading}
                <i class="fas fa-spinner fa-spin mr-2"></i>
                {isSimulationMode ? '模拟处理中...' : '测试中...'}
              {:else}
                <i class="fas fa-play mr-2"></i>
                {isSimulationMode ? '模拟测试' : '真实API测试'}
              {/if}
            </button>
            
            <button
              on:click={resetTest}
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <i class="fas fa-refresh mr-2"></i>
              重置
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：结果显示区域 -->
      <div class="space-y-6">
        <!-- 错误信息 -->
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div class="flex items-center mb-2">
              <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <h3 class="text-lg font-semibold text-red-800">测试失败</h3>
            </div>
            <p class="text-red-700">{error}</p>
          </div>
        {/if}

        <!-- 成功结果 -->
        {#if result}
          <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div class="flex items-center mb-4">
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <h3 class="text-lg font-semibold text-green-800">测试成功</h3>
            </div>
            
            <!-- 结果数据 -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  API响应数据
                </label>
                <pre class="bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
{JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              <!-- 显示生成的图片 -->
              {#if result.data?.generatedImage}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    生成的风格化图片
                  </label>
                  <div class="relative">
                    <img 
                      src={result.data.generatedImage} 
                      alt="AI生成的风格化图片" 
                      class="max-w-full rounded-lg shadow-sm border"
                      on:error={() => console.error('图片加载失败:', result.data.generatedImage)}
                    />
                    <div class="bg-red-50 border border-red-200 rounded p-4 hidden">
                      <p class="text-red-600 text-sm">图片加载失败</p>
                      <p class="text-gray-500 text-xs mt-1">URL: {result.data.generatedImage}</p>
                    </div>
                    
                    {#if result.metadata?.mode === 'simulation'}
                      <div class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        模拟
                      </div>
                    {/if}
                  </div>
                  
                  <!-- 处理信息 -->
                  <p class="text-sm text-gray-600 mt-2">
                    风格: {result.data.style} | 
                    强度: {result.data.strength} |
                    步骤: {result.data.processSteps.step3}
                  </p>
                  
                  <!-- 图片链接 -->
                  <div class="mt-2">
                    <a 
                      href={result.data.generatedImage} 
                      target="_blank" 
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <i class="fas fa-external-link-alt mr-1"></i>
                      在新窗口查看图片
                    </a>
                  </div>
                </div>
              {:else if result.data?.result_base64}
                <!-- 兼容旧的模拟模式格式 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    处理后的图片（模拟）
                  </label>
                  <div class="relative">
                    <img 
                      src={result.data.result_base64.startsWith('data:') ? result.data.result_base64 : `data:image/jpeg;base64,${result.data.result_base64}`} 
                      alt="风格化处理结果" 
                      class="max-w-full rounded-lg shadow-sm"
                    />
                    <div class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                      模拟
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- 加载状态 -->
        {#if isLoading}
          <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div class="flex items-center justify-center">
              <i class="fas fa-spinner fa-spin text-blue-500 mr-3"></i>
              <span class="text-blue-800">正在调用火山引擎API...</span>
            </div>
          </div>
        {/if}

        <!-- 使用说明 -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div class="flex items-center mb-2">
            <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
            <h3 class="text-lg font-semibold text-yellow-800">使用说明</h3>
          </div>
          <div class="text-yellow-700 text-sm space-y-2">
            <p>1. 上传一张测试图片</p>
            <p>2. 配置API相关信息（代码中修改）</p>
            <p>3. 点击"开始测试"调用API</p>
            <p>4. 查看API响应结果和错误信息</p>
            <p>5. 根据测试结果调整API调用逻辑</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 