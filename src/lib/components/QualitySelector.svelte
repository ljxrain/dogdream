<script lang="ts">
  type Quality = 'normal' | 'hd' | 'super';
  
  let selected: Quality = 'normal';

  const qualities = [
    { id: 'normal', name: '普通', price: '¥0.30' },
    { id: 'hd', name: '高清', price: '¥1.00' },
    { id: 'super', name: '超清', price: '¥3.00' },
  ];

  function selectQuality(quality: Quality) {
    selected = quality;
  }
</script>

<div class="grid grid-cols-3 gap-2">
  {#each qualities as quality}
    <button 
      on:click={() => selectQuality(quality.id as Quality)}
      class="rounded-lg border py-2 text-center text-xs"
      class:border-indigo-500={selected === quality.id}
      class:text-indigo-600={selected === quality.id}
      class:bg-indigo-50={selected === quality.id}
      class:border-gray-300={selected !== quality.id}
      class:text-gray-600={selected !== quality.id}
      class:bg-white={selected !== quality.id}
    >
      <div class="flex flex-col">
        <span class="font-semibold">{quality.name}</span>
        <span>{quality.price}</span>
      </div>
    </button>
  {/each}
</div> 