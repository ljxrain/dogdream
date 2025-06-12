<script lang="ts">
  import { onMount } from 'svelte';
  
  let selectedTable = 'users';
  let tableData: any[] = [];
  let loading = false;
  let error = '';

  const tables = [
    { name: 'users', label: '用户表' },
    { name: 'orders', label: '订单表' },
    { name: 'creations', label: '创作表' },
    { name: 'products', label: '产品表' },
    { name: 'likes', label: '点赞表' },
    { name: 'shares', label: '分享表' },
    { name: 'regionStats', label: '地区统计表' }
  ];

  onMount(() => {
    loadTableData();
  });

  async function loadTableData() {
    try {
      loading = true;
      error = '';
      const response = await fetch(`/api/admin/database/${selectedTable}`);
      if (response.ok) {
        tableData = await response.json();
      } else {
        error = '加载数据失败';
      }
    } catch (err) {
      error = '网络错误';
      console.error('加载数据失败:', err);
    } finally {
      loading = false;
    }
  }

  function changeTable(tableName: string) {
    selectedTable = tableName;
    loadTableData();
  }

  function formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? '是' : '否';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      // 可能是日期
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }
    return String(value);
  }

  function getTableColumns(data: any[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }
</script>

<svelte:head>
  <title>数据库管理 - 造梦家</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- 顶部导航 -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">数据库管理</h1>
          <span class="ml-4 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">开发工具</span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin/customer-service" class="text-blue-600 hover:text-blue-800">客服后台</a>
          <a href="/admin/product-manager" class="text-purple-600 hover:text-purple-800">产品经理后台</a>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 表格选择 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">选择数据表</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {#each tables as table}
        <button
          on:click={() => changeTable(table.name)}
          class="p-4 rounded-lg border-2 text-center transition-all {selectedTable === table.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}"
        >
          <div class="text-sm font-medium">{table.label}</div>
          <div class="text-xs text-gray-500 mt-1">{table.name}</div>
        </button>
        {/each}
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">
            {tables.find(t => t.name === selectedTable)?.label || selectedTable} 数据
          </h3>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              共 {tableData.length} 条记录
            </span>
            <button
              on:click={loadTableData}
              disabled={loading}
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm"
            >
              {#if loading}
                <i class="fas fa-spinner fa-spin mr-2"></i>
              {:else}
                <i class="fas fa-refresh mr-2"></i>
              {/if}
              刷新
            </button>
          </div>
        </div>
      </div>

      {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-4 text-gray-600">加载中...</span>
      </div>
      {:else if error}
      <div class="text-center py-12">
        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <p class="text-red-600">{error}</p>
        <button
          on:click={loadTableData}
          class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          重试
        </button>
      </div>
      {:else if tableData.length === 0}
      <div class="text-center py-12">
        <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
        <p class="text-gray-500">暂无数据</p>
      </div>
      {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              {#each getTableColumns(tableData) as column}
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column}
              </th>
              {/each}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each tableData as row}
            <tr class="hover:bg-gray-50">
              {#each getTableColumns(tableData) as column}
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="max-w-xs truncate" title={formatValue(row[column])}>
                  {formatValue(row[column])}
                </div>
              </td>
              {/each}
            </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {/if}
    </div>

    <!-- 数据库统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">系统信息</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">数据库类型:</span>
            <span class="font-medium">SQLite</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">当前表:</span>
            <span class="font-medium">{selectedTable}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">记录数:</span>
            <span class="font-medium">{tableData.length}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h4>
        <div class="space-y-2">
          <button class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
            导出当前表数据
          </button>
          <button class="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded">
            查看表结构
          </button>
          <button class="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded">
            执行SQL查询
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">注意事项</h4>
        <div class="text-sm text-gray-600 space-y-2">
          <p>• 这是开发环境的数据库管理工具</p>
          <p>• 生产环境请使用专业的数据库管理工具</p>
          <p>• 修改数据前请务必备份</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* 自定义样式 */
  .table-container {
    max-height: 600px;
    overflow-y: auto;
  }
</style> 