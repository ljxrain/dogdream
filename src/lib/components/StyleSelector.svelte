<script lang="ts">
  let selectedStyle = '吉卜力风格';

  const styles = [
    { name: '吉卜力风格', image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '超级英雄', image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '乐高风格', image: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '迪士尼风格', image: 'https://images.unsplash.com/photo-1608889335257-e928d837457e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '水墨画风格', image: 'https://images.unsplash.com/photo-1617503752587-97d2103a96ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '皮克斯风格', image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '油画风格', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: '3D卡通', image: 'https://images.unsplash.com/photo-1634987189829-78d3d2f6b649?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];
</script>

<div class="relative">
  <div class="flex space-x-3 overflow-x-auto pb-3">
    {#each styles as style}
      <button 
        on:click={() => selectedStyle = style.name}
        class="w-28 flex-shrink-0 snap-start">
        <div 
          class="h-24 w-28 overflow-hidden rounded-lg border bg-gray-200"
          class:border-indigo-500={selectedStyle === style.name}
          class:border-transparent={selectedStyle !== style.name}
          class:ring={selectedStyle === style.name}
          class:ring-indigo-300={selectedStyle === style.name}
          class:ring-offset-2={selectedStyle === style.name}
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