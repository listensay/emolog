<script lang="ts">
import './layout.css';
import favicon from '$lib/assets/favicon.svg';
import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
import { siteConfig } from '$lib/stores/siteConfig';
import { onMount } from 'svelte';
import type { SiteConfig } from '$lib/api/config';

interface Props {
	data: {
		siteConfig: SiteConfig;
	};
	children: any;
}

let { data, children }: Props = $props();

// 用 SSR 数据初始化 store
const configState = $derived($siteConfig);

// 在客户端用 SSR 数据初始化 store
onMount(() => {
	if (data.siteConfig) {
		siteConfig.updateConfig(data.siteConfig);
	}
});

// SSR 渲染时直接使用 data，客户端使用 store
const currentConfig = $derived(configState.isLoaded ? configState.config : data.siteConfig);
</script>

<svelte:head>
	<title>{currentConfig.site_title}</title>
	<meta name="description" content={currentConfig.site_description} />
	<meta name="keywords" content={currentConfig.site_keywords} />
	{#if currentConfig.site_icon}
		<link rel="icon" href={currentConfig.site_icon} />
	{:else}
		<link rel="icon" href={favicon} />
	{/if}
</svelte:head>

<ToastContainer />

<div class="bg-slate-100 min-h-screen">
	{@render children()}
</div>