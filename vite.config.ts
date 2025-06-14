import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			strict: false
		},
		watch: {
			// 忽略.env文件变化，防止频繁重启
			ignored: ['**/.env', '**/.env.*', '**/env-*.txt', '**/*.ps1']
		}
	}
}); 