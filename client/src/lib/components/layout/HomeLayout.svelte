<script lang="ts">
	import Author from '$lib/components/ui/Author.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { siteConfig } from '$lib/stores/siteConfig';
	import { ownerProfile } from '$lib/stores/ownerProfile';
	import avatar from '$lib/assets/avatar.png';
	import { ChevronLeft } from '@lucide/svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		showBackButton?: boolean;
	}

	let { children, showBackButton = false }: Props = $props();

	const configState = $derived($siteConfig);
	const profileState = $derived($ownerProfile);

	function goBack() {
		history.back();
	}
</script>

<div class="flex flex-col min-h-screen">
	<!-- 移动端顶部栏 -->
	<header class="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
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
	<div class="flex-1 w-full max-w-[800px] mx-auto px-4 lg:px-0">
		<!-- 资料区域 -->
		<div class="relative mt-6 rounded-t-xl overflow-hidden">
			<!-- 背景图 -->
			{#if profileState.profile.profileBackground}
				<div class="absolute inset-0">
					<img
						src={profileState.profile.profileBackground}
						alt="背景图"
						class="w-full h-full object-cover grayscale-30 brightness-90"
					/>
					<div class="absolute inset-0 bg-black/30"></div>
				</div>
			{:else}
				<div class="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500"></div>
			{/if}

			<!-- 资料内容 -->
			<div class="relative z-10 py-10 px-4">
				<Author />

				<!-- 用户 Links -->
				{#if profileState.profile.links && profileState.profile.links.length > 0}
					<div class="flex justify-center gap-3 mt-4 flex-wrap">
						{#each profileState.profile.links.sort((a, b) => a.order - b.order) as link}
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								class="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white hover:shadow-md transition-all"
								title={link.name}
							>
								{#if link.icon}
									<img src={link.icon} alt={link.name} class="w-6 h-6 rounded object-cover" />
								{:else}
									<div class="w-6 h-6 rounded bg-slate-300 flex items-center justify-center text-xs text-slate-600">
										{link.name.charAt(0)}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div>
			<Menu />
		</div>

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
