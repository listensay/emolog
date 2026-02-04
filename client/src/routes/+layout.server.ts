import type { LayoutServerLoad } from './$types';
import { getConfigsSSR, getOwnerProfileSSR, type OwnerProfile } from '$lib/server/api';

export const load: LayoutServerLoad = async () => {
	let siteConfig = {
		site_title: 'Emolog',
		site_description: '一个简洁的博客系统',
		site_icon: '',
		site_logo: '',
		site_keywords: '博客,技术,分享',
		site_footer: '© 2025 Emolog. All rights reserved.'
	};
	let ownerProfile: OwnerProfile | null = null;

	try {
		const configResponse = await getConfigsSSR();
		siteConfig = configResponse.data as typeof siteConfig;
	} catch (err) {
		console.error('加载网站配置失败:', err);
	}

	try {
		const ownerResponse = await getOwnerProfileSSR();
		ownerProfile = ownerResponse.data;
	} catch (err) {
		console.error('加载博主资料失败:', err);
	}

	return {
		siteConfig,
		ownerProfile
	};
};
