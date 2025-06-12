<script lang="ts">
  import { onMount } from 'svelte';
  
  // 数据状态
  let orders: any[] = [];
  let users: any[] = [];
  let searchQuery = '';
  let searchType = 'order'; // order, user, tracking
  let loading = false;
  let selectedOrder: any = null;
  let logistics: any[] = [];
  
  // 统计数据
  let stats = {
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0
  };

  onMount(async () => {
    await loadStats();
    await loadRecentOrders();
  });

  async function loadStats() {
    try {
      const response = await fetch('/api/admin/customer-service/stats');
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }

  async function loadRecentOrders() {
    try {
      loading = true;
      const response = await fetch('/api/admin/customer-service/orders?limit=20');
      if (response.ok) {
        orders = await response.json();
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      loading = false;
    }
  }

  async function searchData() {
    if (!searchQuery.trim()) {
      await loadRecentOrders();
      return;
    }

    try {
      loading = true;
      const response = await fetch(`/api/admin/customer-service/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const result = await response.json();
        if (searchType === 'order') {
          orders = result;
        } else if (searchType === 'user') {
          users = result;
        }
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      loading = false;
    }
  }

  async function viewOrderDetails(orderId: string) {
    try {
      const response = await fetch(`/api/admin/customer-service/orders/${orderId}`);
      if (response.ok) {
        selectedOrder = await response.json();
        // 加载物流信息
        const logisticsResponse = await fetch(`/api/admin/customer-service/logistics/${orderId}`);
        if (logisticsResponse.ok) {
          logistics = await logisticsResponse.json();
        }
      }
    } catch (error) {
      console.error('加载订单详情失败:', error);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/admin/customer-service/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        await loadRecentOrders();
        if (selectedOrder?.id === orderId) {
          await viewOrderDetails(orderId);
        }
        alert('订单状态更新成功！');
      }
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新失败，请重试');
    }
  }

  async function addLogistics(orderId: string, logisticsData: any) {
    try {
      const response = await fetch(`/api/admin/customer-service/logistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, ...logisticsData })
      });
      
      if (response.ok) {
        await viewOrderDetails(orderId);
        alert('物流信息添加成功！');
      }
    } catch (error) {
      console.error('添加物流信息失败:', error);
      alert('添加失败，请重试');
    }
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-green-200 text-green-900',
      'CANCELED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusText(status: string) {
    const texts: Record<string, string> = {
      'PENDING': '待付款',
      'PAID': '已付款',
      'PROCESSING': '生产中',
      'SHIPPED': '已发货',
      'DELIVERED': '已送达',
      'CANCELED': '已取消',
      'REFUNDED': '已退款'
    };
    return texts[status] || status;
  }
</script>

<svelte:head>
  <title>客服后台 - 造梦家</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- 顶部导航 -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">客服后台</h1>
          <span class="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">客服系统</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">客服小丽</span>
          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">退出登录</button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总订单数</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <i class="fas fa-clock text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">待处理订单</p>
            <p class="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <i class="fas fa-truck text-green-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已发货订单</p>
            <p class="text-2xl font-bold text-gray-900">{stats.shippedOrders}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <i class="fas fa-check-circle text-purple-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已完成订单</p>
            <p class="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">查询功能</h2>
      <div class="flex flex-col md:flex-row gap-4">
        <select bind:value={searchType} class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="order">订单查询</option>
          <option value="user">用户查询</option>
          <option value="tracking">物流查询</option>
        </select>
        
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={searchType === 'order' ? '输入订单号或用户姓名' : searchType === 'user' ? '输入用户邮箱或姓名' : '输入物流单号'}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            on:keydown={(e) => e.key === 'Enter' && searchData()}
          />
        </div>
        
        <button
          on:click={searchData}
          disabled={loading}
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {#if loading}
            <i class="fas fa-spinner fa-spin mr-2"></i>
          {:else}
            <i class="fas fa-search mr-2"></i>
          {/if}
          搜索
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 订单列表 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {searchQuery ? '搜索结果' : '最近订单'}
            </h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单信息</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each orders as order}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div class="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{order.recipientName}</div>
                      <div class="text-sm text-gray-500">{order.recipientPhone}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(order.status)}">
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ¥{order.totalAmount.toFixed(2)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      on:click={() => viewOrderDetails(order.id)}
                      class="text-blue-600 hover:text-blue-900"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
                {/each}
              </tbody>
            </table>
            
            {#if orders.length === 0 && !loading}
            <div class="text-center py-12">
              <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
              <p class="text-gray-500">暂无订单数据</p>
            </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- 订单详情面板 -->
      <div class="lg:col-span-1">
        {#if selectedOrder}
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">订单详情</h3>
          </div>
          
          <div class="p-6 space-y-4">
            <!-- 基本信息 -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">基本信息</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">订单号:</span>
                  <span class="font-medium">{selectedOrder.orderNumber}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">状态:</span>
                  <span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(selectedOrder.status)}">
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">金额:</span>
                  <span class="font-medium">¥{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- 收货信息 -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">收货信息</h4>
              <div class="space-y-1 text-sm text-gray-600">
                <p><strong>收货人:</strong> {selectedOrder.recipientName}</p>
                <p><strong>电话:</strong> {selectedOrder.recipientPhone}</p>
                <p><strong>地址:</strong> {selectedOrder.shippingProvince} {selectedOrder.shippingCity} {selectedOrder.shippingAddress}</p>
              </div>
            </div>

            <!-- 状态更新 -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">状态操作</h4>
              <div class="space-y-2">
                <select class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" id="newStatus">
                  <option value="PENDING">待付款</option>
                  <option value="PAID">已付款</option>
                  <option value="PROCESSING">生产中</option>
                  <option value="SHIPPED">已发货</option>
                  <option value="DELIVERED">已送达</option>
                  <option value="CANCELED">已取消</option>
                  <option value="REFUNDED">已退款</option>
                </select>
                <button
                  on:click={() => {
                    const select = document.getElementById('newStatus') as HTMLSelectElement;
                    updateOrderStatus(selectedOrder.id, select.value);
                  }}
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                  更新状态
                </button>
              </div>
            </div>

            <!-- 物流信息 -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">物流跟踪</h4>
              <div class="space-y-2">
                {#each logistics as log}
                <div class="border-l-2 border-blue-500 pl-3 py-2">
                  <div class="text-sm font-medium text-gray-900">{log.status}</div>
                  <div class="text-xs text-gray-600">{log.description}</div>
                  <div class="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                  {#if log.location}
                  <div class="text-xs text-gray-500">位置: {log.location}</div>
                  {/if}
                </div>
                {/each}
                
                {#if logistics.length === 0}
                <p class="text-sm text-gray-500">暂无物流信息</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
        {:else}
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-center text-gray-500">
            <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
            <p>点击订单查看详情</p>
          </div>
        </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* 自定义样式 */
  .table-hover tr:hover {
    background-color: #f9fafb;
  }
</style> 