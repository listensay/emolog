<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import { Plus, Search } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		createUrl,
		createText = '新建',
		searchQuery = $bindable(''),
		searchPlaceholder = '搜索...',
		total = 0,
		currentPage = $bindable(1),
		pageSize = $bindable(10),
		onBatchDelete,
		selectedCount = 0,
		filters,
		actions,
		children
	}: {
		createUrl?: string;
		createText?: string;
		searchQuery?: string;
		searchPlaceholder?: string;
		total?: number;
		currentPage?: number;
		pageSize?: number;
		onBatchDelete?: () => void;
		selectedCount?: number;
		filters?: Snippet;
		actions?: Snippet;
		children: Snippet;
	} = $props();

	function handlePageChange(page: number) {
		currentPage = page;
	}
</script>

<div class="space-y-6">
	<!-- 页面标题区域：仅保留操作按钮，因为标题已移至全局 Header -->
	{#if createUrl}
		<div class="flex items-center justify-end">
			<Button onclick={() => goto(createUrl)}>
				<Plus class="w-5 h-5 mr-2" />
				{createText}
			</Button>
		</div>
	{/if}

	<!-- 搜索和筛选 -->
	<div class="bg-white rounded-xl border border-slate-200 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- 搜索框 -->
			{#if searchQuery !== undefined}
				<div class="flex-1 max-w-xl">
					<div class="relative">
						<input
							type="text"
							bind:value={searchQuery}
							placeholder={searchPlaceholder}
							class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
						/>
						<Search
							class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
						/>
					</div>
				</div>
			{/if}

			{#if filters}
				{@render filters()}
			{/if}

			<!-- 批量操作 -->
			{#if selectedCount > 0 && onBatchDelete}
				<Button variant="outline" onclick={onBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedCount})
				</Button>
			{/if}

			{#if actions}
				{@render actions()}
			{/if}
		</div>
	</div>

	<!-- 主内容 -->
	<div>
		{@render children()}
	</div>

	<!-- 分页 -->
	{#if total > 0}
		<div class="bg-white rounded-xl border border-slate-200 px-6 py-4 flex items-center justify-between mt-6">
			<div class="text-sm text-slate-600">
				显示 {Math.min((currentPage - 1) * pageSize + 1, total)} - {Math.min(currentPage * pageSize, total)} 共 {total} 条结果
			</div>
			<div class="flex gap-2">
				<Button
					variant="outline"
					disabled={currentPage === 1}
					onclick={() => handlePageChange(currentPage - 1)}
				>
					上一页
				</Button>
				<Button
					variant="outline"
					disabled={currentPage * pageSize >= total}
					onclick={() => handlePageChange(currentPage + 1)}
				>
					下一页
				</Button>
			</div>
		</div>
	{/if}
</div>
