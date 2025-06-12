<script lang="ts">
  import { Camera, Image as ImageIcon } from 'lucide-svelte';
</script>

<div class="grid grid-cols-2 gap-3">
  <button class="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-100">
    <Camera class="mb-1 h-8 w-8 text-gray-400" />
    <p class="text-xs text-gray-500">拍摄照片</p>
  </button>
  <button class="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-100">
    <ImageIcon class="mb-1 h-8 w-8 text-gray-400" />
    <p class="text-xs text-gray-500">从相册选择</p>
  </button>
</div> 