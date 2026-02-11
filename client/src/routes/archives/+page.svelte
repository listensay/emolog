<script lang="ts">
	import HomeLayout from '$lib/components/layout/HomeLayout.svelte';
	import { FileText } from '@lucide/svelte';
</script>

<svelte:head>
	<title>归档</title>
</svelte:head>

<HomeLayout>
	<div class="bg-white rounded-xl border border-slate-200 p-12 text-center">
		<FileText class="w-16 h-16 text-slate-300 mx-auto mb-4" />
		<h3 class="text-lg font-medium text-slate-900 mb-1">归档</h3>
		<p class="text-slate-500 text-sm">页面建设中...</p>
	</div>
</HomeLayout>
