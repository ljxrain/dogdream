<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, isLoggedIn } from '$lib/stores/auth';

  let stats = {
    totalGenerations: 0,
    todayGenerations: 0,
    weeklyGenerations: 0,
    monthlyGenerations: 0,
    topEmojiTypes: [],
    topStyles: [],
    userStats: [],
    dailyTrend: [],
    loading: true
  };

  let selectedTimeRange = '7d';
  let selectedMetric = 'generations';

  onMount(async () => {
    // 检查管理员权限
    if (!$isLoggedIn || $user?.role !== 'ADMIN') {
      goto('/login');
      return;
    }
    
    await loadStats();
  });

  async function loadStats() {
    try {
      stats.loading = true;
      const response = await fetch(`/api/admin/emoji-stats?range=${selectedTimeRange}&metric=${selectedMetric}`);
      
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }
      
      const data = await response.json();
      stats = { ...data, loading: false };
    } catch (error) {
      console.error('加载统计数据失败:', error);
      stats.loading = false;
    }
  }

  function handleTimeRangeChange() {
    loadStats();
  }

  function handleMetricChange() {
    loadStats();
  }

  function exportData() {
    // 导出统计数据为CSV
    const csvData = generateCSV();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emoji-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function generateCSV() {
    let csv = '日期,生成数量,用户数量,热门类型,热门风格\n';
    stats.dailyTrend.forEach(day => {
      csv += `${day.date},${day.generations},${day.users},${day.topType},${day.topStyle}\n`;
    });
    return csv;
  }
</script>

<svelte:head>
  <title>表情包统计 - 管理后台</title>
</svelte:head>

<style>
  .stat-card {
    transition: all 0.3s ease;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  .chart-container {
    height: 300px;
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- 页面头部 -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">表情包数据统计</h1>
          <p class="text-gray-600 mt-1">实时监控表情包生成和使用情况</p>
        </div>
        <div class="flex items-center gap-4">
          <!-- 时间范围选择 -->
          <select 
            bind:value={selectedTimeRange} 
            on:change={handleTimeRangeChange}
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="1d">今天</option>
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
          </select>
          
          <!-- 导出按钮 -->
          <button 
            on:click={exportData}
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <i class="fas fa-download mr-2"></i>
            导出数据
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-6 py-8">
    {#if stats.loading}
      <!-- 加载状态 -->
      <div class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">正在加载统计数据...</p>
      </div>
    {:else}
      <!-- 核心指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card bg-white rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-full">
              <i class="fas fa-chart-line text-2xl text-blue-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">总生成数</p>
              <p class="text-2xl font-bold text-gray-900">{stats.totalGenerations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-full">
              <i class="fas fa-calendar-day text-2xl text-green-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">今日生成</p>
              <p class="text-2xl font-bold text-gray-900">{stats.todayGenerations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-full">
              <i class="fas fa-calendar-week text-2xl text-yellow-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">本周生成</p>
              <p class="text-2xl font-bold text-gray-900">{stats.weeklyGenerations.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div class="stat-card bg-white rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-full">
              <i class="fas fa-calendar-alt text-2xl text-purple-600"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">本月生成</p>
              <p class="text-2xl font-bold text-gray-900">{stats.monthlyGenerations.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 趋势图 -->
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-4">生成趋势</h3>
          <div class="chart-container">
            {#if stats.dailyTrend.length > 0}
              <div class="h-full flex items-end justify-between gap-2">
                {#each stats.dailyTrend as day, index}
                  <div class="flex-1 flex flex-col items-center">
                    <div 
                      class="bg-blue-500 rounded-t w-full transition-all duration-500"
                      style="height: {(day.generations / Math.max(...stats.dailyTrend.map(d => d.generations))) * 200}px"
                    ></div>
                    <p class="text-xs text-gray-600 mt-2 transform -rotate-45">{day.date}</p>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="h-full flex items-center justify-center text-gray-500">
                暂无数据
              </div>
            {/if}
          </div>
        </div>

        <!-- 表情包类型分布 -->
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-4">热门表情包类型</h3>
          <div class="space-y-4">
            {#each stats.topEmojiTypes as type, index}
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                  {index + 1}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium text-gray-900">{type.name}</span>
                    <span class="text-sm text-gray-600">{type.count}次</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style="width: {(type.count / Math.max(...stats.topEmojiTypes.map(t => t.count))) * 100}%"
                    ></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 风格统计 -->
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-4">制作风格统计</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-medium text-gray-700">风格</th>
                  <th class="text-right py-3 px-4 font-medium text-gray-700">使用次数</th>
                  <th class="text-right py-3 px-4 font-medium text-gray-700">占比</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.topStyles as style}
                  <tr class="border-b border-gray-100">
                    <td class="py-3 px-4 text-gray-900">{style.name}</td>
                    <td class="py-3 px-4 text-right text-gray-900">{style.count}</td>
                    <td class="py-3 px-4 text-right text-gray-600">{style.percentage}%</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 用户活跃度 -->
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-gray-900 mb-4">用户活跃度</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-medium text-gray-700">用户</th>
                  <th class="text-right py-3 px-4 font-medium text-gray-700">生成数量</th>
                  <th class="text-right py-3 px-4 font-medium text-gray-700">最后活跃</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.userStats as userStat}
                  <tr class="border-b border-gray-100">
                    <td class="py-3 px-4">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 mr-3">
                          {userStat.name ? userStat.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{userStat.name || '匿名用户'}</p>
                          <p class="text-sm text-gray-600">{userStat.email}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-right text-gray-900">{userStat.generationCount}</td>
                    <td class="py-3 px-4 text-right text-gray-600">{userStat.lastActive}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div> 