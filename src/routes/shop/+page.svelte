<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedImage: string | null = null;
  let selectedProduct: any = null;
  let activeCategory = 'all';
  let cartItems: any[] = [];
  
  const categories = [
    { id: 'all', name: '全部商品', count: 16 },
    { id: 'clothing', name: '服饰穿戴', count: 5 },
    { id: 'home', name: '家居生活', count: 4 },
    { id: 'accessory', name: '个人配饰', count: 3 },
    { id: 'stationery', name: '办公文具', count: 4 }
  ];
  
  const products = [
    { id: 1, name: '定制T恤', price: 49, desc: '采用优质纯棉面料，舒适透气，专属个性定制图案，夏季穿着清爽舒适。', category: 'clothing', img: '/recommendations/shop/shop1.png', rating: 4.5, hot: true },
    { id: 2, name: '个性手机壳', price: 29, desc: '适用多种型号，3D立体打印，防摔防刮，完美贴合手机，保护手机的同时彰显个性。', category: 'accessory', img: '/recommendations/shop/shop2.png', rating: 4.8, new: true },
    { id: 3, name: '毛绒玩偶', price: 128, desc: '柔软舒适，安全无毒，完美还原设计，陪伴孩子成长，也是成年人的治愈神器。', category: 'home', img: '/recommendations/shop/shop3.png', rating: 4.9 },
    { id: 4, name: '3D车载玩偶', price: 266, desc: '精工制作，立体逼真，专为车内设计，让每次出行都充满乐趣和个性。', category: 'accessory', img: '/recommendations/shop/shop4.png', rating: 4.7 },
    { id: 5, name: '定制抱枕', price: 88, desc: '高品质面料，填充饱满，印刷清晰，为家居增添温馨个性化元素。', category: 'home', img: '/recommendations/shop/shop5.png', rating: 4.6 },
    { id: 6, name: '个性钥匙链', price: 39, desc: '小巧精致，携带便利，金属材质，持久耐用，展现独特品味。', category: 'accessory', img: '/recommendations/shop/shop6.png', rating: 4.4 },
    { id: 7, name: '马克杯', price: 58, desc: '陶瓷材质，保温性好，图案清晰持久，每天喝水都是享受。', category: 'home', img: '/recommendations/shop/shop7.png', rating: 4.5 },
    { id: 8, name: '笔记本', price: 35, desc: '优质纸张，封面个性定制，记录生活点滴，让思绪更有温度。', category: 'stationery', img: '/recommendations/shop/shop8.png', rating: 4.3 }
  ];
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function selectCategory(categoryId: string) {
    activeCategory = categoryId;
  }
  
  function selectProduct(product: any) {
    selectedProduct = product;
  }
  
  function addToCart() {
    if (selectedProduct && selectedImage) {
      cartItems = [...cartItems, { ...selectedProduct, customImage: selectedImage, id: Date.now() }];
      alert('商品已添加到购物车！');
    } else {
      alert('请选择图片和商品');
    }
  }
  
  $: filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  $: currentCategory = categories.find(c => c.id === activeCategory);
</script>

<svelte:head>
  <title>梦想商城 - 造梦家</title>
  <meta name="description" content="将创意转化为实体商品，专属定制服务" />
</svelte:head>

