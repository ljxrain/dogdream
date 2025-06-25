// vite.config.ts
import { sveltekit } from "file:///mnt/d/dream/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///mnt/d/dream/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      strict: false
    },
    watch: {
      // 忽略.env文件变化，防止频繁重启
      ignored: ["**/.env", "**/.env.*", "**/env-*.txt", "**/*.ps1"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvZHJlYW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvZC9kcmVhbS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2QvZHJlYW0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblx0cGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcclxuXHRzZXJ2ZXI6IHtcclxuXHRcdGZzOiB7XHJcblx0XHRcdHN0cmljdDogZmFsc2VcclxuXHRcdH0sXHJcblx0XHR3YXRjaDoge1xyXG5cdFx0XHQvLyBcdTVGRkRcdTc1NjUuZW52XHU2NTg3XHU0RUY2XHU1M0Q4XHU1MzE2XHVGRjBDXHU5NjMyXHU2QjYyXHU5ODkxXHU3RTQxXHU5MUNEXHU1NDJGXHJcblx0XHRcdGlnbm9yZWQ6IFsnKiovLmVudicsICcqKi8uZW52LionLCAnKiovZW52LSoudHh0JywgJyoqLyoucHMxJ11cclxuXHRcdH1cclxuXHR9XHJcbn0pOyAiXSwKICAibWFwcGluZ3MiOiAiO0FBQXNOLFNBQVMsaUJBQWlCO0FBQ2hQLFNBQVMsb0JBQW9CO0FBRTdCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVMsQ0FBQyxVQUFVLENBQUM7QUFBQSxFQUNyQixRQUFRO0FBQUEsSUFDUCxJQUFJO0FBQUEsTUFDSCxRQUFRO0FBQUEsSUFDVDtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsTUFFTixTQUFTLENBQUMsV0FBVyxhQUFhLGdCQUFnQixVQUFVO0FBQUEsSUFDN0Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
