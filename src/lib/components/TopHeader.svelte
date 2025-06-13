<script lang="ts">
  import { page } from '$app/stores';
  import { user, logout } from '$lib/stores/auth';
  
  $: currentPath = $page.url.pathname;
  
  const navItems = [
    { href: '/', label: '首页' },
    { href: '/photo-to-image', label: '照片圆梦' },
    { href: '/emoji-master', label: '表情包大师' },
    { href: '/showcase', label: '作品展示' },
    { href: '/shop', label: '商城' },
    { href: '/orders', label: '我的订单' }
  ];

  let showUserMenu = false;

  async function handleLogout() {
    await logout();
    showUserMenu = false;
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  // 关闭用户菜单（点击外部）
  function closeUserMenu() {
    showUserMenu = false;
  }
</script>

<!-- 点击外部关闭用户菜单 -->
{#if showUserMenu}
  <div 
    class="fixed inset-0 z-40" 
    on:click={closeUserMenu}
    on:keydown={(e) => e.key === 'Escape' && closeUserMenu()}
    role="button"
    tabindex="-1"
    aria-label="关闭用户菜单"
  ></div>
{/if}

<header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2">
          <i class="fas fa-magic text-2xl text-blue-600"></i>
          <h1 class="text-2xl font-bold text-gray-900">造梦家</h1>
        </a>
      </div>
      
      <!-- Navigation -->
      <nav class="hidden md:flex items-center space-x-8">
        {#each navItems as item}
          <a 
            href={item.href}
            class="text-sm font-medium transition-colors duration-200 {
              currentPath === item.href 
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                : 'text-gray-700 hover:text-blue-600'
            }"
          >
            {item.label}
          </a>
        {/each}
      </nav>
      
      <!-- Right side actions -->
      <div class="flex items-center space-x-4 whitespace-nowrap">
        <button class="text-gray-500 hover:text-gray-700 transition-colors">
          <i class="fas fa-search text-lg"></i>
        </button>
        <button class="text-gray-500 hover:text-gray-700 transition-colors">
          <i class="fas fa-bell text-lg"></i>
        </button>
        
        {#if $user}
          <!-- 已登录用户菜单 -->
          <div class="relative">
            <button 
              on:click={toggleUserMenu}
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {$user.name ? $user.name.charAt(0) : $user.email.charAt(0)}
                </span>
              </div>
              <span class="hidden lg:block text-sm font-medium">{$user.name || $user.email}</span>
              <i class="fas fa-chevron-down text-xs"></i>
            </button>

            {#if showUserMenu}
              <!-- 用户下拉菜单 -->
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{$user.name || '用户'}</p>
                  <p class="text-xs text-gray-500">{$user.email}</p>
                  {#if $user.role}
                  <span class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                    {$user.role === 'USER' ? '普通用户' : 
                     $user.role === 'ADMIN' ? '管理员' :
                     $user.role === 'CUSTOMER_SERVICE' ? '客服' :
                     $user.role === 'PRODUCT_MANAGER' ? '产品经理' : $user.role}
                  </span>
                  {/if}
                </div>
                
                <a href="/my-works" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <i class="fas fa-palette mr-2"></i>我的作品
                </a>
                
                {#if ['ADMIN', 'CUSTOMER_SERVICE', 'PRODUCT_MANAGER'].includes($user.role)}
                  <a href="/admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <i class="fas fa-cog mr-2"></i>管理后台
                  </a>
                {/if}
                
                <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <i class="fas fa-user mr-2"></i>个人设置
                </a>
                
                <hr class="my-2">
                
                <button 
                  on:click={handleLogout}
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <i class="fas fa-sign-out-alt mr-2"></i>退出登录
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- 未登录用户 -->
          <div class="flex items-center space-x-3">
            <a href="/login" class="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">
              登录
            </a>
            <a href="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              注册
            </a>
          </div>
        {/if}
      </div>
      
      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
    </div>
  </div>
</header> 