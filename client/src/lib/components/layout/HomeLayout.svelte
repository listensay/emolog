<script lang="ts">
	import Profile from '$lib/components/layout/Profile.svelte';
	import { siteConfig } from '$lib/stores/siteConfig';
	import avatar from '$lib/assets/avatar.png';
	import { ChevronLeft } from '@lucide/svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showBackButton?: boolean;
	}

	let { children, showBackButton = false }: Props = $props();

	const configState = $derived($siteConfig);

	function goBack() {
		history.back();
	}
</script>

<div class="flex flex-col min-h-screen">
	<!-- 移动端顶部栏 -->
	<header class="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 z-[999]">
		<div class="flex items-center justify-between px-4 py-3">
			{#if showBackButton}
				<button onclick={goBack} class="flex items-center gap-1 text-slate-600">
					<ChevronLeft class="w-5 h-5" />
					<span>返回</span>
				</button>
			{:else}
				<div class="w-16"></div>
			{/if}
			<a href="/" class="flex items-center gap-2">
				{#if configState.config.site_logo}
					<img class="w-8 h-8 rounded-full" src={configState.config.site_logo} alt={configState.config.site_title}>
				{:else}
					<img class="w-8 h-8 rounded-full" src={avatar} alt={configState.config.site_title}>
				{/if}
				<span class="font-medium text-slate-900">{configState.config.site_title}</span>
			</a>
			<div class="w-16"></div>
		</div>
	</header>

	<!-- 用户资料 -->
	<div>
			<Profile />
		</div>
	<div class="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-0">


		<!-- 主内容区 -->
		<main class="flex-1 py-6 lg:p-6 lg:px-0 overflow-auto">
			{@render children()}
		</main>
	</div>

	<!-- 页脚 -->
	{#if configState.config.site_footer}
		<footer class="w-full py-6 px-4">
			<div class="max-w-[1200px] mx-auto text-center text-sm text-slate-500">
				{@html configState.config.site_footer}
			</div>
		</footer>
	{/if}
</div>
