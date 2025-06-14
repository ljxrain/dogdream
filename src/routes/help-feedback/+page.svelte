<script lang="ts">
  import { onMount } from 'svelte';
  
  let activeTab = 'faq';
  let feedbackForm = {
    type: 'suggestion',
    email: '',
    subject: '',
    message: ''
  };
  
  const faqs = [
    {
      category: '基础使用',
      questions: [
        		{ q: '如何开始使用狗狗造梦家？', a: '注册账户后，选择相应功能（照片圆梦、视频生成等），上传图片，选择风格，即可开始创作。' },
        { q: '支持哪些图片格式？', a: '支持 JPG、PNG、WEBP 等常见图片格式，建议图片大小不超过10MB。' },
        { q: '生成需要多长时间？', a: '通常在10秒到3分钟不等，具体时间取决于选择的质量和复杂度。' }
      ]
    },
    {
      category: '功能特色',
      questions: [
        { q: '有哪些艺术风格可选？', a: '提供吉卜力、迪士尼、油画、水墨画、3D卡通等20+种风格，持续更新中。' },
        { q: '视频生成支持多长时间？', a: '支持5秒、10秒、15秒三种时长，可根据需要选择。' },
        { q: '表情包可以添加文字吗？', a: '是的，支持自定义文字内容，多种字体和颜色可选。' }
      ]
    },
    {
      category: '账户相关',
      questions: [
        { q: '如何获得积分？', a: '注册即送积分，每日签到、分享作品、邀请好友都可获得积分奖励。' },
        { q: 'VIP会员有什么特权？', a: 'VIP会员享受更快生成速度、专享风格、无限下载、优先客服等特权。' },
        { q: '作品版权归谁所有？', a: '您创作的作品版权归您所有，平台仅提供技术服务支持。' }
      ]
    },
    {
      category: '商城购买',
      questions: [
        { q: '如何定制实体商品？', a: '在商城选择商品，上传您的创作图片，确认预览效果后下单购买。' },
        { q: '支持哪些付款方式？', a: '支持微信支付、支付宝、银行卡等多种付款方式。' },
        { q: '商品制作需要多长时间？', a: '一般需要3-7个工作日，具体时间会在订单详情中显示。' }
      ]
    }
  ];
  
  const supportChannels = [
    { icon: 'fas fa-comments', title: '在线客服', desc: '7x24小时在线支持', action: '立即咨询' },
    { icon: 'fas fa-envelope', title: '邮件支持', desc: 'support@dreammaker.ai', action: '发送邮件' },
    { icon: 'fab fa-weixin', title: '微信群', desc: '加入用户交流群', action: '扫码加入' },
    { icon: 'fas fa-book', title: '使用手册', desc: '详细操作指南', action: '查看文档' }
  ];
  
  function setTab(tab: string) {
    activeTab = tab;
  }
  
  function submitFeedback() {
    if (!feedbackForm.email || !feedbackForm.message) {
      alert('请填写邮箱和反馈内容');
      return;
    }
    
    // 模拟提交
    alert('感谢您的反馈，我们会尽快处理！');
    feedbackForm = { type: 'suggestion', email: '', subject: '', message: '' };
  }
</script>

<svelte:head>
  	<title>帮助与反馈 - 狗狗造梦家</title>
  <meta name="description" content="获取帮助，提交反馈，联系客服" />
</svelte:head>

