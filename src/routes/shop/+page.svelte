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
  
  // 背景展示图片 - 使用D盘图片目录下的所有图片
  const showcaseImages = [
    // PNG图片
    '/images/showcase/01a7fc26-bbf3-4a97-8458-6ea5f3cbe8a3.png',
    '/images/showcase/05b0881c-a7e4-4e53-ad02-d60331b7328f.png',
    '/images/showcase/0b56cd4a-bcfe-44ba-9ef8-e04c4c5213e2.png',
    '/images/showcase/12218b6d-212f-48f3-80f7-724a00f3d64a.png',
    '/images/showcase/15bb63e2-793e-4e31-8535-044045e2ea76.png',
    '/images/showcase/17c8c398-207b-47f2-adb2-7b88d96b64be.png',
    '/images/showcase/23598deb-2861-464b-a1c9-e9bde2ccd1ba.png',
    '/images/showcase/2b087131-dbab-4893-b5d6-16dd817b5f25.png',
    '/images/showcase/2b1fcbf0-f0fd-411a-926a-28afcf8abbab.png',
    '/images/showcase/2fd9a258-f551-4654-8854-9084d3af4f11.png',
    '/images/showcase/3d9e2b89-8d91-46dc-add2-1d8210266142.png',
    '/images/showcase/4c0a1f6b-85b7-4c66-bddb-aae05faf8a6f.png',
    '/images/showcase/563528f5-67a6-48e9-9daf-aab802e833d8.png',
    '/images/showcase/5e239db6-74cd-4e4d-96c6-47f5d9dd5bda.png',
    '/images/showcase/61632edc-5ec7-45ff-81d5-838af3f87474.png',
    '/images/showcase/62ac106c-a6e5-4173-b56e-695054db6cd4.png',
    '/images/showcase/6360ebb9-8d6c-48b1-8cb5-5bc18692ccc0.png',
    '/images/showcase/692ab49a-f214-4ce5-94c9-0a12a180cf9b.png',
    '/images/showcase/8202a0ef-fa95-4d31-b0f0-69b175f37efa.png',
    '/images/showcase/85060cd9-ddd5-4f6a-a757-6a2ea1ee17fb.png',
    '/images/showcase/874a85fb-1084-4b03-940d-6de7fb58872d.png',
    '/images/showcase/8a368f79-d704-4218-b5fa-1abd5da082f3.png',
    '/images/showcase/8da64f8c-6c21-407c-922b-cf91aba2ee9a.png',
    '/images/showcase/945d6ec9-d167-485a-9d23-2b5c922bbfd4.png',
    '/images/showcase/96edbd6b-9bc9-491a-b3ed-f7d857208f15.png',
    '/images/showcase/a2ca431c-ff1a-4421-ba22-1120f0bd0a1c.png',
    '/images/showcase/b12ced9c-57cd-42e9-bbb1-ffaddb1b31be.png',
    '/images/showcase/ba32a857-6fba-408a-985c-7aae084d2ffb.png',
    '/images/showcase/bcc592be-c621-4b61-8ee2-36ab9e941284.png',
    '/images/showcase/bdbd88e1-dfbb-4dec-8f3c-6c05b3b3127e.png',
    '/images/showcase/d1dc45d1-a588-44f3-8b6b-beb5a8a806b6.png',
    '/images/showcase/dde9a9e8-0361-4fdf-84c7-1fec7b326da1.png',
    '/images/showcase/ddebf859-7a67-44ea-8517-1e671b074e38.png',
    '/images/showcase/dff3d8b0-805e-4393-b3a6-3edc728435dc.png',
    '/images/showcase/e55d7912-7207-445e-9c36-8fa40210ebd2.png',
    '/images/showcase/e80c5829-8a72-419a-9e2e-e4e77cade9c8.png',
    '/images/showcase/e828f8d6-1476-4543-876e-01dff4392290.png',
    '/images/showcase/ebacea81-8027-4a4e-8f4d-8e241aa35d15.png',
    // 微信图片
    '/images/showcase/微信图片_20250603200400.jpg',
    '/images/showcase/微信图片_20250603200425.jpg',
    '/images/showcase/微信图片_20250603200431.jpg',
    '/images/showcase/微信图片_20250603200438.jpg',
    '/images/showcase/微信图片_20250603200446.jpg',
    '/images/showcase/微信图片_20250603200453.jpg'
  ];
  
  // 创建上排和下排专用的图片数组，确保不重复
  const topRowImages = showcaseImages; // 上排使用全部44张图片
  const bottomRowImages = [...showcaseImages.slice(22), ...showcaseImages.slice(0, 22)]; // 下排使用全部44张图片，但是错开22张
  
  let currentShowcaseIndex = 0;
  
  // 自动轮播展示图片
  onMount(() => {
    const interval = setInterval(() => {
      currentShowcaseIndex = (currentShowcaseIndex + 1) % showcaseImages.length;
    }, 4000); // 每4秒切换一张图片
    
    return () => clearInterval(interval);
  });
  
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

  
  /* 胶片质感增强 - 更新为新的帧宽度 */
  .film-strip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 358px,
      rgba(255,255,255,0.05) 358px,
      rgba(255,255,255,0.05) 360px
    );
    pointer-events: none;
    z-index: 2;
  }
  
  /* 胶片老化效果 - 增强版本 */
  .film-strip::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 30%, rgba(139,69,19,0.12) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(139,69,19,0.1) 0%, transparent 60%),
                linear-gradient(45deg, transparent 0%, rgba(139,69,19,0.04) 40%, transparent 100%),
                repeating-linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 180px, transparent 360px);
    pointer-events: none;
    z-index: 2;
  }

  /* 真实35mm电影胶片样式 - 放大版本 */
  .film-reel-container {
    width: 100%;
    height: 320px; /* 从200px增加到320px */
    overflow: hidden;
    position: relative;
    background: linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 15%, #2d2d2d 50%, #1a1a1a 85%, #0d0d0d 100%);
    box-shadow: inset 0 6px 12px rgba(0,0,0,0.5), 
                inset 0 -6px 12px rgba(0,0,0,0.5),
                0 4px 20px rgba(0,0,0,0.8);
    border-top: 2px solid #444;
    border-bottom: 2px solid #444;
    border-left: 1px solid #333;
    border-right: 1px solid #333;
  }
  
  .film-strip {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(360px * 88); /* 从240px增加到360px */
    background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 15%, #0a0a0a 25%, #000000 50%, #0a0a0a 75%, #1a1a1a 85%, #2a2a2a 100%);
    position: relative;
  }
  
  /* 胶片孔洞行 - 更逼真的设计 */
  .film-perforations {
    height: 36px; /* 从24px增加到36px */
    background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
  }
  
  .film-perforations.top {
    border-bottom: 3px solid #444;
    box-shadow: inset 0 -3px 6px rgba(0,0,0,0.7);
  }
  
  .film-perforations.bottom {
    border-top: 3px solid #444;
    box-shadow: inset 0 3px 6px rgba(0,0,0,0.7);
  }
  
  /* 胶片孔洞 - 更真实的外观 */
  .perforation {
    width: 12px; /* 从8px增加到12px */
    height: 18px; /* 从12px增加到18px */
    background: #000;
    margin: 0 6px; /* 从4px增加到6px */
    border-radius: 2px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), 
                inset 0 -2px 2px rgba(255,255,255,0.1),
                0 1px 2px rgba(0,0,0,0.8);
    flex-shrink: 0;
    position: relative;
  }
  
  .perforation::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #333 0%, #111 30%, #000 70%, #222 100%);
    border-radius: 3px;
    z-index: -1;
  }
  
  .perforation::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    bottom: 1px;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%);
    border-radius: 1px;
    pointer-events: none;
  }
  
  /* 胶片图像帧区域 */
  .film-frames {
    flex: 1;
    display: flex;
    background: linear-gradient(90deg, #000 0%, #0a0a0a 50%, #000 100%);
    align-items: center;
    position: relative;
    box-shadow: inset 0 3px 6px rgba(0,0,0,0.8), 
                inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  
  /* 单个胶片帧 - 更大更清晰 */
  .film-frame {
    width: 360px; /* 从240px增加到360px */
    height: 248px; /* 从152px增加到248px，保持长宽比 */
    flex-shrink: 0;
    position: relative;
    background: linear-gradient(135deg, #111 0%, #000 50%, #111 100%);
    border-right: 4px solid #333; /* 从3px增加到4px */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 0 4px rgba(0,0,0,0.7);
  }
  
  /* 胶片帧边框 - 更真实的边框效果 */
  .frame-border {
    width: 330px; /* 从220px增加到330px */
    height: 218px; /* 从132px增加到218px */
    background: #000;
    border: 3px solid #333; /* 从2px增加到3px */
    border-radius: 2px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 0 8px rgba(0,0,0,0.9),
                0 2px 4px rgba(0,0,0,0.6);
  }
  
  .frame-border::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(255,255,255,0.03) 25%, 
                transparent 50%, 
                rgba(255,255,255,0.02) 75%, 
                transparent 100%);
    pointer-events: none;
    z-index: 1;
  }
  
  /* 胶片帧图像 - 增强的胶片效果 */
  .frame-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.2) contrast(1.3) brightness(0.8) saturate(0.85) hue-rotate(-5deg);
    transition: filter 0.3s ease, transform 0.3s ease;
  }
  
  .frame-image:hover {
    filter: sepia(0.1) contrast(1.15) brightness(0.95) saturate(1) hue-rotate(0deg);
    transform: scale(1.02);
  }
  
  /* 胶片帧编号 - 更清晰的标识 */
  .frame-number {
    position: absolute;
    bottom: 6px; /* 从4px增加到6px */
    right: 6px; /* 从4px增加到6px */
    background: rgba(0,0,0,0.95);
    color: #fff;
    padding: 3px 8px; /* 从2px 6px增加到3px 8px */
    font-family: 'Courier New', monospace;
    font-size: 12px; /* 从10px增加到12px */
    font-weight: bold;
    border-radius: 3px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.9);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }
  
  /* 胶片滚动动画 - 更新为新的帧宽度 */
  @keyframes scroll-right {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-360px * 44)); /* 更新为新的帧宽度 */
    }
  }
  
  @keyframes scroll-left {
    0% {
      transform: translateX(calc(-360px * 44)); /* 更新为新的帧宽度 */
    }
    100% {
      transform: translateX(0);
    }
  }
  
  .animate-scroll-right {
    animation: scroll-right 240s linear infinite;
  }
  
  .animate-scroll-left {
    animation: scroll-left 280s linear infinite;
  }
  
  /* 胶片播放指示器闪烁 */
  @keyframes film-indicator {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0.3;
    }
  }

  /* 新的3区域样式 - 清理所有旧的绝对定位样式 */
