<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { goto } from '$app/navigation';
	import { Plus, Search } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		createUrl,
		onCreate,
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
		onCreate?: () => void;
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

	function handleCreate() {
		if (onCreate) {
			onCreate();
		} else if (createUrl) {
			goto(createUrl);
		}
	}
</script>

<div class="space-y-6">
	<!-- 操作栏：按钮组和搜索 -->
	<div class="bg-white rounded-xl border border-slate-200 p-4">
		<div class="flex flex-col md:flex-row gap-4 md:items-center {createUrl || onCreate || (selectedCount > 0 && onBatchDelete) || actions ? 'md:justify-between' : ''}">
			<!-- 左侧：按钮组 -->
			{#if createUrl || onCreate || (selectedCount > 0 && onBatchDelete) || actions}
				<div class="flex items-center gap-3">
					{#if createUrl || onCreate}
						<Button onclick={handleCreate}>
							<Plus class="w-5 h-5 mr-2" />
							{createText}
						</Button>
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
			{/if}

			<!-- 右侧：搜索框和筛选器 -->
			<div class="flex flex-col md:flex-row gap-4 md:items-center">
				{#if filters}
					{@render filters()}
				{/if}

				<!-- 搜索框 -->
				{#if searchQuery !== undefined}
					<div class="w-full md:w-auto md:max-w-2xl relative">
						<Input
							bind:value={searchQuery}
							placeholder={searchPlaceholder}
							class="pl-10"
						/>
						<Search
							class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
						/>
					</div>
				{/if}
			</div>
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
