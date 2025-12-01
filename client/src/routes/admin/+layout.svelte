<script lang="ts">
import Sidebar from '$lib/components/admin/Sidebar.svelte';
import Header from '$lib/components/admin/Header.svelte';

let { children } = $props();
</script>

<div class="flex h-screen bg-slate-50 overflow-hidden">
	<!-- 左侧边栏 -->
	<Sidebar />

	<!-- 右侧主内容区 -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- 顶部导航栏 -->
		<Header />

		<!-- 主内容区 -->
		<main class="flex-1 overflow-y-auto">
			<div class="p-6">
				{@render children()}
			</div>
		</main>
	</div>
</div>
