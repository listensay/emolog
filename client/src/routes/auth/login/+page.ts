import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// 检查是否已登录
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token');
		if (token) {
			// 已登录,重定向到admin页面
			throw redirect(302, '/admin');
		}
	}
};
