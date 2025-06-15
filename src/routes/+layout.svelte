<script lang="ts">
  import '../app.css';
  import TopHeader from '$lib/components/TopHeader.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { initializeAuth, user, isLoggedIn, isLoading } from '$lib/stores/auth';
  import { browser } from '$app/environment';

  let authInitialized = false;
  let initialAuthCheck = true;

  // 只在组件挂载时初始化一次认证状态
  onMount(async () => {
    if (!browser || authInitialized) return;
    
    console.log('🏠 根布局：开始初始化认证状态...');
    authInitialized = true;
    
    try {
      await initializeAuth();
      console.log('🏠 根布局：认证状态初始化完成');
    } catch (error) {
      console.error('🏠 根布局：认证状态初始化失败:', error);
    } finally {
      initialAuthCheck = false;
    }
  });

  // 监听登录状态变化
  $: if (browser && authInitialized) {
    console.log('👤 当前登录状态:', $isLoggedIn ? '已登录' : '未登录', $user?.email || '无用户');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <TopHeader />
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 在认证状态初始化完成前显示加载状态 -->
    {#if initialAuthCheck || $isLoading}
      <div class="flex items-center justify-center min-h-[50vh]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">正在加载...</p>
        </div>
      </div>
    {:else}
      <slot />
    {/if}
  </main>
</div> 