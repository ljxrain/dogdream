<script lang="ts">
  const features = [
    { icon: 'fas fa-magic', title: 'AI驱动创作', desc: '运用最先进的人工智能技术，让创意变为现实' },
    { icon: 'fas fa-palette', title: '多样化风格', desc: '提供丰富的艺术风格选择，满足不同用户需求' },
    { icon: 'fas fa-rocket', title: '快速生成', desc: '秒级处理速度，即时获得高质量创作结果' },
    { icon: 'fas fa-shield-alt', title: '隐私保护', desc: '严格保护用户数据安全，确保创作内容隐私' },
    { icon: 'fas fa-heart', title: '用户至上', desc: '以用户体验为核心，持续优化产品功能' },
    { icon: 'fas fa-globe', title: '开放生态', desc: '构建开放的创作生态，连接创作者与用户' }
  ];
  
  const team = [
    { name: '张明', role: 'CEO & 创始人', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', desc: '10年互联网产品经验，AI技术布道者' },
    { name: '李雪', role: 'CTO', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b69ad5ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', desc: '前谷歌AI工程师，深度学习专家' },
    { name: '王强', role: '产品总监', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', desc: '资深产品经理，用户体验设计师' },
    { name: '陈美', role: '设计总监', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', desc: '知名UI/UX设计师，视觉艺术家' }
  ];
  
  const milestones = [
    		{ year: '2023年1月', title: '公司成立', desc: '狗狗造梦家正式成立，开始AI创作平台的研发' },
    { year: '2023年3月', title: '产品上线', desc: '首版产品发布，支持基础的照片风格转换功能' },
    { year: '2023年6月', title: '用户突破', desc: '注册用户突破10万，获得种子轮融资' },
    { year: '2023年9月', title: '功能升级', desc: '新增视频生成和表情包制作功能' },
    { year: '2023年12月', title: '商城上线', desc: '推出创意商城，支持作品实体化定制' },
    { year: '2024年1月', title: '用户百万', desc: '注册用户突破100万，获得A轮融资' }
  ];
  
  const stats = [
    { number: '100万+', label: '注册用户' },
    { number: '500万+', label: '作品生成' },
    { number: '50万+', label: '商品定制' },
    { number: '99.9%', label: '用户满意度' }
  ];
</script>

<svelte:head>
  	<title>关于我们 - 狗狗造梦家</title>
	<meta name="description" content="了解狗狗造梦家的使命、愿景和团队" />
</svelte:head>

<style>
  .feature-card {
    transition: all 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  .team-card {
    transition: all 0.3s ease;
  }
  .team-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }
  .hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .timeline-item {
    position: relative;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: -40px;
    width: 2px;
    background: #e5e7eb;
  }
  .timeline-item:last-child::before {
    display: none;
  }
</style>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <section class="hero-section text-white py-20">
    <div class="max-w-4xl mx-auto px-6 text-center">
      			<h1 class="text-5xl md:text-6xl font-bold mb-8">关于狗狗造梦家</h1>
      <p class="text-xl md:text-2xl mb-12 opacity-90">用AI技术点亮每个人的创作梦想</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat}
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
            <div class="text-lg opacity-80">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-6 py-16">
    <!-- 使命愿景 -->
    <section class="mb-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">我们的使命</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          让每个人都能通过AI技术轻松创作出令人惊艳的作品，打破技术壁垒，释放创意潜能，让创意不再是少数人的特权。
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-eye text-3xl text-blue-600"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">愿景</h3>
          <p class="text-gray-600 leading-relaxed">
            成为全球领先的AI创作平台，让创意触手可及，让每个人都能成为艺术家和创作者。
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fas fa-compass text-3xl text-purple-600"></i>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">价值观</h3>
          <p class="text-gray-600 leading-relaxed">
            创新驱动、用户至上、开放共享、持续进步。我们相信技术应该服务于人，让生活更加美好。
          </p>
        </div>
      </div>
    </section>

    <!-- 核心特色 -->
    <section class="mb-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">核心特色</h2>
        			<p class="text-xl text-gray-600">为什么选择狗狗造梦家</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each features as feature}
          <div class="feature-card bg-white rounded-2xl p-8 text-center shadow-lg">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="{feature.icon} text-2xl text-blue-600"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
            <p class="text-gray-600 leading-relaxed">{feature.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- 团队介绍 -->
    <section class="mb-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">核心团队</h2>
        <p class="text-xl text-gray-600">来自顶尖科技公司的精英团队</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each team as member}
          <div class="team-card bg-white rounded-2xl p-6 text-center shadow-lg">
            <img src={member.avatar} alt={member.name} class="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
            <h3 class="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
            <div class="text-blue-600 font-medium mb-3">{member.role}</div>
            <p class="text-sm text-gray-600 leading-relaxed">{member.desc}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- 发展历程 -->
    <section class="mb-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-6">发展历程</h2>
        <p class="text-xl text-gray-600">从创立到今天的成长足迹</p>
      </div>
      
      <div class="max-w-3xl mx-auto">
        <div class="space-y-12">
          {#each milestones as milestone}
            <div class="timeline-item flex items-start gap-8">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center z-10 relative">
                  <i class="fas fa-calendar text-white text-sm"></i>
                </div>
              </div>
              <div class="flex-1">
                <div class="bg-white rounded-xl p-6 shadow-lg">
                  <div class="text-blue-600 font-semibold mb-2">{milestone.year}</div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h3>
                  <p class="text-gray-600">{milestone.desc}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- 联系我们 -->
    <section class="bg-white rounded-2xl p-12 shadow-lg text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">联系我们</h2>
      <p class="text-lg text-gray-600 mb-8">有任何问题或合作意向，欢迎与我们联系</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-envelope text-2xl text-blue-600"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">邮箱</h3>
          <p class="text-gray-600">contact@dreammaker.ai</p>
        </div>
        
        <div>
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-phone text-2xl text-green-600"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">电话</h3>
          <p class="text-gray-600">400-888-9999</p>
        </div>
        
        <div>
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-map-marker-alt text-2xl text-purple-600"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">地址</h3>
          <p class="text-gray-600">北京市朝阳区创新大厦</p>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/help-feedback" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          反馈建议
        </a>
        <a href="/business" class="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-colors">
          商务合作
        </a>
      </div>
    </section>
  </div>
</div> 