<style>
  .product-card {
    transition: all 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
  .category-btn {
    transition: all 0.3s ease;
  }
  .category-btn.active {
    background-color: #3b82f6;
    color: white;
  }
  .upload-area {
    transition: all 0.3s ease;
  }
  .upload-area:hover {
    border-color: #3b82f6;
    background-color: #fafbff;
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6">梦想商城</h1>
      <p class="text-xl md:text-2xl mb-8 opacity-90">把灵感一键变成现实周边</p>
      <p class="text-lg opacity-80">将数字创意转化为实体产品，专属定制服务</p>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-12">
    <!-- Step 1: 选择图片 -->
    <section class="mb-16">
      <div class="flex items-center mb-8">
        <div class="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full text-lg font-bold mr-4">1</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">上传创意图片</h2>
          <p class="text-gray-600">选择你想要定制到商品上的图片</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-8 shadow-lg">
        {#if selectedImage}
          <div class="relative">
            <img src={selectedImage} alt="已选择的图片" class="w-full max-w-md mx-auto rounded-lg shadow-md" />
            <button 
              on:click={() => selectedImage = null}
              class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        {:else}
          <div class="upload-area border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <i class="fas fa-image text-6xl text-gray-400 mb-6"></i>
            <h3 class="text-xl font-semibold text-gray-700 mb-4">选择图片来源</h3>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <label class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center">
                <i class="fas fa-upload mr-2"></i>
                上传图片
                <input type="file" accept="image/*" on:change={handleFileSelect} class="hidden" />
              </label>
              <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg transition-colors">
                <i class="fas fa-camera mr-2"></i>
                拍照
              </button>
            </div>
          </div>
        {/if}
      </div>
    </section>

    <!-- Step 2: 选择商品分类 -->
    <section class="mb-16">
      <div class="flex items-center mb-8">
        <div class="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full text-lg font-bold mr-4">2</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">选择商品分类</h2>
          <p class="text-gray-600">浏览不同类型的定制商品</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-8 shadow-lg">
        <!-- 分类导航 -->
        <div class="flex flex-wrap gap-4 mb-8">
          {#each categories as category}
            <button 
              class="category-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeCategory === category.id ? 'active' : 'hover:border-purple-300'}"
              on:click={() => selectCategory(category.id)}
            >
              {category.name}
              <span class="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">{category.count}</span>
            </button>
          {/each}
        </div>
        
        <!-- 当前分类信息 -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">{currentCategory?.name}</h3>
          <div class="text-sm text-gray-500">共 {filteredProducts.length} 件商品</div>
        </div>
        
        <!-- 商品网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {#each filteredProducts as product}
            <div 
              class="product-card bg-white rounded-xl overflow-hidden border border-gray-200 cursor-pointer {selectedProduct?.id === product.id ? 'ring-2 ring-purple-500' : ''}"
              on:click={() => selectProduct(product)}
              on:keydown={(e) => e.key === 'Enter' && selectProduct(product)}
              tabindex="0"
              role="button"
            >
              <div class="relative">
                <img src={product.img} alt={product.name} class="w-full h-48 object-cover" />
                {#if product.hot}
                  <span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</span>
                {:else if product.new}
                  <span class="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
                {/if}
              </div>
              <div class="p-4">
                <h4 class="font-semibold text-gray-900 mb-2">{product.name}</h4>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl font-bold text-purple-600">¥{product.price}</span>
                  <div class="flex items-center text-yellow-500 text-sm">
                    {#each Array(Math.floor(product.rating)) as _}
                      <i class="fas fa-star"></i>
                    {/each}
                    {#if product.rating % 1 !== 0}
                      <i class="fas fa-star-half-alt"></i>
                    {/if}
                    <span class="ml-1 text-gray-500">{product.rating}</span>
                  </div>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">{product.desc}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- 商品详情 -->
    {#if selectedProduct}
      <section class="mb-16">
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img src={selectedProduct.img} alt={selectedProduct.name} class="w-full rounded-lg shadow-md" />
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h3>
              <div class="text-4xl font-bold text-purple-600 mb-6">¥{selectedProduct.price}</div>
              <p class="text-gray-600 mb-6 leading-relaxed">{selectedProduct.desc}</p>
              
              <div class="flex items-center mb-6">
                <div class="flex items-center text-yellow-500 mr-4">
                  {#each Array(Math.floor(selectedProduct.rating)) as _}
                    <i class="fas fa-star"></i>
                  {/each}
                  {#if selectedProduct.rating % 1 !== 0}
                    <i class="fas fa-star-half-alt"></i>
                  {/if}
                  <span class="ml-2 text-gray-600">{selectedProduct.rating} 分</span>
                </div>
                <span class="text-sm text-gray-500">已售出 {Math.floor(Math.random() * 1000 + 100)} 件</span>
              </div>
              
              <button 
                on:click={addToCart}
                disabled={!selectedImage}
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                <i class="fas fa-shopping-cart mr-2"></i>
                {selectedImage ? '立即定制' : '请先选择图片'}
              </button>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <!-- 购物车 -->
    {#if cartItems.length > 0}
      <section class="mb-16">
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">购物车 ({cartItems.length})</h3>
          <div class="space-y-4">
            {#each cartItems as item}
              <div class="flex items-center p-4 border border-gray-200 rounded-lg">
                <img src={item.customImage} alt="定制图片" class="w-16 h-16 object-cover rounded mr-4" />
                <div class="flex-1">
                  <h4 class="font-semibold">{item.name}</h4>
                  <p class="text-gray-600">¥{item.price}</p>
                </div>
                <button 
                  on:click={() => cartItems = cartItems.filter(i => i.id !== item.id)}
                  class="text-red-500 hover:text-red-700"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            {/each}
          </div>
          <div class="mt-6 text-right">
            <div class="text-2xl font-bold text-purple-600">
              总计：¥{cartItems.reduce((sum, item) => sum + item.price, 0)}
            </div>
            <button class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              去结算
            </button>
          </div>
        </div>
      </section>
    {/if}
  </div>
</div> 