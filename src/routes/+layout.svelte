<script lang="ts">
  import '../app.css';
  import TopHeader from '$lib/components/TopHeader.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { initializeAuth, user } from '$lib/stores/auth';
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';

  // 在组件挂载时初始化认证状态
  onMount(() => {
    if (!browser) return;
    // 初始化认证状态（检查 localStorage 中的 token）
    initializeAuth();
  });

  // afterNavigate 应该在 onMount 外部调用
  afterNavigate(() => {
    if (!browser) return;
    initializeAuth();
  });
</script>

<div class="min-h-screen bg-gray-50">
  <TopHeader />
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <slot />
  </main>
</div> 