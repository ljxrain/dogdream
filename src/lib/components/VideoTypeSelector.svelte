<script lang="ts">
  import { Smartphone, Monitor, Video, Film } from 'lucide-svelte';

  type VideoType = 'mobile' | 'desktop' | 'short' | 'animation';
  let selected: VideoType = 'mobile';

  const types = [
    { id: 'mobile', name: '手机屏保', price: '¥2.00', icon: Smartphone },
    { id: 'desktop', name: '电脑屏保', price: '¥4.00', icon: Monitor },
    { id: 'short', name: '短视频', price: '¥6.00', icon: Video },
    { id: 'animation', name: '动画片', price: '¥10.00', icon: Film },
  ];
</script>

<div class="grid grid-cols-2 gap-2">
  {#each types as type}
    <button
      on:click={() => selected = type.id as VideoType}
      class="flex flex-col items-center justify-center rounded-lg border py-2 text-center text-xs"
      class:border-indigo-500={selected === type.id}
      class:text-indigo-600={selected === type.id}
      class:bg-indigo-50={selected === type.id}
      class:border-gray-300={selected !== type.id}
      class:text-gray-600={selected !== type.id}
      class:bg-white={selected !== type.id}
    >
      <svelte:component this={type.icon} class="mb-1 h-6 w-6" />
      <span>{type.name}</span>
      <span>{type.price}</span>
    </button>
  {/each}
</div> 