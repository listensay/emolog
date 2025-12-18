<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getCategoryList, deleteCategory, CategoryType } from '$lib/api/category';
	import type { Category } from '$lib/api/category';
	import { onMount } from 'svelte';

	let categories: Category[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedCategories = $state<number[]>([]);
	let selectedType = $state<CategoryType | ''>('');

	const filteredCategories = $derived(
		categories.filter((category) => {
			const matchSearch =
				searchQuery === '' ||
				category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(category.description || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		isLoading = true;
		try {
			const response = await getCategoryList(
				currentPage,
				pageSize,
				selectedType || undefined
			);
			categories = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载分类失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleTypeChange() {
		currentPage = 1;
		selectedCategories = [];
		loadCategories();
	}

	function handleSelectAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedCategories = filteredCategories.map((c) => c.id);
		} else {
			selectedCategories = [];
		}
	}

	function handleSelectCategory(id: number) {
		if (selectedCategories.includes(id)) {
			selectedCategories = selectedCategories.filter((c) => c !== id);
		} else {
			selectedCategories = [...selectedCategories, id];
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这个分类吗?')) {
			try {
				await deleteCategory(id);
				categories = categories.filter((c) => c.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedCategories.length === 0) {
			toast.warning('请先选择要删除的分类');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedCategories.length} 个分类吗?`)) {
			try {
				await Promise.all(selectedCategories.map((id) => deleteCategory(id)));
				categories = categories.filter((c) => !selectedCategories.includes(c.id));
				selectedCategories = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<div class="space-y-6">
	<!-- 页面标题 -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">分类管理</h1>
			<p class="text-sm text-slate-500 mt-1">管理你的所有分类</p>
		</div>
		<Button onclick={() => goto('/admin/categories/new')}>
			<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				></path>
			</svg>
			新建分类
		</Button>
	</div>

	<!-- 搜索和筛选 -->
	<div class="bg-white rounded-xl  border border-slate-200 p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- 搜索框 -->
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="搜索分类名称或描述..."
						class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
					/>
					<svg
						class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
				</div>
			</div>

			<!-- 类型筛选 -->
			<div class="w-40">
				<select
					bind:value={selectedType}
					onchange={handleTypeChange}
					class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
				>
					<option value="">全部类型</option>
					<option value={CategoryType.POST}>文章分类</option>
					<option value={CategoryType.IMAGE}>图片分类</option>
				</select>
			</div>

			<!-- 批量操作 -->
			{#if selectedCategories.length > 0}
				<Button variant="outline" onclick={handleBatchDelete} class="text-red-600 border-red-300">
					删除选中 ({selectedCategories.length})
				</Button>
			{/if}
		</div>
	</div>

	<!-- 分类列表 -->
	<div class="bg-white rounded-xl  border border-slate-200 overflow-hidden">
		<div class="overflow-x-auto">
			{#if isLoading}
				<div class="px-6 py-12 text-center text-slate-500">
					<p>加载中...</p>
				</div>
			{:else if filteredCategories.length === 0}
				<div class="px-6 py-12 text-center text-slate-500">
					<div class="flex flex-col items-center">
						<svg
							class="w-16 h-16 text-slate-300 mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							></path>
						</svg>
						<p class="text-lg font-medium">暂无分类</p>
						<p class="text-sm mt-1">创建你的第一个分类吧!</p>
					</div>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-slate-50 border-b border-slate-200">
						<tr>
							<th class="px-6 py-3 text-left">
								<input
									type="checkbox"
									onchange={handleSelectAll}
									checked={selectedCategories.length === filteredCategories.length &&
										filteredCategories.length > 0}
									class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
								/>
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								名称
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								类型
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								描述
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								排序
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								创建时间
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
							>
								操作
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each filteredCategories as category (category.id)}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<input
										type="checkbox"
										checked={selectedCategories.includes(category.id)}
										onchange={() => handleSelectCategory(category.id)}
										class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
									/>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center">
										{#if category.icon}
											<span class="mr-2">{category.icon}</span>
										{/if}
										<span class="text-sm font-medium text-slate-900">{category.name}</span>
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {category.type === CategoryType.POST ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}">
										{category.type === CategoryType.POST ? '文章' : '图片'}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-slate-600 max-w-xs truncate">
										{category.description || '-'}
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-slate-600">{category.order}</span>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-slate-600">{formatDate(category.createdAt)}</div>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<button
											onclick={() => goto(`/admin/categories/${category.id}`)}
											class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
										>
											编辑
										</button>
										<button
											onclick={() => handleDelete(category.id)}
											class="text-red-600 hover:text-red-900 text-sm font-medium"
										>
											删除
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<!-- 分页 -->
		{#if !isLoading && filteredCategories.length > 0}
			<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
				<div class="text-sm text-slate-600">
					显示 {filteredCategories.length} / {total} 条结果
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						disabled={currentPage === 1}
						onclick={() => {
							currentPage--;
							loadCategories();
						}}
					>
						上一页
					</Button>
					<Button
						variant="outline"
						disabled={currentPage * pageSize >= total}
						onclick={() => {
							currentPage++;
							loadCategories();
						}}
					>
						下一页
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
