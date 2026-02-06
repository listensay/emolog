<script lang="ts" generics="T">
	import { FileText } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		items = [],
		isLoading = false,
		itemKey = 'id',
		selectable = true,
		selectedIds = $bindable([]),
		header,
		row,
		empty
	}: {
		items: T[];
		isLoading?: boolean;
		itemKey?: keyof T;
		selectable?: boolean;
		selectedIds?: any[];
		header: Snippet;
		row: Snippet<[T]>;
		empty?: Snippet;
	} = $props();

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = items.map((item) => item[itemKey]);
		} else {
			selectedIds = [];
		}
	}

	function handleSelectRow(id: any) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}
</script>

<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
	<div class="overflow-x-auto relative min-h-[400px]">
		{#if isLoading}
			<div class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
				<div class="flex flex-col items-center gap-2">
					<div class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm text-slate-500">加载中...</p>
				</div>
			</div>
		{/if}

		{#if !isLoading && items.length === 0}
			<div class="flex flex-col items-center justify-center h-[400px] text-slate-500">
				{#if empty}
					{@render empty()}
				{:else}
					<FileText class="w-16 h-16 text-slate-300 mb-4" />
					<p class="text-lg font-medium">暂无数据</p>
				{/if}
			</div>
		{:else}
			<table class="w-full">
				<thead class="bg-slate-50 border-b border-slate-200">
					<tr>
						{#if selectable}
							<th class="w-12 px-6 py-3 text-left">
								<input
									type="checkbox"
									onchange={handleSelectAll}
									checked={items.length > 0 && selectedIds.length === items.length}
									class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 checked:bg-emerald-600 checked:border-emerald-600"
								/>
							</th>
						{/if}
						{@render header()}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#each items as item (item[itemKey])}
						<tr class="hover:bg-slate-50 transition-colors">
							{#if selectable}
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedIds.includes(item[itemKey])}
										onchange={() => handleSelectRow(item[itemKey])}
										class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 checked:bg-emerald-600 checked:border-emerald-600"
									/>
								</td>
							{/if}
							{@render row(item)}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
