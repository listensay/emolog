import type { PageServerLoad } from './$types';
import { getPostListSSR } from '$lib/server/api';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const pageSize = 10;

	try {
		const response = await getPostListSSR(page, pageSize);
		return {
			posts: response.data.list,
			total: response.data.total,
			page: response.data.page,
			pageSize: response.data.pageSize
		};
	} catch (err) {
		console.error('加载文章列表失败:', err);
		return {
			posts: [],
			total: 0,
			page: 1,
			pageSize: 10
		};
	}
};
