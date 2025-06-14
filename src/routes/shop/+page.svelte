<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let currentStep = 1;
  let selectedImage: string | null = null;
  let selectedImageFile: File | null = null;
  let selectedProduct: any = null;
  let customizedPreview: string | null = null;
  let orderData: any = null;
  let isGeneratingPreview = false;
  let previewError: string | null = null;
  
  // 订单表单数据
  let orderForm = {
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    zipCode: '',
    notes: ''
  };
  
  // 宠物pod定制产品
  const products = [
    { 
      id: 1, 
      name: '宠物马克杯', 
      price: 68, 
      desc: '陶瓷材质，保温性好，将你的宠物照片印在杯子上，每天喝水都能看到爱宠', 
      img: '/api/images/微信图片_20250603200400.jpg',
      category: 'drinkware',
      printArea: { width: 200, height: 150 }
    },
    { 
      id: 2, 
      name: '宠物抱枕', 
      price: 88, 
      desc: '柔软舒适，高品质面料，将宠物照片印在抱枕中央，温馨陪伴每一天', 
      img: '/api/images/微信图片_20250603200425.jpg',
      category: 'home',
      printArea: { width: 250, height: 250 }
    },
    { 
      id: 3, 
      name: '宠物T恤', 
      price: 78, 
      desc: '优质纯棉面料，舒适透气，胸前印制宠物照片，展现对爱宠的喜爱', 
      img: '/api/images/微信图片_20250603200431.jpg',
      category: 'clothing',
      printArea: { width: 180, height: 200 }
    },
    { 
      id: 4, 
      name: '宠物手机壳', 
      price: 45, 
      desc: '适用多种型号，防摔防刮，背面印制宠物照片，随时随地看到爱宠', 
      img: '/api/images/微信图片_20250603200438.jpg',
      category: 'accessory',
      printArea: { width: 120, height: 180 }
    },
    { 
      id: 5, 
      name: '宠物钥匙链', 
      price: 35, 
      desc: '亚克力材质，小巧精致，双面印制，携带便利，展现独特品味', 
      img: '/api/images/微信图片_20250603200446.jpg',
      category: 'accessory',
      printArea: { width: 80, height: 80 }
    },
    { 
      id: 6, 
      name: '宠物车载摆件', 
      price: 128, 
      desc: '3D立体打印，精工制作，车内专用，让每次出行都有爱宠陪伴', 
      img: '/api/images/微信图片_20250603200453.jpg',
      category: 'car',
      printArea: { width: 100, height: 120 }
    }
  ];

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function nextStep() {
    if (currentStep === 1 && !selectedImage) {
      alert('请先选择宠物照片');
      return;
    }
    if (currentStep === 2 && !selectedProduct) {
      alert('请先选择要定制的产品');
      return;
    }
    if (currentStep < 5) {
      currentStep++;
      if (currentStep === 3) {
        await generatePreview();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function selectProduct(product: any) {
    selectedProduct = product;
  }

  async function generatePreview() {
    if (!selectedImageFile || !selectedProduct) {
      return;
    }

    isGeneratingPreview = true;
    previewError = null;

    try {
      const formData = new FormData();
      formData.append('image', selectedImageFile);
      formData.append('productName', selectedProduct.name);
      formData.append('fastMode', 'false');

      const response = await fetch('/api/pet-pod-preview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '预览生成失败');
      }

      const result = await response.json();
      
      if (result.success) {
        customizedPreview = result.data.previewImage;
      } else {
        throw new Error(result.error || '预览生成失败');
      }

    } catch (error) {
      console.error('生成预览失败:', error);
      previewError = error instanceof Error ? error.message : '预览生成失败，请重试';
      // 如果API失败，使用原图作为预览
      customizedPreview = selectedImage;
    } finally {
      isGeneratingPreview = false;
    }
  }

  async function confirmOrder() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productName: selectedProduct.name,
          productPrice: selectedProduct.price,
          petImageUrl: selectedImage,
          customPreviewUrl: customizedPreview,
          recipientName: orderForm.recipientName,
          recipientPhone: orderForm.recipientPhone,
          shippingAddress: orderForm.shippingAddress,
          shippingCity: orderForm.shippingCity,
          shippingProvince: orderForm.shippingProvince,
          zipCode: orderForm.zipCode,
          customNotes: orderForm.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '订单提交失败');
      }

      const result = await response.json();
      
      if (result.success) {
        orderData = {
          id: result.data.orderNumber,
          orderNumber: result.data.orderNumber,
          product: selectedProduct,
          image: selectedImage,
          price: selectedProduct.price,
          status: 'processing',
          createTime: new Date().toLocaleString(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          orderId: result.data.order.id
        };
        
        currentStep = 5;
      } else {
        throw new Error(result.error || '订单提交失败');
      }
      
    } catch (error) {
      console.error('订单提交失败:', error);
      alert(error instanceof Error ? error.message : '订单提交失败，请重试');
    }
  }

  function goToOrders() {
    goto('/orders');
  }

  function restartCustomization() {
    currentStep = 1;
    selectedImage = null;
    selectedProduct = null;
    customizedPreview = null;
    orderData = null;
  }
