<script lang="ts">
  import { goto } from '$app/navigation';
  import { user, isLoggedIn } from '$lib/stores/auth';
  
  let registerForm = {
    account: '', // 支持邮箱或手机号
    code: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    agreedToTerms: false
  };
  
  let currentStep = 1; // 1: 账号, 2: 验证码, 3: 设置密码和昵称
  let isLoading = false;
  let countdown = 0;
  let countdownTimer: number;
  let accountType: 'email' | 'phone' | 'unknown' = 'unknown';
  
  // 检查是否已登录，如果已登录则重定向
  $: if ($isLoggedIn && $user) {
    console.log('👤 用户已登录，重定向到首页');
    goto('/');
  }
  
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
  $: accountType = detectAccountType(registerForm.account);
  
  async function sendCode() {
    if (!registerForm.account) {
      alert('请输入手机号或邮箱');
      return;
    }
    
    const type = detectAccountType(registerForm.account);
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
  
  function nextStep() {
    if (currentStep === 1) {
      if (!registerForm.account) {
        alert('请输入手机号或邮箱');
        return;
      }
      const type = detectAccountType(registerForm.account);
      if (type === 'unknown') {
        alert('请输入正确的手机号或邮箱地址');
        return;
      }
      sendCode();
      currentStep = 2;
    } else if (currentStep === 2) {
      if (!registerForm.code) {
        alert('请输入验证码');
        return;
      }
      if (registerForm.code.length !== 6) {
        alert('请输入6位验证码');
        return;
      }
      currentStep = 3;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
  
  async function handleRegister() {
    if (!registerForm.nickname) {
      alert('请输入昵称');
      return;
    }
    
    if (!registerForm.password) {
      alert('请设置密码');
      return;
    }
    
    if (registerForm.password.length < 6) {
      alert('密码长度不能少于6位');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    
    if (!registerForm.agreedToTerms) {
      alert('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    isLoading = true;
    
    try {
      const type = detectAccountType(registerForm.account);
      
      // 调用注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: registerForm.account,
          accountType: type,
          code: registerForm.code,
          password: registerForm.password,
          nickname: registerForm.nickname
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // 注册成功，保存token
        localStorage.setItem('token', result.token);
        				alert('注册成功！欢迎加入狗狗造梦家');
        goto('/');
      } else {
        alert(result.message || '注册失败');
      }
    } catch (error) {
      console.error('注册错误:', error);
      alert('网络错误，请稍后重试');
    } finally {
      isLoading = false;
    }
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
  
  // 获取步骤标题
  function getStepTitle(): string {
    if (currentStep === 1) {
      return '输入账号';
    } else if (currentStep === 2) {
      return '验证身份';
    }
    return '完善信息';
  }
  
  // 获取步骤描述
  function getStepDescription(): string {
    if (currentStep === 1) {
      return '请输入手机号或邮箱地址';
    } else if (currentStep === 2) {
      const type = accountType === 'email' ? '邮箱' : '手机';
      return `验证码已发送至您的${type}`;
    }
    return '设置密码和昵称，完成注册';
  }
</script>

<svelte:head>
  	<title>注册 - 狗狗造梦家</title>
	<meta name="description" content="注册狗狗造梦家账户，开启你的创作之旅" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Logo和欢迎信息 -->
    <div class="text-center">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
        <i class="fas fa-magic text-3xl text-white"></i>
      </div>
      			<h2 class="text-3xl font-bold text-gray-900 mb-2">加入狗狗造梦家</h2>
      <p class="text-lg text-gray-600">创建你的专属账户</p>
    </div>
    
    <!-- 进度指示器 -->
    <div class="flex items-center justify-center mb-8">
      <div class="flex items-center">
        {#each [1, 2, 3] as step}
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors {
              currentStep >= step 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-500'
            }">
              {step}
            </div>
            {#if step < 3}
              <div class="w-12 h-1 ml-3 rounded {
                currentStep > step ? 'bg-purple-500' : 'bg-gray-200'
              }"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    
    <!-- 注册表单卡片 -->
    <div class="bg-white rounded-2xl shadow-xl p-8">
      {#if currentStep === 1}
        <!-- 步骤1: 账号输入 -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">{getStepTitle()}</h2>
          <p class="text-gray-600">{getStepDescription()}</p>
        </div>
        
        <div class="space-y-6">
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
                bind:value={registerForm.account}
                placeholder={getPlaceholder()}
                class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                maxlength="100"
                autocomplete="username"
                spellcheck="false"
                autocapitalize="none"
                autocorrect="off"
              />
            </div>
          </div>
          
          <button
            type="button"
            on:click={nextStep}
            disabled={accountType === 'unknown'}
            class="w-full py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
          </button>
        </div>
        
      {:else if currentStep === 2}
        <!-- 步骤2: 验证码 -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">{getStepTitle()}</h2>
          <p class="text-gray-600">{getStepDescription()}</p>
        </div>
        
        <div class="space-y-6">
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
                  bind:value={registerForm.code}
                  placeholder="请输入验证码"
                  class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                  maxlength="6"
                />
              </div>
              <button
                type="button"
                on:click={sendCode}
                disabled={countdown > 0}
                class="px-6 py-4 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : '重新发送'}
              </button>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button
              type="button"
              on:click={prevStep}
              class="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-base"
            >
              上一步
            </button>
            <button
              type="button"
              on:click={nextStep}
              class="flex-1 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors text-base"
            >
              下一步
            </button>
          </div>
        </div>
        
      {:else}
        <!-- 步骤3: 设置密码和昵称 -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">{getStepTitle()}</h2>
          <p class="text-gray-600">{getStepDescription()}</p>
        </div>
        
        <form on:submit|preventDefault={handleRegister} class="space-y-6">
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-400"></i>
              </div>
              <input
                id="nickname"
                type="text"
                bind:value={registerForm.nickname}
                placeholder="请输入昵称"
                class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                maxlength="20"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                type="password"
                bind:value={registerForm.password}
                placeholder="请设置密码（至少6位）"
                class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
                minlength="6"
              />
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input
                id="confirmPassword"
                type="password"
                bind:value={registerForm.confirmPassword}
                placeholder="请再次输入密码"
                class="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-base"
              />
            </div>
          </div>
          
          <!-- 用户协议 -->
          <div class="flex items-start">
            <input
              id="terms"
              type="checkbox"
              bind:checked={registerForm.agreedToTerms}
              class="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label for="terms" class="ml-3 text-sm text-gray-600">
              我已阅读并同意
              <a href="/terms" class="text-purple-600 hover:text-purple-500">用户协议</a>
              和
              <a href="/privacy" class="text-purple-600 hover:text-purple-500">隐私政策</a>
            </label>
          </div>
          
          <div class="flex gap-4">
            <button
              type="button"
              on:click={prevStep}
              class="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-base"
            >
              上一步
            </button>
            <button
              type="submit"
              disabled={isLoading}
              class="flex-1 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isLoading}
                <i class="fas fa-spinner fa-spin mr-2"></i>
                注册中...
              {:else}
                完成注册
              {/if}
            </button>
          </div>
        </form>
      {/if}
      
      <!-- 登录链接 -->
      <div class="text-center mt-8">
        <p class="text-gray-600">
          已有账户？
          <a href="/login" class="text-purple-600 hover:text-purple-500 font-medium">
            立即登录
          </a>
        </p>
      </div>
    </div>
  </div>
</div>