</style>

<div class="min-h-screen bg-gray-50">
  <!-- 区域1：文字区 -->
  <div class="text-section bg-gray-900 py-16 flex flex-col items-center justify-center">
    <div class="text-content max-w-xl w-full mx-auto text-center shadow-2xl rounded-2xl p-10 bg-white/95 backdrop-blur-sm">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
        铲屎官纪念狗宝宝的一生
      </h1>
      <button 
        on:click={() => {
          currentStep = 1;
          document.querySelector('.bg-white.rounded-2xl')?.scrollIntoView({ behavior: 'smooth' });
        }}
        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        开始定制 →
      </button>
    </div>
  </div>

  <!-- 区域2：向右滚动的真实电影胶片 -->
  <div class="film-section-right bg-gray-900 py-8 overflow-hidden">
    <div class="film-reel-container">
      <div class="film-strip animate-scroll-right">
        <!-- 胶片顶部孔洞行 -->
        <div class="film-perforations top">
          {#each Array(200) as _, i}
            <div class="perforation"></div>
          {/each}
        </div>
        
        <!-- 胶片图像帧区域 -->
        <div class="film-frames">
          {#each topRowImages as imageUrl, index}
            <div class="film-frame">
              <div class="frame-border">
                <img 
                  src={imageUrl} 
                  alt="宠物Pod展示{index + 1}" 
                  class="frame-image"
                />
              </div>
              <div class="frame-number">A{String(index + 1).padStart(3, '0')}</div>
            </div>
          {/each}
        </div>
        
        <!-- 胶片底部孔洞行 -->
        <div class="film-perforations bottom">
          {#each Array(200) as _, i}
            <div class="perforation"></div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- 区域3：向左滚动的真实电影胶片 -->
  <div class="film-section-left bg-gray-900 py-8 overflow-hidden">
    <div class="film-reel-container">
      <div class="film-strip animate-scroll-left">
        <!-- 胶片顶部孔洞行 -->
        <div class="film-perforations top">
          {#each Array(200) as _, i}
            <div class="perforation"></div>
          {/each}
        </div>
        
        <!-- 胶片图像帧区域 -->
        <div class="film-frames">
          {#each bottomRowImages as imageUrl, index}
            <div class="film-frame">
              <div class="frame-border">
                <img 
                  src={imageUrl} 
                  alt="宠物Pod展示{index + 1}" 
                  class="frame-image"
                />
              </div>
              <div class="frame-number">B{String(index + 1).padStart(3, '0')}</div>
            </div>
          {/each}
        </div>
        
        <!-- 胶片底部孔洞行 -->
        <div class="film-perforations bottom">
          {#each Array(200) as _, i}
            <div class="perforation"></div>
          {/each}
        </div>
      </div>
    </div>
  </div>

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