<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoggedIn, initializeAuth } from '$lib/stores/auth';
  import { browser } from '$app/environment';

  let cookieInfo = '';
  let tokenInfo = '';

  onMount(() => {
    if (browser) {
      cookieInfo = document.cookie;
      
      // 手动获取token
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth-token') {
          tokenInfo = value ? '存在' : '空值';
          break;
        }
      }
      if (!tokenInfo) {
        tokenInfo = '不存在';
      }
    }
  });

  async function testAuth() {
    await initializeAuth();
  }

  function clearCookies() {
    if (browser) {
      document.cookie = 'auth-token=; path=/; max-age=0';
      location.reload();
    }
  }
</script>

<svelte:head>
  <title>认证状态测试</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">认证状态测试</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- 当前状态 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">当前认证状态</h2>
      <div class="space-y-2">
        <p><strong>登录状态:</strong> 
          <span class="{$isLoggedIn ? 'text-green-600' : 'text-red-600'}">
            {$isLoggedIn ? '已登录' : '未登录'}
          </span>
        </p>
        <p><strong>用户信息:</strong> {$user ? $user.email : '无'}</p>
        <p><strong>用户角色:</strong> {$user?.role || '无'}</p>
      </div>
    </div>

    <!-- Cookie信息 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Cookie信息</h2>
      <div class="space-y-2">
        <p><strong>auth-token:</strong> 
          <span class="{tokenInfo === '存在' ? 'text-green-600' : 'text-red-600'}">
            {tokenInfo}
          </span>
        </p>
        <p><strong>所有cookies:</strong></p>
        <pre class="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{cookieInfo || '无'}</pre>
      </div>
    </div>
  </div>

  <!-- 操作按钮 -->
  <div class="mt-6 space-x-4">
    <button 
      on:click={testAuth}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      重新检查认证状态
    </button>
    
    <button 
      on:click={clearCookies}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      清除Cookies
    </button>
    
    <a href="/login" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block">
      去登录
    </a>
  </div>
</div> 