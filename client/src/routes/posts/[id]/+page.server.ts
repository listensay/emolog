import type { PageServerLoad } from './$types';
import { getPostSSR } from '$lib/server/api';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	const postId = Number(params.id);

	if (isNaN(postId)) {
		throw error(400, '无效的文章ID');
	}

	// 获取父布局的数据（包含 siteConfig）
	const parentData = await parent();

	try {
		const response = await getPostSSR(postId);
		return {
			post: response.data,
			siteConfig: parentData.siteConfig
		};
	} catch (err: any) {
		console.error('加载文章失败:', err);
		throw error(404, err.message || '文章不存在');
	}
};
