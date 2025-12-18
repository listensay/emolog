<script lang="ts">
import './layout.css';
import favicon from '$lib/assets/favicon.svg';
import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
import { siteConfig } from '$lib/stores/siteConfig';
import { onMount } from 'svelte';

let { children } = $props();

const configState = $derived($siteConfig);

onMount(() => {
	siteConfig.load();
});
</script>

<svelte:head>
	<title>{configState.config.site_title}</title>
	<meta name="description" content={configState.config.site_description} />
	<meta name="keywords" content={configState.config.site_keywords} />
	{#if configState.config.site_icon}
		<link rel="icon" href={configState.config.site_icon} />
	{:else}
		<link rel="icon" href={favicon} />
	{/if}
</svelte:head>

<ToastContainer />

<div class="bg-slate-100 min-h-screen">
	{@render children()}
</div>