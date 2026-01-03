<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getCategoryList, deleteCategory, CategoryType } from '$lib/api/category';
	import type { Category } from '$lib/api/category';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let categories: Category[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedCategories = $state<number[]>([]);
	let selectedType = $state<CategoryType | ''>('');

	$effect(() => {
		pageTitle.set('分类管理');
		pageSubtitle.set('管理你的所有分类');
	});

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

<AdminPage
	createUrl="/admin/categories/new"
	createText="新建分类"
	bind:searchQuery
	searchPlaceholder="搜索分类名称或描述..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedCategories.length}
>
	{#snippet filters()}
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
	{/snippet}

	<AdminTable items={filteredCategories} {isLoading} bind:selectedIds={selectedCategories} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				名称
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				类型
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				描述
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				排序
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				创建时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(category)}
			<td class="px-6 py-4">
				<div class="flex items-center">
					{#if category.icon}
						<span class="mr-2">{category.icon}</span>
					{/if}
					<span class="text-sm font-medium text-slate-900">{category.name}</span>
				</div>
			</td>
			<td class="px-6 py-4">
				<Badge variant={category.type === CategoryType.POST ? 'info' : 'purple'}>
					{category.type === CategoryType.POST ? '文章' : '图片'}
				</Badge>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600 max-w-xs truncate" title={category.description}>
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
		{/snippet}
	</AdminTable>
</AdminPage>