<style>
  .tab-btn {
    transition: all 0.3s ease;
  }
  .tab-btn.active {
    background-color: #3b82f6;
    color: white;
  }
  .faq-item {
    transition: all 0.3s ease;
  }
  .faq-item:hover {
    background-color: #f9fafb;
  }
  .support-card {
    transition: all 0.3s ease;
  }
  .support-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <section class="bg-white border-b">
    <div class="max-w-4xl mx-auto px-6 py-12 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">帮助与反馈</h1>
      <p class="text-xl text-gray-600">为您提供全方位的服务支持</p>
    </div>
  </section>

  <div class="max-w-4xl mx-auto px-6 py-12">
    <!-- 标签页导航 -->
    <div class="flex flex-wrap gap-4 mb-12 justify-center">
      <button 
        class="tab-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeTab === 'faq' ? 'active' : 'hover:border-blue-300'}"
        on:click={() => setTab('faq')}
      >
        常见问题
      </button>
      <button 
        class="tab-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeTab === 'feedback' ? 'active' : 'hover:border-blue-300'}"
        on:click={() => setTab('feedback')}
      >
        意见反馈
      </button>
      <button 
        class="tab-btn px-6 py-3 rounded-full border border-gray-300 font-medium transition-all {activeTab === 'contact' ? 'active' : 'hover:border-blue-300'}"
        on:click={() => setTab('contact')}
      >
        联系客服
      </button>
    </div>

    <!-- 常见问题 -->
    {#if activeTab === 'faq'}
      <section>
        <div class="space-y-8">
          {#each faqs as category}
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div class="bg-blue-600 text-white px-6 py-4">
                <h2 class="text-xl font-bold">{category.category}</h2>
              </div>
              <div class="divide-y divide-gray-200">
                {#each category.questions as faq}
                  <details class="faq-item group">
                    <summary class="flex justify-between items-center p-6 cursor-pointer">
                      <h3 class="font-semibold text-gray-900">{faq.q}</h3>
                      <i class="fas fa-chevron-down text-gray-400 transform group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div class="px-6 pb-6">
                      <p class="text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-6">没有找到您想要的答案？</p>
          <button 
            on:click={() => setTab('contact')}
            class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            联系客服
          </button>
        </div>
      </section>
    {/if}

    <!-- 意见反馈 -->
    {#if activeTab === 'feedback'}
      <section>
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">意见反馈</h2>
          <p class="text-gray-600 mb-8">您的意见是我们前进的动力，请告诉我们您的想法</p>
          
          <form on:submit|preventDefault={submitFeedback} class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">反馈类型</label>
              <select 
                bind:value={feedbackForm.type}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="suggestion">功能建议</option>
                <option value="bug">问题反馈</option>
                <option value="complaint">投诉举报</option>
                <option value="praise">表扬鼓励</option>
                <option value="cooperation">合作咨询</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">邮箱地址 *</label>
              <input 
                type="email" 
                bind:value={feedbackForm.email}
                placeholder="请输入您的邮箱地址"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">主题</label>
              <input 
                type="text" 
                bind:value={feedbackForm.subject}
                placeholder="简要描述问题或建议"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">详细内容 *</label>
              <textarea 
                bind:value={feedbackForm.message}
                placeholder="请详细描述您的意见或建议..."
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <button 
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                提交反馈
              </button>
            </div>
          </form>
        </div>
      </section>
    {/if}

    <!-- 联系客服 -->
    {#if activeTab === 'contact'}
      <section>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each supportChannels as channel}
            <div class="support-card bg-white rounded-2xl shadow-lg p-8 text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="{channel.icon} text-2xl text-blue-600"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{channel.title}</h3>
              <p class="text-gray-600 mb-6">{channel.desc}</p>
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                {channel.action}
              </button>
            </div>
          {/each}
        </div>
        
        <div class="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">快速联系</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-clock text-xl text-green-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">服务时间</h3>
              <p class="text-gray-600 text-sm">7x24小时在线服务</p>
            </div>
            
            <div>
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-reply text-xl text-yellow-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">响应时间</h3>
              <p class="text-gray-600 text-sm">平均5分钟内回复</p>
            </div>
            
            <div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-language text-xl text-purple-600"></i>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">服务语言</h3>
              <p class="text-gray-600 text-sm">中文、英文支持</p>
            </div>
          </div>
        </div>
      </section>
    {/if}
  </div>
</div> 