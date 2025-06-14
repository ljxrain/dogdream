<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  
  let cleared = false;
  
  onMount(() => {
    if (browser) {
      // 清除所有localStorage数据
      localStorage.clear();
      cleared = true;
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        goto('/login');
      }, 3000);
    }
  });
</script>

<svelte:head>
  	<title>清除缓存 - 狗狗造梦家</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
    {#if cleared}
      <div class="mb-6">
        <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">缓存已清除</h1>
        <p class="text-gray-600">所有本地存储数据已成功清除</p>
      </div>
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p class="text-green-800 text-sm">
          <i class="fas fa-info-circle mr-2"></i>
          正在跳转到登录页面...
        </p>
      </div>
      
      <a 
        href="/login" 
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        立即前往登录
      </a>
    {:else}
      <div class="mb-6">
        <i class="fas fa-spinner fa-spin text-6xl text-blue-500 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">正在清除缓存</h1>
        <p class="text-gray-600">请稍候...</p>
      </div>
    {/if}
  </div>
</div> 