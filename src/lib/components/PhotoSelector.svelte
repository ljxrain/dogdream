<script lang="ts">
  import { Camera, FolderOpen } from 'lucide-svelte';
  
  let imageUrl: string | null = null;

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageUrl = e.target.result as string;
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  function handleChangePhoto() {
    // This could trigger the file input programmatically
    const fileInput = document.getElementById('photoUpload');
    fileInput?.click();
  }
</script>

<div class="block w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
  {#if imageUrl}
    <!-- Preview Area -->
    <div class="relative h-36 w-full">
      <img src={imageUrl} class="h-full w-full object-cover" alt="已选择的照片" />
      <button on:click={handleChangePhoto} class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
        <Camera class="h-4 w-4" />
      </button>
    </div>
  {:else}
    <!-- Select Area -->
    <div class="flex h-36 flex-col items-center justify-center bg-white">
      <Camera class="mb-2 h-8 w-8 text-gray-400" />
      <p class="mb-3 text-sm text-gray-500">请选择照片来源</p>
      <div class="flex space-x-3">
        <button class="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs text-white">
          <Camera class="mr-1 h-3 w-3" /> 拍照
        </button>
        <label for="photoUpload" class="flex cursor-pointer items-center rounded-lg bg-gray-200 px-4 py-2 text-xs text-gray-700">
          <FolderOpen class="mr-1 h-3 w-3" /> 相册
          <input type="file" accept="image/*" class="hidden" id="photoUpload" on:change={handleFileSelect} />
        </label>
      </div>
    </div>
  {/if}
</div> 