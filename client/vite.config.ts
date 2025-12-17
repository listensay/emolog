import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const serverUrl = env.VITE_SERVER_URL || 'http://localhost:8080';

	return {
		plugins: [tailwindcss(), sveltekit()],
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
