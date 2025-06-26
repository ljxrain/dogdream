import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 3000,
		fs: {
			strict: false
		},
		// WSL环境优化配置
		watch: {
			usePolling: true,
			interval: 300,
			// 确保监视所有相关文件
			ignored: ['!**/node_modules/**']
		},
		// HMR配置
		hmr: {
			port: 3001,
			host: 'localhost'
		}
	},
	// 优化依赖处理
	optimizeDeps: {
		include: ['lucide-svelte']
	},
	// 禁用构建监视
	build: {
		watch: null
	},
	// 减少日志噪音
	logLevel: 'warn'
}); 