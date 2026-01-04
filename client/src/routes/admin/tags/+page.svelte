<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { getTagList, deleteTag, updateTag, createTag } from '$lib/api/tag';
	import type { Tag } from '$lib/api/tag';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import EditModal from '$lib/components/admin/EditModal.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let tags: Tag[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedTags = $state<number[]>([]);

	// 编辑弹窗
	let showEditModal = $state(false);
	let editingTag = $state<Tag | null>(null);

	// 新建弹窗
	let showCreateModal = $state(false);
	let newTag = $state({ name: '' });

	$effect(() => {
		pageTitle.set('标签管理');
		pageSubtitle.set('管理你的所有标签');
	});

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

	function openEditModal(tag: Tag) {
		editingTag = tag;
		showEditModal = true;
	}

	async function handleEditSubmit(data: Tag) {
		if (!editingTag) return;
		await updateTag(editingTag.id, { name: data.name });
		await loadTags();
	}

	async function handleCreateSubmit(data: { name: string }) {
		await createTag({ name: data.name });
		await loadTags();
		newTag = { name: '' };
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<AdminPage
	createText="新建标签"
	onCreate={() => (showCreateModal = true)}
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
						onclick={() => openEditModal(tag)}
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

<!-- 编辑弹窗 -->
<EditModal
	bind:open={showEditModal}
	title="编辑标签"
	data={editingTag}
	fields={[{ name: 'name', label: '标签名称', type: 'text', required: true }]}
	onSubmit={handleEditSubmit}
	onClose={() => {}}
/>

<!-- 新建弹窗 -->
<EditModal
	bind:open={showCreateModal}
	title="新建标签"
	data={newTag}
	fields={[{ name: 'name', label: '标签名称', type: 'text', required: true }]}
	onSubmit={handleCreateSubmit}
	onClose={() => {}}
/>
