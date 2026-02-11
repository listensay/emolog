<script lang="ts">
import SidebarLeft from '$lib/components/admin/SidebarLeft.svelte';
import SidebarRight from '$lib/components/admin/SidebarRight.svelte';
import Header from '$lib/components/admin/Header.svelte';
import { pageTitle } from '$lib/stores/admin';

let { children } = $props();

const title = $derived($pageTitle ? `${$pageTitle} - 管理后台` : '管理后台');
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="flex h-screen bg-slate-50 overflow-hidden">
	<!-- 左侧边栏 -->
	<SidebarLeft />
	<!-- 主内容区 -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<Header />

		<main class="flex-1 overflow-y-auto">
			<div class="p-6">
				{@render children()}
			</div>
		</main>
	</div>
	<!-- 右侧边栏 -->
	<SidebarRight />
</div>
