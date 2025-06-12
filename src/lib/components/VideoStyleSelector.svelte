<script lang="ts">
  let selectedStyle = '智能推荐';

  const styles = [
      { name: '智能推荐', image: 'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { name: '电影质感', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { name: '动漫', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { name: '像素复古', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { name: '赛博朋克', image: 'https://images.unsplash.com/photo-1605600659453-719282b41e22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { name: '粘土定格', image: 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];
</script>

<div class="relative">
  <div class="flex space-x-3 overflow-x-auto pb-3">
    {#each styles as style}
      <button 
        on:click={() => selectedStyle = style.name}
        class="w-28 flex-shrink-0 snap-start">
        <div 
          class="h-24 w-28 overflow-hidden rounded-lg border-2 bg-gray-200"
          class:border-indigo-500={selectedStyle === style.name}
          class:border-transparent={selectedStyle !== style.name}
        >
          <img src={style.image} alt={style.name} class="h-full w-full object-cover" />
        </div>
        <p 
          class="mt-1 text-center text-xs font-medium"
          class:text-indigo-600={selectedStyle === style.name}
          class:text-gray-700={selectedStyle !== style.name}
        >
          {style.name}
        </p>
      </button>
    {/each}
  </div>
</div> 