<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    // 重定向到个人中心页面
    goto('/me', { replaceState: true });
  });
</script>

<svelte:head>
  <title>个人中心 - 造梦家</title>
</svelte:head>

<!-- 加载中提示 -->
<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">正在跳转到个人中心...</p>
  </div>
</div> 