<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let user: any = null;
  let stats = {
    totalUsers: 0,
    totalCreations: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayUsers: 0,
    todayCreations: 0
  };
  
  let recentUsers: any[] = [];
  let recentCreations: any[] = [];
  let recentOrders: any[] = [];
  
  // 权限控制
  $: canViewUsers = user?.role === 'ADMIN' || user?.role === 'CUSTOMER_SERVICE';
  $: canViewFinance = user?.role === 'ADMIN';
  $: canViewCreations = user?.role === 'ADMIN' || user?.role === 'PRODUCT_MANAGER';
  $: canViewOrders = user?.role === 'ADMIN' || user?.role === 'CUSTOMER_SERVICE';
  
  onMount(async () => {
    // 检查用户登录状态和权限
    const token = localStorage.getItem('token');
    if (!token) {
      goto('/login');
      return;
    }
    
    try {
      // 获取当前用户信息
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (userResponse.ok) {
        user = await userResponse.json();
        
        // 检查是否有管理权限
        const allowedRoles = ['ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER_SERVICE'];
        if (!allowedRoles.includes(user.role)) {
          alert('您没有访问此页面的权限');
          goto('/');
          return;
        }
      } else {
        goto('/login');
        return;
      }
      
      // 获取统计数据
      await loadStats();
      await loadRecentData();
      
    } catch (error) {
      console.error('获取用户信息失败:', error);
      goto('/login');
    }
  });
  
  async function loadStats() {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }
  
  async function loadRecentData() {
    try {
      const [usersRes, creationsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/recent-users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/recent-creations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/recent-orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      if (usersRes.ok) recentUsers = await usersRes.json();
      if (creationsRes.ok) recentCreations = await creationsRes.json();
      if (ordersRes.ok) recentOrders = await ordersRes.json();
      
    } catch (error) {
      console.error('获取最近数据失败:', error);
    }
  }

  function getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN': return '系统管理员';
      case 'PRODUCT_MANAGER': return '产品经理';
      case 'CUSTOMER_SERVICE': return '客服专员';
      default: return '管理员';
    }
  }

  function getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PRODUCT_MANAGER': return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER_SERVICE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<svelte:head>
  <title>{getRoleDisplayName(user?.role || '')}仪表板 - 造梦家</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- 管理员导航栏 -->
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-gray-900">🏠 造梦家管理后台</h1>
          <span class="ml-4 px-3 py-1 rounded-full text-xs font-medium {getRoleColor(user?.role || '')}">
            {getRoleDisplayName(user?.role || '')}
          </span>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">欢迎，{user?.name || '管理员'}</span>
          <button 
            on:click={() => goto('/')}
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  </nav>

  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <!-- 角色说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-info-circle text-blue-600 mr-3"></i>
        <div>
          <h3 class="text-sm font-medium text-blue-800">您的权限范围</h3>
          <div class="mt-1 text-sm text-blue-700">
            {#if user?.role === 'ADMIN'}
              作为系统管理员，您拥有所有功能的访问权限，包括用户管理、内容管理、订单管理和财务数据。
            {:else if user?.role === 'PRODUCT_MANAGER'}
              作为产品经理，您可以查看用户统计、管理创作内容，专注于产品数据分析和内容质量控制。
            {:else if user?.role === 'CUSTOMER_SERVICE'}
              作为客服专员，您可以查看用户列表、处理订单问题，专注于客户服务和问题解决。
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 - 根据权限显示 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {#if canViewUsers}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="fas fa-users text-2xl text-blue-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总用户数</p>
              <p class="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              <p class="text-xs text-green-600">今日新增 +{stats.todayUsers}</p>
            </div>
          </div>
        </div>
      {/if}

      {#if canViewCreations}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="fas fa-images text-2xl text-purple-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总创作数</p>
              <p class="text-2xl font-semibold text-gray-900">{stats.totalCreations}</p>
              <p class="text-xs text-green-600">今日新增 +{stats.todayCreations}</p>
            </div>
          </div>
        </div>
      {/if}

      {#if canViewOrders}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="fas fa-shopping-cart text-2xl text-green-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总订单数</p>
              <p class="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      {/if}

      {#if canViewFinance}
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="fas fa-dollar-sign text-2xl text-yellow-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总收入</p>
              <p class="text-2xl font-semibold text-gray-900">¥{stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- 最近活动 - 根据权限显示 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 最近用户 - 管理员和客服可见 -->
      {#if canViewUsers}
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">最近注册用户</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each recentUsers.slice(0, 5) as user}
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-600 text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                    <p class="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              {:else}
                <p class="text-gray-500 text-sm">暂无数据</p>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- 最近创作 - 管理员和产品经理可见 -->
      {#if canViewCreations}
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">最近创作内容</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each recentCreations.slice(0, 5) as creation}
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-image text-purple-600 text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{creation.title || '无标题作品'}</p>
                    <p class="text-xs text-gray-500">{new Date(creation.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              {:else}
                <p class="text-gray-500 text-sm">暂无数据</p>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- 最近订单 - 管理员和客服可见 -->
      {#if canViewOrders}
        <div class="bg-white rounded-lg shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">最近订单</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              {#each recentOrders.slice(0, 5) as order}
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-shopping-cart text-green-600 text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">订单 #{order.id}</p>
                    <p class="text-xs text-gray-500">¥{order.amount} - {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              {:else}
                <p class="text-gray-500 text-sm">暂无数据</p>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- 快速操作 - 根据权限显示 -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#if user?.role === 'ADMIN'}
          <button class="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg transition-colors text-center">
            <i class="fas fa-users-cog text-xl mb-2"></i>
            <div class="text-sm font-medium">用户管理</div>
          </button>
          <button class="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors text-center">
            <i class="fas fa-chart-bar text-xl mb-2"></i>
            <div class="text-sm font-medium">财务报表</div>
          </button>
        {/if}
        
        {#if canViewCreations}
          <button class="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors text-center">
            <i class="fas fa-images text-xl mb-2"></i>
            <div class="text-sm font-medium">内容管理</div>
          </button>
        {/if}
        
        {#if canViewOrders}
          <button class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors text-center">
            <i class="fas fa-headset text-xl mb-2"></i>
            <div class="text-sm font-medium">客服工单</div>
          </button>
        {/if}
      </div>
    </div>
  </div>
</div> 