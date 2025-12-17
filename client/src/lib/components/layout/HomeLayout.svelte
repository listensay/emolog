<script lang="ts">
	import Author from '$lib/components/ui/Author.svelte';
	import Menu from '$lib/components/ui/Menu.svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex min-h-screen w-[1200px] mx-auto">
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
