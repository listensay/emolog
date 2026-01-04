<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getPageList, deletePage, getPageTypeOptions } from '$lib/api/page';
	import type { Page } from '$lib/api/page';
	import { onMount } from 'svelte';
	import { Eye, Heart } from '@lucide/svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let pages: Page[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedPages = $state<number[]>([]);

	const pageTypeOptions = getPageTypeOptions();

	$effect(() => {
		pageTitle.set('页面管理');
		pageSubtitle.set('管理你的所有页面');
	});

	const filteredPages = $derived(
		pages.filter((page) => {
			const matchSearch =
				searchQuery === '' ||
				page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(page.author?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadPages();
	});

	async function loadPages() {
		isLoading = true;
		try {
			const response = await getPageList(currentPage, pageSize);
			pages = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载页面失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这个页面吗?')) {
			try {
				await deletePage(id);
				pages = pages.filter((p) => p.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedPages.length === 0) {
			toast.warning('请先选择要删除的页面');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedPages.length} 个页面吗?`)) {
			try {
				await Promise.all(selectedPages.map((id) => deletePage(id)));
				pages = pages.filter((p) => !selectedPages.includes(p.id));
				selectedPages = [];
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

	function getPageTypeLabel(pageType: string) {
		const option = pageTypeOptions.find((opt) => opt.value === pageType);
		return option ? option.label : pageType;
	}
</script>

<AdminPage
	createUrl="/admin/pages/new"
	createText="新建页面"
	bind:searchQuery
	searchPlaceholder="搜索页面标题或作者..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedPages.length}
>
	<AdminTable items={filteredPages} {isLoading} bind:selectedIds={selectedPages} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
				标题
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				页面类型
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				状态
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				数据
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				作者
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				创建时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(page)}
			<td class="px-6 py-4">
				<div class="text-sm font-medium text-slate-900 line-clamp-1" title={page.title}>{page.title}</div>
				<div class="text-xs text-slate-500 mt-1 line-clamp-1" title={page.description}>{page.description}</div>
			</td>
			<td class="px-6 py-4">
				<Badge variant="info">
					{getPageTypeLabel(page.pageType)}
				</Badge>
			</td>
			<td class="px-6 py-4">
				<Badge variant={page.isDeleted ? 'danger' : 'success'}>
					{page.isDeleted ? '已删除' : '已发布'}
				</Badge>
			</td>
			<td class="px-6 py-4">
				<div class="text-xs text-slate-600 flex items-center gap-3">
					<div class="flex items-center gap-1">
						<Eye class="w-3.5 h-3.5" />
						{page.views}
					</div>
					<div class="flex items-center gap-1">
						<Heart class="w-3.5 h-3.5" />
						{page.likes}
					</div>
				</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{page.author?.username || '未知'}</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(page.createdAt)}</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => goto(`/admin/pages/${page.id}`)}
						class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
					>
						编辑
					</button>
					<button
						onclick={() => handleDelete(page.id)}
						class="text-red-600 hover:text-red-900 text-sm font-medium"
					>
						删除
					</button>
				</div>
			</td>
		{/snippet}
	</AdminTable>
</AdminPage>
