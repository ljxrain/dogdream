<script lang="ts">
  import { page } from '$app/stores';
  
  $: currentPath = $page.url.pathname;
  
  const navItems = [
    { href: '/', icon: 'fas fa-home', label: '首页' },
    { href: '/showcase', icon: 'fas fa-compass', label: '热门' },
    { href: '/shop', icon: 'fas fa-store', label: '商城' },
    { href: '/dashboard', icon: 'fas fa-user', label: '我的' }
  ];
</script>

<div class="h-[83px] bg-white border-t border-gray-200 flex justify-around items-center fixed bottom-0 left-0 right-0 z-50">
  {#each navItems as item}
    <a 
      href={item.href} 
      class="flex flex-col items-center justify-center w-1/4 {currentPath === item.href ? 'text-blue-500' : 'text-gray-400'}"
    >
      <i class="{item.icon} text-2xl mb-1"></i>
      <span class="text-xs">{item.label}</span>
    </a>
  {/each}
</div> 