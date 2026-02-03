import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getAllConfigs } from '$lib/api/config';
import type { SiteConfig } from '$lib/api/config';

interface SiteConfigState {
	isLoaded: boolean;
	config: SiteConfig;
}

const defaultConfig: SiteConfig = {
	site_title: '',
	site_description: '',
	site_icon: '',
	site_logo: '',
	site_keywords: '',
	site_footer: ''
};

function createSiteConfigStore() {
	const { subscribe, set, update } = writable<SiteConfigState>({
		isLoaded: false,
		config: defaultConfig
	});

	return {
		subscribe,
		load: async () => {
			if (!browser) return;

			try {
				const response = await getAllConfigs();
				set({
					isLoaded: true,
					config: { ...defaultConfig, ...response.data }
				});
			} catch (error) {
				console.error('Failed to load site config:', error);
				set({
					isLoaded: true,
					config: defaultConfig
				});
			}
		},
		updateConfig: (newConfig: Partial<SiteConfig>) => {
			update(state => ({
				isLoaded: true,
				config: { ...state.config, ...newConfig }
			}));
		}
	};
}

export const siteConfig = createSiteConfigStore();
