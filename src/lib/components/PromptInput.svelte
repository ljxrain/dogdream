 <script lang="ts">
  import { Mic } from 'lucide-svelte';
</script>

<div class="relative">
  <textarea 
    rows="3" 
    placeholder="描述您想要的效果，如：我希望照片中的我变成一位穿着太空服的宇航员，背景是璀璨的星空..." 
    class="w-full rounded-lg border border-gray-300 p-3 pr-28 text-sm"
  ></textarea>
  <button class="absolute right-2 top-2 flex h-10 items-center justify-center rounded-full bg-indigo-100 px-3 text-indigo-600 transition-colors hover:bg-indigo-200">
    <Mic class="mr-1 h-5 w-5" />
    <span class="text-xs font-medium">语音输入</span>
  </button>
</div>