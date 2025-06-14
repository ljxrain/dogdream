<script lang="ts">
  import { onMount } from 'svelte';
  
  let activeTab = 'all';
  let selectedOrder: any = null;
  let showTrackingModal = false;
  let isLoading = true;
  let error: string | null = null;
  
  // 宠物定制订单数据
  let orders: any[] = [];
  
  const tabs = [
    { id: 'all', name: '全部订单', count: orders.length },
    { id: 'processing', name: '制作中', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipping', name: '配送中', count: orders.filter(o => o.status === 'shipping').length },
    { id: 'completed', name: '已完成', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', name: '已取消', count: orders.filter(o => o.status === 'cancelled').length }
  ];
  
  function getStatusInfo(status: string) {
    switch (status) {
      case 'processing':
        return { text: '制作中', color: 'bg-yellow-100 text-yellow-800', icon: 'fas fa-hammer' };
      case 'shipping':
        return { text: '配送中', color: 'bg-blue-100 text-blue-800', icon: 'fas fa-truck' };
      case 'completed':
        return { text: '已完成', color: 'bg-green-100 text-green-800', icon: 'fas fa-check-circle' };
      case 'cancelled':
        return { text: '已取消', color: 'bg-red-100 text-red-800', icon: 'fas fa-times-circle' };
      default:
        return { text: '未知', color: 'bg-gray-100 text-gray-800', icon: 'fas fa-question-circle' };
    }
  }
  
  function setTab(tabId: string) {
    activeTab = tabId;
  }
  
  function cancelOrder(orderId: string) {
    if (confirm('确定要取消此订单吗？取消后无法恢复。')) {
      orders = orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o);
    }
  }
  
  function reorder(order: any) {
    // 跳转到商城页面并预填订单信息
    window.location.href = '/shop';
  }
  
  function trackOrder(order: any) {
    selectedOrder = order;
    showTrackingModal = true;
  }
  
  function closeTrackingModal() {
    showTrackingModal = false;
    selectedOrder = null;
  }
  
  function getProgressPercentage(status: string) {
    switch (status) {
      case 'processing': return 30;
      case 'shipping': return 70;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  }
  
  // 从API获取订单数据
  async function loadOrders() {
    try {
      isLoading = true;
      error = null;
      
      const token = localStorage.getItem('token');
      if (!token) {
        error = '请先登录';
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取订单失败');
      }

      const result = await response.json();
      
      if (result.success) {
        // 转换API数据格式为页面需要的格式
        orders = result.data.orders.map((order: any) => ({
          id: order.orderNumber,
          status: order.status.toLowerCase(),
          date: new Date(order.createdAt).toLocaleDateString(),
          total: order.totalAmount,
          deliveryDate: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : null,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          trackingNumber: order.logistics?.[0]?.trackingNumber || null,
          items: [{
            name: order.productName || '宠物定制商品',
            img: order.customPreviewUrl || order.petImageUrl,
            petImage: order.petImageUrl,
            price: order.totalAmount - order.shippingFee,
            quantity: 1,
            customText: order.customNotes || ''
          }],
          logistics: order.logistics?.map((log: any) => ({
            time: new Date(log.createdAt).toLocaleString(),
            status: log.status,
            desc: log.description
          })) || []
        }));
      } else {
        throw new Error(result.error || '获取订单失败');
      }
      
    } catch (err) {
      console.error('加载订单失败:', err);
      error = err instanceof Error ? err.message : '加载订单失败';
      // 如果API失败，使用模拟数据
      loadMockOrders();
    } finally {
      isLoading = false;
    }
  }

  // 模拟数据作为后备
  function loadMockOrders() {
    orders = [
      { 
        id: 'PET202401001', 
        status: 'completed', 
        date: '2024-01-20', 
        total: 78.00, 
        deliveryDate: '2024-01-25',
        trackingNumber: 'SF1234567890',
        items: [
          { 
            name: '宠物马克杯', 
            img: '/api/images/微信图片_20250603200400.jpg', 
            petImage: '/api/images/01a7fc26-bbf3-4a97-8458-6ea5f3cbe8a3.png',
            price: 68.00, 
            quantity: 1,
            customText: '我的小可爱'
          }
        ],
        logistics: [
          { time: '2024-01-25 14:30', status: '已签收', desc: '您的包裹已由本人签收，感谢使用顺丰速运' },
          { time: '2024-01-25 09:15', status: '派送中', desc: '快递员正在为您派送，请保持电话畅通' },
          { time: '2024-01-24 18:20', status: '到达目的地', desc: '快件已到达【北京朝阳区】' },
          { time: '2024-01-23 15:45', status: '运输中', desc: '快件已从【深圳宝安区】发出' },
          { time: '2024-01-22 10:30', status: '已发货', desc: '您的定制商品已完成制作并发货' }
        ]
      }
    ];
  }

  onMount(() => {
    loadOrders();
  });

  $: filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);
  $: totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
</script>

<svelte:head>
  <title>我的订单 - 狗狗造梦家</title>
  <meta name="description" content="查看和管理你的宠物定制订单" />
</svelte:head>

<style>
  .order-card {
    transition: all 0.3s ease;
  }
  .order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  .tab-btn {
    transition: all 0.3s ease;
  }
  .tab-btn.active {
    background-color: #8b5cf6;
    color: white;
  }
  .progress-bar {
    transition: width 0.5s ease;
  }
  .modal-backdrop {
    backdrop-filter: blur(4px);
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <section class="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-bold mb-4">🐾 我的宠物定制订单</h1>
          <p class="text-xl opacity-90">查看你的专属宠物商品制作和配送进度</p>
        </div>
        
        <div class="flex items-center gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold">{orders.length}</div>
            <div class="text-sm opacity-80">总订单</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold">¥{totalSpent.toFixed(2)}</div>
            <div class="text-sm opacity-80">总消费</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-8">
    <!-- 标签页导航 -->
    <section class="mb-8">
      <div class="flex flex-wrap gap-4">
        {#each tabs as tab}
          <button 
            class="tab-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeTab === tab.id ? 'active' : 'hover:border-purple-300'}"
            on:click={() => setTab(tab.id)}
          >
            {tab.name}
            <span class="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">{tab.count}</span>
          </button>
        {/each}
      </div>
    </section>

    <!-- 订单列表 -->
    <section>
      {#if isLoading}
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">加载订单中...</h3>
          <p class="text-gray-600">正在获取您的订单信息</p>
        </div>
      {:else if error}
        <div class="text-center py-16">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">加载失败</h3>
          <p class="text-gray-600 mb-8">{error}</p>
          <button 
            on:click={loadOrders}
            class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            重新加载
          </button>
        </div>
      {:else if filteredOrders.length === 0}
        <div class="text-center py-16">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-paw text-4xl text-gray-400"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无订单</h3>
          <p class="text-gray-600 mb-8">去定制你的专属宠物商品吧</p>
          <a href="/shop" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            开始定制
          </a>
        </div>
      {:else}
        <div class="space-y-6">
          {#each filteredOrders as order}
            {@const statusInfo = getStatusInfo(order.status)}
            {@const progress = getProgressPercentage(order.status)}
            <div class="order-card bg-white rounded-2xl shadow-lg overflow-hidden">
              <!-- 订单头部 -->
              <div class="p-6 border-b border-gray-100">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <h3 class="text-lg font-semibold text-gray-900">订单号：{order.id}</h3>
                    <span class="px-3 py-1 rounded-full text-sm font-medium {statusInfo.color}">
                      <i class="{statusInfo.icon} mr-1"></i>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-gray-500">
                    <span>下单时间：{order.date}</span>
                    {#if order.estimatedDelivery}
                      <span>预计送达：{order.estimatedDelivery}</span>
                    {/if}
                    {#if order.deliveryDate}
                      <span>送达时间：{order.deliveryDate}</span>
                    {/if}
                    <span class="text-lg font-bold text-purple-600">¥{order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <!-- 进度条 -->
                {#if order.status !== 'cancelled'}
                  <div class="mt-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                      <span>订单进度</span>
                      <span>{progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="progress-bar bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style="width: {progress}%"></div>
                    </div>
                  </div>
                {/if}
              </div>
              
              <!-- 商品列表 -->
              <div class="p-6">
                <div class="space-y-4">
                  {#each order.items as item}
                    <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <!-- 商品图片 -->
                      <div class="relative">
                        <img src={item.img} alt={item.name} class="w-20 h-20 rounded-lg object-cover" />
                        <!-- 宠物照片小图标 -->
                        <img src={item.petImage} alt="宠物照片" class="absolute -top-2 -right-2 w-8 h-8 rounded-full object-cover border-2 border-white shadow-md" />
                      </div>
                      
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900 mb-1">{item.name}</h4>
                        <p class="text-sm text-gray-500 mb-1">定制文字：{item.customText || '无'}</p>
                        <p class="text-sm text-gray-500">数量：{item.quantity}</p>
                      </div>
                      
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">¥{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  {/each}
                </div>
                
                <!-- 操作按钮 -->
                <div class="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                  {#if order.status === 'processing'}
                    <button 
                      on:click={() => trackOrder(order)}
                      class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-eye mr-1"></i>
                      查看制作进度
                    </button>
                    <button 
                      on:click={() => cancelOrder(order.id)}
                      class="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-times mr-1"></i>
                      取消订单
                    </button>
                  {:else if order.status === 'shipping'}
                    <button 
                      on:click={() => trackOrder(order)}
                      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-truck mr-1"></i>
                      查看物流
                    </button>
                    {#if order.trackingNumber}
                      <span class="text-sm text-gray-500 px-4 py-2">
                        快递单号：{order.trackingNumber}
                      </span>
                    {/if}
                  {:else if order.status === 'completed'}
                    <button 
                      on:click={() => trackOrder(order)}
                      class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-history mr-1"></i>
                      查看详情
                    </button>
                    <button 
                      on:click={() => reorder(order)}
                      class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-redo mr-1"></i>
                      再次定制
                    </button>
                  {:else if order.status === 'cancelled'}
                    <button 
                      on:click={() => reorder(order)}
                      class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i class="fas fa-redo mr-1"></i>
                      重新下单
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>

<!-- 物流跟踪模态框 -->
{#if showTrackingModal && selectedOrder}
  <div class="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <!-- 模态框头部 -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900">订单跟踪</h3>
            <p class="text-gray-600">订单号：{selectedOrder.id}</p>
          </div>
          <button 
            on:click={closeTrackingModal}
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-times text-gray-400"></i>
          </button>
        </div>
      </div>
      
      <!-- 模态框内容 -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <!-- 订单商品信息 -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">商品信息</h4>
          {#each selectedOrder.items as item}
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="relative">
                <img src={item.img} alt={item.name} class="w-16 h-16 rounded-lg object-cover" />
                <img src={item.petImage} alt="宠物照片" class="absolute -top-1 -right-1 w-6 h-6 rounded-full object-cover border-2 border-white" />
              </div>
              <div class="flex-1">
                <h5 class="font-medium text-gray-900">{item.name}</h5>
                <p class="text-sm text-gray-500">定制文字：{item.customText}</p>
              </div>
              <div class="text-purple-600 font-semibold">¥{item.price}</div>
            </div>
          {/each}
        </div>
        
        <!-- 物流时间线 -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-4">
            {#if selectedOrder.status === 'processing'}
              制作进度
            {:else}
              物流信息
            {/if}
          </h4>
          <div class="space-y-4">
            {#each selectedOrder.logistics as log, index}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 rounded-full {index === 0 ? 'bg-purple-600' : 'bg-gray-300'}"></div>
                  {#if index < selectedOrder.logistics.length - 1}
                    <div class="w-0.5 h-8 bg-gray-200 mt-2"></div>
                  {/if}
                </div>
                <div class="flex-1 pb-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-900">{log.status}</span>
                    <span class="text-sm text-gray-500">{log.time}</span>
                  </div>
                  <p class="text-sm text-gray-600">{log.desc}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
        
        <!-- 快递信息 -->
        {#if selectedOrder.trackingNumber}
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 class="font-medium text-blue-900 mb-2">快递信息</h5>
            <p class="text-sm text-blue-700">快递单号：{selectedOrder.trackingNumber}</p>
            {#if selectedOrder.status === 'shipping'}
              <p class="text-sm text-blue-700 mt-1">预计送达：{selectedOrder.estimatedDelivery}</p>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- 模态框底部 -->
      <div class="p-6 border-t border-gray-200">
        <button 
          on:click={closeTrackingModal}
          class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
{/if} 