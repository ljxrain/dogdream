<script lang="ts">
  import { goto } from '$app/navigation';
  
  let loginForm = {
    account: '', // 改为account，支持邮箱或手机号
    code: '',
    password: ''
  };
  
  let loginType = 'password'; // 'code' 或 'password'，默认密码登录
  let isLoading = false;
  let countdown = 0;
  let countdownTimer: number;
  let accountType: 'email' | 'phone' | 'unknown' = 'unknown';
  let showPassword = false; // 控制密码显示隐藏
  
  // 智能检测输入类型
  function detectAccountType(value: string): 'email' | 'phone' | 'unknown' {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (emailRegex.test(value)) {
      return 'email';
    } else if (phoneRegex.test(value)) {
      return 'phone';
    }
    return 'unknown';
  }
  
  // 监听账号输入变化
  $: accountType = detectAccountType(loginForm.account);
  
  function switchLoginType(type: string) {
    loginType = type;
    loginForm.code = '';
    loginForm.password = '';
  }
  
  async function sendCode() {
    if (!loginForm.account) {
      alert('请输入手机号或邮箱');
      return;
    }
    
    const type = detectAccountType(loginForm.account);
    if (type === 'unknown') {
      alert('请输入正确的手机号或邮箱地址');
      return;
    }
    
    countdown = 60;
    countdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000) as unknown as number;
    
    // 模拟发送验证码
    const target = type === 'email' ? '邮箱' : '手机';
    alert(`验证码已发送到您的${target}`);
  }
  
  async function handleLogin() {
    if (!loginForm.account) {
      alert('请输入手机号或邮箱');
      return;
    }
    
    const type = detectAccountType(loginForm.account);
    if (type === 'unknown') {
      alert('请输入正确的手机号或邮箱地址');
      return;
    }
    
    if (loginType === 'code' && !loginForm.code) {
      alert('请输入验证码');
      return;
    }
    
    if (loginType === 'password' && !loginForm.password) {
      alert('请输入密码');
      return;
    }
    
    isLoading = true;
    
    try {
      // 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: loginForm.account,
          accountType: type,
          loginType: loginType,
          code: loginForm.code,
          password: loginForm.password
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // 登录成功，保存token
        localStorage.setItem('token', result.token);
        alert('登录成功！');
        goto('/');
      } else {
        alert(result.message || '登录失败');
      }
    } catch (error) {
      console.error('登录错误:', error);
      alert('网络错误，请稍后重试');
    } finally {
      isLoading = false;
    }
  }
  
  function handleThirdPartyLogin(platform: string) {
    alert(`${platform}登录功能正在开发中`);
  }
  
  // 获取占位符文本
  function getPlaceholder(): string {
    if (accountType === 'email') {
      return '请输入邮箱地址';
    } else if (accountType === 'phone') {
      return '请输入手机号';
    }
    return '请输入手机号或邮箱地址';
  }
  
  // 获取图标
  function getAccountIcon(): string {
    if (accountType === 'email') {
      return 'fas fa-envelope';
    } else if (accountType === 'phone') {
      return 'fas fa-mobile-alt';
    }
    return 'fas fa-user';
  }
</script>

<svelte:head>
  <title>登录 - 造梦家</title>
  <meta name="description" content="登录造梦家，开始你的创作之旅" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Logo和欢迎信息 -->
    <div class="text-center">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
        <i class="fas fa-magic text-3xl text-white"></i>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h2>
      <p class="text-lg text-gray-600">登录你的造梦家账户</p>
    </div>
    
    <!-- 登录表单卡片 -->
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <!-- 登录方式切换 -->
      <div class="flex rounded-xl bg-gray-100 p-1 mb-8">
        <button 
          class="flex-1 py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 {
            loginType === 'password' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }"
          on:click={() => switchLoginType('password')}
        >
          密码登录
        </button>
        <button 
          class="flex-1 py-3 px-6 rounded-lg text-base font-medium transition-all duration-200 {
            loginType === 'code' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }"
          on:click={() => switchLoginType('code')}
        >
          验证码登录
        </button>
      </div>
      
      <!-- 登录表单 -->
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <!-- 账号输入（支持手机号和邮箱） -->
        <div>
          <label for="account" class="block text-sm font-medium text-gray-700 mb-2">
            手机号/邮箱
            {#if accountType === 'email'}
              <span class="text-green-600 text-xs">（邮箱格式）</span>
            {:else if accountType === 'phone'}
              <span class="text-green-600 text-xs">（手机号格式）</span>
            {/if}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i class="{getAccountIcon()} text-gray-400 transition-colors"></i>
            </div>
            <input
              id="account"
              type="text"
              bind:value={loginForm.account}
              placeholder={getPlaceholder()}
              class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              maxlength="100"
              autocomplete="username"
              spellcheck="false"
              autocapitalize="none"
              autocorrect="off"
            />
          </div>
        </div>
        
        {#if loginType === 'code'}
          <!-- 验证码输入 -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              验证码
            </label>
            <div class="flex gap-4">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fas fa-key text-gray-400"></i>
                </div>
                <input
                  id="code"
                  type="text"
                  bind:value={loginForm.code}
                  placeholder="请输入验证码"
                  class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                  maxlength="6"
                />
              </div>
              <button
                type="button"
                on:click={sendCode}
                disabled={countdown > 0 || accountType === 'unknown'}
                class="px-6 py-4 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>
        {:else}
          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              {#if showPassword}
                <input
                  id="password"
                  type="text"
                  bind:value={loginForm.password}
                  placeholder="请输入密码"
                  class="block w-full pl-12 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                />
              {:else}
                <input
                  id="password"
                  type="password"
                  bind:value={loginForm.password}
                  placeholder="请输入密码"
                  class="block w-full pl-12 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                />
              {/if}
              <button
                type="button"
                on:click={() => (showPassword = !showPassword)}
                class="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 z-50"
                title={showPassword ? '隐藏密码' : '显示密码'}
              >
                {#if showPassword}
                  <i class="fas fa-eye-slash"></i>
                {:else}
                  <i class="fas fa-eye"></i>
                {/if}
              </button>
            </div>
          </div>
          
          <!-- 忘记密码 -->
          <div class="text-right">
            <a href="/forgot-password" class="text-sm text-blue-600 hover:text-blue-500">
              忘记密码？
            </a>
          </div>
        {/if}
        
        <!-- 登录按钮 -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <i class="fas fa-spinner fa-spin mr-2"></i>
            登录中...
          {:else}
            登录
          {/if}
        </button>
      </form>
      
      <!-- 第三方登录 -->
      <div class="mt-8">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500">其他登录方式</span>
          </div>
        </div>
        
        <div class="mt-6 grid grid-cols-3 gap-4">
          <button
            type="button"
            on:click={() => handleThirdPartyLogin('微信')}
            class="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-weixin text-green-500 text-xl"></i>
          </button>
          <button
            type="button"
            on:click={() => handleThirdPartyLogin('QQ')}
            class="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-qq text-blue-500 text-xl"></i>
          </button>
          <button
            type="button"
            on:click={() => handleThirdPartyLogin('微博')}
            class="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <i class="fab fa-weibo text-red-500 text-xl"></i>
          </button>
        </div>
      </div>
      
      <!-- 注册链接 -->
      <div class="text-center mt-8">
        <p class="text-gray-600">
          还没有账户？
          <a href="/register" class="text-blue-600 hover:text-blue-500 font-medium">
            立即注册
          </a>
        </p>
      </div>
    </div>
  </div>
</div> 