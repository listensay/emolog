<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast';
	import { getTagList, deleteTag } from '$lib/api/tag';
	import type { Tag } from '$lib/api/tag';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let tags: Tag[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedTags = $state<number[]>([]);

	const filteredTags = $derived(
		tags.filter((tag) => {
			const matchSearch =
				searchQuery === '' || tag.name.toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	onMount(async () => {
		await loadTags();
	});

	async function loadTags() {
		isLoading = true;
		try {
			const response = await getTagList(currentPage, pageSize);
			tags = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载标签失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这个标签吗?')) {
			try {
				await deleteTag(id);
				tags = tags.filter((t) => t.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedTags.length === 0) {
			toast.warning('请先选择要删除的标签');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedTags.length} 个标签吗?`)) {
			try {
				await Promise.all(selectedTags.map((id) => deleteTag(id)));
				tags = tags.filter((t) => !selectedTags.includes(t.id));
				selectedTags = [];
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
	title="标签管理"
	subtitle="管理你的所有标签"
	createUrl="/admin/tags/new"
	createText="新建标签"
	bind:searchQuery
	searchPlaceholder="搜索标签名称..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedTags.length}
>
	<AdminTable items={filteredTags} {isLoading} bind:selectedIds={selectedTags} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				名称
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				创建时间
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				更新时间
			</th>
			<th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
				操作
			</th>
		{/snippet}

		{#snippet row(tag)}
			<td class="px-6 py-4">
				<Badge variant="emerald">{tag.name}</Badge>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(tag.createdAt)}</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(tag.updatedAt)}</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => goto(`/admin/tags/${tag.id}`)}
						class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
					>
						编辑
					</button>
					<button
						onclick={() => handleDelete(tag.id)}
						class="text-red-600 hover:text-red-900 text-sm font-medium"
					>
						删除
					</button>
				</div>
			</td>
		{/snippet}
	</AdminTable>
</AdminPage>
