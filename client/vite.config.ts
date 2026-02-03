import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const serverUrl = env.VITE_SERVER_URL;

	return {
		plugins: [tailwindcss(), sveltekit()],
		ssr: {
			// 将 axios 打包进 bundle，而不是作为外部依赖
			noExternal: ['axios']
		},
		server: {
			proxy: {
				'/api': {
					target: serverUrl,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				},
				'/uploads': {
					target: serverUrl,
					changeOrigin: true
				}
			}
		}
	};
});
