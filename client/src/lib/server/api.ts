import { env } from '$env/dynamic/private';

/**
 * 服务端 API 基础 URL
 * SSR 时直接访问后端服务器
 */
const getServerApiUrl = () => {
	// 优先使用私有环境变量
	return env.VITE_SERVER_URL;
};

/**
 * 服务端 fetch 封装
 * 用于 SSR 数据加载
 */
export async function serverFetch<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const baseUrl = getServerApiUrl();
	const url = `${baseUrl}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	// 检查业务响应
	if (data.success === false) {
		throw new Error(data.message || '请求失败');
	}

	return data;
}

/**
 * 获取文章详情 (SSR)
 */
export async function getPostSSR(id: number) {
	return serverFetch<{ data: any; success: boolean }>(`/post/${id}`);
}

/**
 * 获取文章列表 (SSR)
 */
export async function getPostListSSR(page = 1, pageSize = 10) {
	return serverFetch<{ data: { list: any[]; total: number; page: number; pageSize: number }; success: boolean }>(
		`/post?page=${page}&pageSize=${pageSize}`
	);
}

/**
 * 获取网站配置 (SSR)
 */
export async function getConfigsSSR() {
	return serverFetch<{ data: Record<string, string>; success: boolean }>('/config');
}
