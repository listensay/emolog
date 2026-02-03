import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// 代理 /uploads 路径到后端服务器
	if (event.url.pathname.startsWith('/uploads')) {
		const serverUrl = env.SERVER_URL || 'http://127.0.0.1:8088';
		const targetUrl = `${serverUrl}${event.url.pathname}`;

		const response = await fetch(targetUrl, {
			method: event.request.method,
			headers: event.request.headers
		});

		return new Response(response.body, {
			status: response.status,
			headers: response.headers
		});
	}

	return resolve(event);
};
