<script lang="ts">
  import { onMount } from 'svelte';
  
  let activeTab = 'all';
  let orders = [
    { 
      id: '#202401001', 
      status: 'completed', 
      date: '2024-01-20', 
      total: 49.00, 
      items: [
        { name: '定制T恤', img: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=200', price: 49.00, quantity: 1 }
      ]
    },
    { 
      id: '#202401002', 
      status: 'shipping', 
      date: '2024-01-18', 
      total: 87.00, 
      items: [
        { name: '个性手机壳', img: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=200', price: 29.00, quantity: 1 },
        { name: '定制抱枕', img: 'https://images.unsplash.com/photo-1591197172062-c718f82aba20?q=80&w=200', price: 58.00, quantity: 1 }
      ]
    },
    { 
      id: '#202401003', 
      status: 'processing', 
      date: '2024-01-15', 
      total: 266.00, 
      items: [
        { name: '3D车载玩偶', img: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?q=80&w=200', price: 266.00, quantity: 1 }
      ]
    },
    { 
      id: '#202401004', 
      status: 'cancelled', 
      date: '2024-01-12', 
      total: 128.00, 
      items: [
        { name: '毛绒玩偶', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=200', price: 128.00, quantity: 1 }
      ]
    }
  ];
  
  const tabs = [
    { id: 'all', name: '全部订单', count: orders.length },
    { id: 'processing', name: '处理中', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipping', name: '配送中', count: orders.filter(o => o.status === 'shipping').length },
    { id: 'completed', name: '已完成', count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', name: '已取消', count: orders.filter(o => o.status === 'cancelled').length }
  ];
  
  function getStatusInfo(status: string) {
    switch (status) {
      case 'processing':
        return { text: '处理中', color: 'bg-yellow-100 text-yellow-800', icon: 'fas fa-clock' };
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
    if (confirm('确定要取消此订单吗？')) {
      orders = orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o);
    }
  }
  
  function reorder(order: any) {
    alert(`重新下单：${order.id}`);
  }
  
  function trackOrder(orderId: string) {
    alert(`查看物流：${orderId}`);
  }
  
  $: filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);
  $: totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);
</script>

<svelte:head>
  <title>我的订单 - 造梦家</title>
  <meta name="description" content="查看和管理你的订单" />
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
    background-color: #3b82f6;
    color: white;
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <section class="bg-white border-b">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">我的订单</h1>
          <p class="text-gray-600">查看和管理你的订单</p>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{orders.length}</div>
            <div class="text-sm text-gray-500">总订单</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">¥{totalSpent.toFixed(2)}</div>
            <div class="text-sm text-gray-500">总消费</div>
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
            class="tab-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeTab === tab.id ? 'active' : 'hover:border-blue-300'}"
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
      {#if filteredOrders.length === 0}
        <div class="text-center py-16">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-shopping-bag text-4xl text-gray-400"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无订单</h3>
          <p class="text-gray-600 mb-8">去商城看看，发现更多精彩商品</p>
          <a href="/shop" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            前往商城
          </a>
        </div>
      {:else}
        <div class="space-y-6">
          {#each filteredOrders as order}
            {@const statusInfo = getStatusInfo(order.status)}
            <div class="order-card bg-white rounded-2xl shadow-lg overflow-hidden">
              <!-- 订单头部 -->
              <div class="p-6 border-b border-gray-100">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <h3 class="text-lg font-semibold text-gray-900">订单号：{order.id}</h3>
                    <span class="px-3 py-1 rounded-full text-sm font-medium {statusInfo.color}">
                      <i class="{statusInfo.icon} mr-1"></i>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span>下单时间：{order.date}</span>
                    <span class="text-lg font-bold text-red-600">¥{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <!-- 商品列表 -->
              <div class="p-6">
                <div class="space-y-4">
                  {#each order.items as item}
                    <div class="flex items-center gap-4">
                      <img src={item.img} alt={item.name} class="w-16 h-16 rounded-lg object-cover" />
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">{item.name}</h4>
                        <p class="text-sm text-gray-500">数量：{item.quantity}</p>
                      </div>
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">¥{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  {/each}
                </div>
                
                <!-- 操作按钮 -->
                <div class="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                  {#if order.status === 'processing'}
                    <button 
                      on:click={() => cancelOrder(order.id)}
                      class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      取消订单
                    </button>
                  {/if}
                  
                  {#if order.status === 'shipping'}
                    <button 
                      on:click={() => trackOrder(order.id)}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      查看物流
                    </button>
                  {/if}
                  
                  {#if order.status === 'completed'}
                    <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      评价商品
                    </button>
                    <button 
                      on:click={() => reorder(order)}
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      再次购买
                    </button>
                  {/if}
                  
                  <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    查看详情
                  </button>
                  
                  <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    联系客服
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- 加载更多 -->
        <div class="text-center mt-8">
          <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors">
            加载更多订单
          </button>
        </div>
      {/if}
    </section>
  </div>
</div> 