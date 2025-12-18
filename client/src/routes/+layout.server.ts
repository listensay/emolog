import type { LayoutServerLoad } from './$types';
import { getConfigsSSR } from '$lib/server/api';

export const load: LayoutServerLoad = async () => {
	try {
		const response = await getConfigsSSR();
		return {
			siteConfig: response.data
		};
	} catch (err) {
		console.error('加载网站配置失败:', err);
		return {
			siteConfig: {
				site_title: 'Emolog',
				site_description: '一个简洁的博客系统',
				site_icon: '',
				site_logo: '',
				site_keywords: '博客,技术,分享',
				site_footer: '© 2025 Emolog. All rights reserved.'
			}
		};
	}
};
