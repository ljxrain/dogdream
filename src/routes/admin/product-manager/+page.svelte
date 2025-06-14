<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  
  Chart.register(...registerables);
  
  // 数据状态
  let dashboardData = {
    overview: {
      totalUsers: 0,
      totalCreations: 0,
      totalOrders: 0,
      totalRevenue: 0,
      monthlyGrowth: 0
    },
    creationStats: {
      popularStyles: [],
      dailyCreations: [],
      qualityDistribution: []
    },
    orderStats: {
      dailyOrders: [],
      productSales: [],
      regionStats: []
    },
    userStats: {
      newUsers: [],
      activeUsers: [],
      userRetention: 0
    }
  };
  
  let loading = true;
  let selectedTimeRange = '30d'; // 7d, 30d, 90d
  let selectedMetric = 'overview'; // overview, creations, orders, users, regions
  
  // 图表实例
  let chartInstances: Record<string, Chart> = {};

  onMount(async () => {
    await loadDashboardData();
    initializeCharts();
  });

  async function loadDashboardData() {
    try {
      loading = true;
      const response = await fetch(`/api/admin/product-manager/dashboard?range=${selectedTimeRange}`);
      if (response.ok) {
        dashboardData = await response.json();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      loading = false;
    }
  }

  function initializeCharts() {
    // 销售趋势图
    const salesCtx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (salesCtx && !chartInstances.sales) {
      chartInstances.sales = new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: dashboardData.orderStats.dailyOrders.map((item: any) => item.date),
          datasets: [{
            label: '每日订单数',
            data: dashboardData.orderStats.dailyOrders.map((item: any) => item.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '订单趋势'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // 风格分布图
    const styleCtx = document.getElementById('styleChart') as HTMLCanvasElement;
    if (styleCtx && !chartInstances.style) {
      chartInstances.style = new Chart(styleCtx, {
        type: 'doughnut',
        data: {
          labels: dashboardData.creationStats.popularStyles.map((item: any) => item.style),
          datasets: [{
            data: dashboardData.creationStats.popularStyles.map((item: any) => item.count),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#C9CBCF'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '热门风格分布'
            }
          }
        }
      });
    }

    // 地区分布图
    const regionCtx = document.getElementById('regionChart') as HTMLCanvasElement;
    if (regionCtx && !chartInstances.region) {
      chartInstances.region = new Chart(regionCtx, {
        type: 'bar',
        data: {
          labels: dashboardData.orderStats.regionStats.map((item: any) => item.province),
          datasets: [{
            label: '订单数量',
            data: dashboardData.orderStats.regionStats.map((item: any) => item.orderCount),
            backgroundColor: 'rgba(34, 197, 94, 0.8)'
          }, {
            label: '收入金额',
            data: dashboardData.orderStats.regionStats.map((item: any) => item.totalRevenue),
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '地区销售分析'
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
            }
          }
        }
      });
    }
  }

  async function changeTimeRange(range: string) {
    selectedTimeRange = range;
    await loadDashboardData();
    updateCharts();
  }

  function updateCharts() {
    // 更新图表数据
    Object.values(chartInstances).forEach(chart => {
      chart.destroy();
    });
    chartInstances = {};
    setTimeout(initializeCharts, 100);
  }

  function formatNumber(num: number) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  function exportData() {
    // 导出数据功能
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  	<title>产品经理后台 - 狗狗造梦家</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- 顶部导航 -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">产品经理后台</h1>
          <span class="ml-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">数据分析</span>
        </div>
        <div class="flex items-center space-x-4">
          <!-- 时间范围选择 -->
          <select 
            bind:value={selectedTimeRange} 
            on:change={() => changeTimeRange(selectedTimeRange)}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
          </select>
          
          <button 
            on:click={exportData}
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <i class="fas fa-download mr-2"></i>
            导出数据
          </button>
          
          <span class="text-gray-600">产品经理小王</span>
          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">退出登录</button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <span class="ml-4 text-gray-600">加载数据中...</span>
    </div>
    {:else}
    
    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <i class="fas fa-users text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总用户数</p>
            <p class="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.totalUsers)}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <i class="fas fa-palette text-green-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总创作数</p>
            <p class="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.totalCreations)}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <i class="fas fa-shopping-cart text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总订单数</p>
            <p class="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.totalOrders)}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总收入</p>
            <p class="text-2xl font-bold text-gray-900">¥{formatNumber(dashboardData.overview.totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <i class="fas fa-chart-line text-red-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">月增长率</p>
            <p class="text-2xl font-bold text-gray-900">{dashboardData.overview.monthlyGrowth.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- 销售趋势图 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">销售趋势</h3>
        <canvas id="salesChart" width="400" height="200"></canvas>
      </div>

      <!-- 风格分布图 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">热门风格分布</h3>
        <canvas id="styleChart" width="400" height="200"></canvas>
      </div>
    </div>

    <!-- 地区分析图 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">地区销售分析</h3>
      <canvas id="regionChart" width="800" height="300"></canvas>
    </div>

    <!-- 详细数据表格 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 热门创作风格 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">热门创作风格</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            {#each dashboardData.creationStats.popularStyles as style, index}
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span class="ml-3 text-gray-900">{style.style}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{style.count} 次</div>
                <div class="text-xs text-gray-500">{style.likes} 点赞</div>
              </div>
            </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- 产品销售排行 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">产品销售排行</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            {#each dashboardData.orderStats.productSales as product, index}
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span class="ml-3 text-gray-900">{product.name}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{product.sales} 件</div>
                <div class="text-xs text-gray-500">¥{product.revenue.toFixed(2)}</div>
              </div>
            </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- 地区统计表格 -->
    <div class="bg-white rounded-lg shadow mt-8">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">地区销售详情</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">省份</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">城市</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单数</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收入</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均订单价值</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each dashboardData.orderStats.regionStats as region}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.province}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.city}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.userCount}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.orderCount}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{region.totalRevenue.toFixed(2)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ¥{region.orderCount > 0 ? (region.totalRevenue / region.orderCount).toFixed(2) : '0.00'}
              </td>
            </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    
    {/if}
  </div>
</div>

<style>
  /* 自定义样式 */
  .chart-container {
    position: relative;
    height: 300px;
  }
</style> 