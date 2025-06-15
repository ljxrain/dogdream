<script lang="ts">
  import { onMount } from 'svelte';
  import { user, isLoggedIn, initializeAuth } from '$lib/stores/auth';
  import { browser } from '$app/environment';

  let debugInfo = {
    cookies: '',
    token: '',
    userAgent: '',
    protocol: '',
    host: ''
  };

  let testResults = {
    cookieTest: '',
    apiTest: '',
    authTest: ''
  };

  onMount(() => {
    if (browser) {
      // 收集调试信息
      debugInfo.cookies = document.cookie;
      debugInfo.userAgent = navigator.userAgent;
      debugInfo.protocol = location.protocol;
      debugInfo.host = location.host;
      
      // 提取token
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth-token') {
          debugInfo.token = value ? '存在' : '空值';
          break;
        }
      }
      if (!debugInfo.token) {
        debugInfo.token = '不存在';
      }
    }
  });

  async function testCookie() {
    if (!browser) return;
    
    // 设置测试cookie
    const testValue = 'test-' + Date.now();
    document.cookie = `test-cookie=${testValue}; path=/; max-age=60`;
    
    // 读取测试cookie
    const cookies = document.cookie.split(';');
    let found = false;
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'test-cookie' && value === testValue) {
        found = true;
        break;
      }
    }
    
    testResults.cookieTest = found ? '✅ Cookie读写正常' : '❌ Cookie读写失败';
    
    // 清除测试cookie
    document.cookie = 'test-cookie=; path=/; max-age=0';
  }

  async function testAPI() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.apiTest = `✅ API调用成功: ${data.email}`;
      } else {
        testResults.apiTest = `❌ API调用失败: ${response.status}`;
      }
    } catch (error) {
      testResults.apiTest = `❌ API调用异常: ${error}`;
    }
  }

  async function testAuth() {
    try {
      await initializeAuth();
      testResults.authTest = $isLoggedIn ? 
        `✅ 认证成功: ${$user?.email}` : 
        '❌ 认证失败: 未登录';
    } catch (error) {
      testResults.authTest = `❌ 认证异常: ${error}`;
    }
  }

  function clearAllCookies() {
    if (!browser) return;
    
    // 获取所有cookie并清除
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; path=/; max-age=0`;
    }
    
    location.reload();
  }

  function manualLogin() {
    const token = prompt('请输入token:');
    if (token) {
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      location.reload();
    }
  }
</script>

<svelte:head>
  <title>认证调试页面</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8 text-center">🔧 认证调试页面</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- 当前状态 -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-blue-600">📊 当前状态</h2>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="font-medium">登录状态:</span>
          <span class="{$isLoggedIn ? 'text-green-600' : 'text-red-600'}">
            {$isLoggedIn ? '✅ 已登录' : '❌ 未登录'}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">用户邮箱:</span>
          <span class="text-gray-700">{$user?.email || '无'}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">用户角色:</span>
          <span class="text-gray-700">{$user?.role || '无'}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Token状态:</span>
          <span class="{debugInfo.token === '存在' ? 'text-green-600' : 'text-red-600'}">
            {debugInfo.token}
          </span>
        </div>
      </div>
    </div>

    <!-- 环境信息 -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-purple-600">🌐 环境信息</h2>
      <div class="space-y-3 text-sm">
        <div>
          <span class="font-medium">协议:</span>
          <span class="ml-2 text-gray-700">{debugInfo.protocol}</span>
        </div>
        <div>
          <span class="font-medium">主机:</span>
          <span class="ml-2 text-gray-700">{debugInfo.host}</span>
        </div>
        <div>
          <span class="font-medium">浏览器:</span>
          <span class="ml-2 text-gray-700 text-xs">{debugInfo.userAgent}</span>
        </div>
      </div>
    </div>

    <!-- Cookie信息 -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-orange-600">🍪 Cookie信息</h2>
      <div class="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
        {debugInfo.cookies || '无Cookie'}
      </div>
    </div>

    <!-- 测试结果 -->
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-green-600">🧪 测试结果</h2>
      <div class="space-y-2">
        <div class="text-sm">{testResults.cookieTest || '未测试'}</div>
        <div class="text-sm">{testResults.apiTest || '未测试'}</div>
        <div class="text-sm">{testResults.authTest || '未测试'}</div>
      </div>
    </div>
  </div>

  <!-- 操作按钮 -->
  <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
    <button 
      on:click={testCookie}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      测试Cookie
    </button>
    
    <button 
      on:click={testAPI}
      class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
    >
      测试API
    </button>
    
    <button 
      on:click={testAuth}
      class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
    >
      测试认证
    </button>
    
    <button 
      on:click={clearAllCookies}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
    >
      清除所有Cookie
    </button>
  </div>

  <!-- 手动操作 -->
  <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <button 
      on:click={manualLogin}
      class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
    >
      手动设置Token
    </button>
    
    <a href="/login" class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors text-center">
      去登录页面
    </a>
    
    <button 
      on:click={() => location.reload()}
      class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
    >
      刷新页面
    </button>
  </div>

  <!-- 说明 -->
  <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <h3 class="font-semibold text-yellow-800 mb-2">🔍 调试说明</h3>
    <ul class="text-sm text-yellow-700 space-y-1">
      <li>• 检查Cookie是否正确设置和读取</li>
      <li>• 测试API端点是否正常响应</li>
      <li>• 验证认证状态初始化流程</li>
      <li>• 查看浏览器开发者工具的控制台日志</li>
    </ul>
  </div>
</div> 