import type { PageServerLoad } from './$types';
import { getPostSSR } from '$lib/server/api';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const postId = Number(params.id);

	if (isNaN(postId)) {
		throw error(400, '无效的文章ID');
	}

	try {
		const response = await getPostSSR(postId);
		return {
			post: response.data
		};
	} catch (err: any) {
		console.error('加载文章失败:', err);
		throw error(404, err.message || '文章不存在');
	}
};
