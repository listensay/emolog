<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { getLinkList, deleteLink, updateLink, createLink } from '$lib/api/link';
	import type { Link } from '$lib/api/link';
	import { onMount } from 'svelte';
	import AdminPage from '$lib/components/admin/AdminPage.svelte';
	import AdminTable from '$lib/components/admin/AdminTable.svelte';
	import EditModal from '$lib/components/admin/EditModal.svelte';
	import { pageTitle, pageSubtitle } from '$lib/stores/admin';

	let links: Link[] = $state([]);
	let isLoading = $state(false);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let total = $state(0);

	let searchQuery = $state('');
	let selectedItems = $state<number[]>([]);

	// 编辑弹窗
	let showEditModal = $state(false);
	let editingItem = $state<Link | null>(null);

	// 新建弹窗
	let showCreateModal = $state(false);
	let newItem = $state({ name: '', url: '', icon: '', description: '', order: 0 });

	$effect(() => {
		pageTitle.set('友情链接');
		pageSubtitle.set('管理你的友情链接');
	});

	const filteredItems = $derived(
		links.filter((item) => {
			const matchSearch =
				searchQuery === '' ||
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.url.toLowerCase().includes(searchQuery.toLowerCase());
			return matchSearch;
		})
	);

	const editFields = [
		{ name: 'name', label: '链接名称', type: 'text' as const, required: true },
		{ name: 'url', label: '链接地址', type: 'text' as const, required: true },
		{ name: 'icon', label: '图标', type: 'image' as const, hint: '可选，选择图标图片' },
		{ name: 'description', label: '描述', type: 'textarea' as const, rows: 2, hint: '可选，简短描述' },
		{ name: 'order', label: '排序', type: 'number' as const, min: 0, hint: '数字越小越靠前' }
	];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		isLoading = true;
		try {
			const response = await getLinkList(currentPage, pageSize);
			links = response.data.list;
			total = response.data.total;
		} catch (error) {
			toast.error('加载友情链接失败');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete(id: number) {
		if (confirm('确定要删除这个友情链接吗?')) {
			try {
				await deleteLink(id);
				links = links.filter((t) => t.id !== id);
				toast.success('删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	async function handleBatchDelete() {
		if (selectedItems.length === 0) {
			toast.warning('请先选择要删除的友情链接');
			return;
		}
		if (confirm(`确定要删除选中的 ${selectedItems.length} 个友情链接吗?`)) {
			try {
				await Promise.all(selectedItems.map((id) => deleteLink(id)));
				links = links.filter((t) => !selectedItems.includes(t.id));
				selectedItems = [];
				toast.success('批量删除成功');
			} catch (error) {
				toast.error('删除失败');
				console.error(error);
			}
		}
	}

	function openEditModal(item: Link) {
		editingItem = { ...item };
		showEditModal = true;
	}

	async function handleEditSubmit(data: Link) {
		if (!editingItem) return;
		await updateLink(editingItem.id, {
			name: data.name,
			url: data.url,
			icon: data.icon || undefined,
			description: data.description || undefined,
			order: data.order
		});
		await loadData();
	}

	async function handleCreateSubmit(data: typeof newItem) {
		await createLink({
			name: data.name,
			url: data.url,
			icon: data.icon || undefined,
			description: data.description || undefined,
			order: data.order || 0
		});
		await loadData();
		newItem = { name: '', url: '', icon: '', description: '', order: 0 };
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('zh-CN');
	}
</script>

<AdminPage
	createText="新建友链"
	onCreate={() => (showCreateModal = true)}
	bind:searchQuery
	searchPlaceholder="搜索链接名称或地址..."
	{total}
	bind:currentPage
	bind:pageSize
	onBatchDelete={handleBatchDelete}
	selectedCount={selectedItems.length}
>
	<AdminTable items={filteredItems} {isLoading} bind:selectedIds={selectedItems} itemKey="id">
		{#snippet header()}
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				名称
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
				链接
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

		{#snippet row(item)}
			<td class="px-6 py-4">
				<div class="flex items-center gap-2">
					{#if item.icon}
						<img src={item.icon} alt={item.name} class="w-6 h-6 rounded object-cover" />
					{:else}
						<div class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">
							{item.name.charAt(0)}
						</div>
					{/if}
					<div>
						<div class="text-sm font-medium text-slate-900">{item.name}</div>
						{#if item.description}
							<div class="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</div>
						{/if}
					</div>
				</div>
			</td>
			<td class="px-6 py-4">
				<a href={item.url} target="_blank" rel="noopener noreferrer" class="text-sm text-emerald-600 hover:underline truncate max-w-[200px] block">
					{item.url}
				</a>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{item.order}</div>
			</td>
			<td class="px-6 py-4">
				<div class="text-sm text-slate-600">{formatDate(item.createdAt)}</div>
			</td>
			<td class="px-6 py-4 text-right">
				<div class="flex items-center justify-end gap-2">
					<button
						onclick={() => openEditModal(item)}
						class="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
					>
						编辑
					</button>
					<button
						onclick={() => handleDelete(item.id)}
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
	title="编辑友情链接"
	data={editingItem}
	fields={editFields}
	onSubmit={handleEditSubmit}
	onClose={() => {}}
/>

<!-- 新建弹窗 -->
<EditModal
	bind:open={showCreateModal}
	title="新建友情链接"
	data={newItem}
	fields={editFields}
	onSubmit={handleCreateSubmit}
	onClose={() => {}}
/>