</script>

<svelte:head>
  <title>宠物Pod定制商城 - 狗狗造梦家</title>
  <meta name="description" content="专业宠物照片定制产品，将你的爱宠印在各种商品上" />
</svelte:head>

<style>
  .step-indicator {
    transition: all 0.3s ease;
  }
  .step-indicator.active {
    background-color: #8b5cf6;
    color: white;
  }
  .step-indicator.completed {
    background-color: #10b981;
    color: white;
  }
  .product-card {
    transition: all 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
  .product-card.selected {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }
  .upload-area {
    transition: all 0.3s ease;
  }
  .upload-area:hover {
    border-color: #8b5cf6;
    background-color: #faf5ff;
  }
  .preview-container {
    position: relative;
    display: inline-block;
  }
  .pet-image-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 8px;
    opacity: 0.9;
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">🐾 宠物Pod定制商城</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-90">将你的爱宠印在专属商品上</p>
      <p class="text-lg opacity-80">5步轻松定制，让爱宠陪伴你的每一天</p>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- 步骤指示器 -->
    <div class="flex items-center justify-center mb-12">
      <div class="flex items-center space-x-4">
        {#each [
          { num: 1, title: '选择照片', desc: '上传宠物照片' },
          { num: 2, title: '选择产品', desc: '挑选定制商品' },
          { num: 3, title: '预览效果', desc: '查看定制效果' },
          { num: 4, title: '确认下单', desc: '填写订单信息' },
          { num: 5, title: '完成订单', desc: '订单跟踪' }
        ] as step, index}
          <div class="flex items-center">
            <div class="text-center">
              <div class="step-indicator w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center font-bold mb-2 {
                currentStep === step.num ? 'active' : 
                currentStep > step.num ? 'completed' : ''
              }">
                {#if currentStep > step.num}
                  <i class="fas fa-check"></i>
                {:else}
                  {step.num}
                {/if}
              </div>
              <div class="text-sm font-medium text-gray-700">{step.title}</div>
              <div class="text-xs text-gray-500">{step.desc}</div>
            </div>
            {#if index < 4}
              <div class="w-16 h-0.5 bg-gray-300 mx-4 {currentStep > step.num ? 'bg-green-500' : ''}"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      
      <!-- 步骤1: 选择宠物照片 -->
      {#if currentStep === 1}
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">📸 上传你的宠物照片</h2>
            <p class="text-gray-600">选择一张清晰的宠物照片，我们会将它印制在你选择的商品上</p>
          </div>
          
          {#if selectedImage}
            <div class="text-center">
              <div class="relative inline-block">
                <img src={selectedImage} alt="宠物照片" class="max-w-md max-h-96 rounded-lg shadow-lg mx-auto" />
                <button 
                  on:click={() => selectedImage = null}
                  class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
              <p class="text-green-600 font-medium mt-4">✅ 照片已选择，点击下一步继续</p>
            </div>
          {:else}
            <div class="upload-area border-2 border-dashed border-gray-300 rounded-xl p-12 text-center max-w-2xl mx-auto">
              <i class="fas fa-paw text-6xl text-purple-400 mb-6"></i>
              <h3 class="text-xl font-semibold text-gray-700 mb-4">上传宠物照片</h3>
              <p class="text-gray-500 mb-6">支持 JPG、PNG 格式，建议尺寸不小于 500x500 像素</p>
              <label class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                选择照片
                <input type="file" accept="image/*" on:change={handleFileSelect} class="hidden" />
              </label>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 步骤2: 选择产品 -->
      {#if currentStep === 2}
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">🛍️ 选择定制产品</h2>
            <p class="text-gray-600">选择你想要将宠物照片印制在哪种商品上</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each products as product}
              <div 
                class="product-card bg-white rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer {selectedProduct?.id === product.id ? 'selected' : ''}"
                on:click={() => selectProduct(product)}
                on:keydown={(e) => e.key === 'Enter' && selectProduct(product)}
                tabindex="0"
                role="button"
              >
                <div class="aspect-square bg-gray-100 flex items-center justify-center">
                  <i class="fas fa-image text-4xl text-gray-400"></i>
                </div>
                <div class="p-4">
                  <h4 class="font-bold text-lg text-gray-900 mb-2">{product.name}</h4>
                  <p class="text-gray-600 text-sm mb-3 line-clamp-2">{product.desc}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold text-purple-600">¥{product.price}</span>
                    {#if selectedProduct?.id === product.id}
                      <span class="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ 已选择
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 步骤3: 预览效果 -->
      {#if currentStep === 3}
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">👀 预览定制效果</h2>
            <p class="text-gray-600">查看你的宠物照片在 {selectedProduct?.name} 上的效果</p>
          </div>
          
          {#if isGeneratingPreview}
            <div class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">🎨 AI正在生成定制预览</h3>
              <p class="text-gray-600">使用豆包AI分析您的宠物照片并生成专业定制效果...</p>
              <div class="mt-4 max-w-md mx-auto bg-gray-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full animate-pulse" style="width: 60%"></div>
              </div>
            </div>
          {:else}
            <div class="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <!-- 原始照片 -->
              <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">原始照片</h3>
                <img src={selectedImage} alt="原始宠物照片" class="w-64 h-64 object-cover rounded-lg shadow-lg" />
              </div>
              
              <!-- 箭头 -->
              <div class="text-purple-600">
                <i class="fas fa-arrow-right text-3xl lg:block hidden"></i>
                <i class="fas fa-arrow-down text-3xl lg:hidden block"></i>
              </div>
              
              <!-- 预览效果 -->
              <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">AI定制效果预览</h3>
                <div class="preview-container">
                  {#if customizedPreview}
                    <img 
                      src={customizedPreview} 
                      alt="AI生成的定制预览" 
                      class="w-80 h-80 object-cover rounded-lg shadow-lg border-2 border-purple-200"
                    />
                    <div class="mt-2 text-sm text-green-600 flex items-center justify-center">
                      <i class="fas fa-check-circle mr-1"></i>
                      由豆包AI生成
                    </div>
                  {:else}
                    <!-- 产品背景 -->
                    <div class="w-80 h-80 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center relative">
                      <div class="text-gray-400 text-center">
                        <i class="fas fa-image text-6xl mb-2"></i>
                        <p>预览生成中...</p>
                      </div>
                    </div>
                  {/if}
                </div>
                
                {#if previewError}
                  <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-red-600 text-sm">⚠️ {previewError}</p>
                    <button 
                      on:click={generatePreview}
                      class="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                    >
                      重新生成预览
                    </button>
                  </div>
                {/if}
                
                <p class="text-sm text-gray-500 mt-4">* 使用豆包AI技术生成专业定制效果</p>
              </div>
            </div>
            
            <div class="text-center mt-8">
              <div class="bg-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h4 class="font-semibold text-purple-900 mb-2">AI定制说明</h4>
                <p class="text-purple-700 text-sm">
                  我们使用豆包AI技术分析您的宠物照片，并将其完美印制在 {selectedProduct?.name} 的中央位置。
                  AI会自动调整照片尺寸、位置和效果，确保最佳的定制效果。
                </p>
                {#if !isGeneratingPreview && !customizedPreview}
                  <button 
                    on:click={generatePreview}
                    class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    🎨 重新生成AI预览
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 步骤4: 确认下单 -->
      {#if currentStep === 4}
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">📋 确认订单信息</h2>
            <p class="text-gray-600">请确认你的定制商品信息</p>
          </div>
          
          <div class="max-w-2xl mx-auto">
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4">订单详情</h3>
              <div class="flex items-center gap-4 mb-4">
                <img src={selectedImage} alt="宠物照片" class="w-20 h-20 object-cover rounded-lg" />
                <div class="flex-1">
                  <h4 class="font-medium">{selectedProduct?.name}</h4>
                  <p class="text-gray-600 text-sm">{selectedProduct?.desc}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">¥{selectedProduct?.price}</div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4">配送信息</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="收货人姓名" 
                  bind:value={orderForm.recipientName}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <input 
                  type="tel" 
                  placeholder="联系电话" 
                  bind:value={orderForm.recipientPhone}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <input 
                  type="text" 
                  placeholder="省份" 
                  bind:value={orderForm.shippingProvince}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <input 
                  type="text" 
                  placeholder="城市" 
                  bind:value={orderForm.shippingCity}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <textarea 
                  placeholder="详细地址" 
                  rows="3" 
                  bind:value={orderForm.shippingAddress}
                  class="w-full md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                ></textarea>
                <input 
                  type="text" 
                  placeholder="邮政编码（可选）" 
                  bind:value={orderForm.zipCode}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                />
                <textarea 
                  placeholder="备注信息（可选）" 
                  rows="2" 
                  bind:value={orderForm.notes}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-6">
              <div class="flex justify-between items-center mb-2">
                <span>商品价格</span>
                <span>¥{selectedProduct?.price}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span>配送费用</span>
                <span>¥10</span>
              </div>
              <hr class="my-4" />
              <div class="flex justify-between items-center text-lg font-bold">
                <span>总计</span>
                <span class="text-purple-600">¥{selectedProduct?.price + 10}</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- 步骤5: 完成订单 -->
      {#if currentStep === 5}
        <div class="p-8 text-center">
          <div class="max-w-2xl mx-auto">
            <div class="mb-8">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-3xl text-green-600"></i>
              </div>
              <h2 class="text-3xl font-bold text-gray-900 mb-4">🎉 订单创建成功！</h2>
              <p class="text-gray-600">你的定制商品正在制作中，我们会尽快为你发货</p>
            </div>
            
            {#if orderData}
              <div class="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 class="text-lg font-semibold mb-4">订单信息</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">订单号：</span>
                    <span class="font-mono">{orderData.id}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">商品：</span>
                    <span>{orderData.product.name}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">金额：</span>
                    <span class="font-bold text-purple-600">¥{orderData.price + 10}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">下单时间：</span>
                    <span>{orderData.createTime}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">预计送达：</span>
                    <span>{orderData.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            {/if}
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                on:click={goToOrders}
                class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
              >
                查看我的订单
              </button>
              <button 
                on:click={restartCustomization}
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg transition-colors"
              >
                继续定制
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- 底部按钮 -->
      {#if currentStep < 5}
        <div class="border-t border-gray-200 px-8 py-6 flex justify-between">
          <button 
            on:click={prevStep}
            disabled={currentStep === 1}
            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            上一步
          </button>
          
          {#if currentStep === 4}
            <button 
              on:click={confirmOrder}
              class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              确认下单
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          {:else}
            <button 
              on:click={nextStep}
              class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              下一步
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div> 