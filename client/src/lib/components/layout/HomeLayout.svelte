<script lang="ts">
	import Author from '$lib/components/ui/Author.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';
	import { siteConfig } from '$lib/stores/siteConfig';

	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const configState = $derived($siteConfig);
</script>

<div class="flex flex-col min-h-screen">
	<div class="flex flex-1 w-[1200px] mx-auto">
		<!-- 侧边栏 -->
		<aside class="sticky top-0 h-screen w-64 shrink-0">
			<div class="pt-20 mb-5">
				<Author />
			</div>
			<Menu />
		</aside>

		<!-- 主内容区 -->
		<main class="flex-1 p-6 overflow-auto">
			{@render children()}
		</main>
	</div>

	<!-- 页脚 -->
	{#if configState.config.site_footer}
		<footer class="w-full py-6 border-t border-slate-200 bg-white">
			<div class="w-[1200px] mx-auto text-center text-sm text-slate-500">
				{@html configState.config.site_footer}
			</div>
		</footer>
	{/if}
</div>
